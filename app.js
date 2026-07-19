require('dotenv').config();
const Joi = require('joi');
const translate = require('@iamtraction/google-translate');
const ISO6391 = require('iso-639-1');
const LD = require('languagedetect');
const languagedetect = new LD();
const { language_buttons, FLAG_EMOJIS } = require('./discord/embeds/panel');
const { UserPreferences } = require('./discord/helpers/models');
const {
	client,
	Events,
	ApplicationCommandType,
	EmbedBuilder,
	WebhookClient,
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('./discord/helpers/bot');

/*
 * Environment validation
 *
 * Ensures every required variable is present and well-formed before the bot
 * attempts to connect. Discord snowflake IDs must be numeric strings;
 * DB_PORT must be a valid TCP port. `.unknown()` allows the rest of
 * process.env through without complaint.
 */
const envSchema = Joi.object({
	DISCORD_TOKEN: Joi.string().required(),
	WEBHOOK_ID: Joi.string().pattern(/^\d+$/).required(),
	WEBHOOK_TOKEN: Joi.string().required(),
	LOG_GUILD_ID: Joi.string().pattern(/^\d+$/).required(),
	LOG_CHANNEL_ID: Joi.string().pattern(/^\d+$/).required(),
	DISCONNECT_GUILD_ID: Joi.string().pattern(/^\d+$/).required(),
	DISCONNECT_CHANNEL_ID: Joi.string().pattern(/^\d+$/).required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().port().required(),
	DB_NAME: Joi.string().required(),
	DB_USER: Joi.string().required(),
	DB_PASS: Joi.string().required(),
}).unknown();

const { error: envError } = envSchema.validate(process.env);
if (envError) {
	console.error('Environment validation failed:', envError.message);
	process.exit(1);
}

/**
 * Upper bound (in characters) for messages sent to the translation API.
 * Prevents excessively large payloads from reaching Google Translate.
 */
const MAX_TRANSLATE_LENGTH = 5000;

/** Guild ID → `/language` command ID, populated during command registration. */
const languageCommandIds = new Map();

process.on('SIGINT', () => {
	console.log('Received SIGINT. Shutting down...');
	process.exit(0);
});

/*
 * Guild-level application commands, registered in every guild:
 *   1. "Translate Message" — a Message context-menu command (right-click)
 *   2. "/language"         — a slash command that shows the language picker
 *   3. "/forget"           — deletes the user's stored language preference
 */
const newTranslateCommand = new ContextMenuCommandBuilder()
	.setName('Translate Message')
	.setType(ApplicationCommandType.Message)
	.toJSON();

const newLanguageCommand = new SlashCommandBuilder()
	.setName('language')
	.setDescription('Select your preferred language for TranslateBot')
	.toJSON();

const newForgetCommand = new SlashCommandBuilder()
	.setName('forget')
	.setDescription('Delete your stored language preference from TranslateBot')
	.toJSON();

/*
 * ClientReady — fires once after a successful login.
 *
 * Registers the application commands in every cached guild. Existing stale
 * copies are deleted first to avoid duplicates, then all are re-registered
 * with `guild.commands.set()`. The registered `/language` command ID is
 * captured per guild so it can be rendered as a clickable mention later.
 *
 * After registration, a status embed is sent to the dev webhook so we
 * know the bot came online.
 */
client.once(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	client.guilds.cache.forEach(async (guild) => {
		try {
			const commands = await guild.commands.fetch();
			const commandsToDelete = commands.filter((cmd) => ['Translate Message', 'language', 'forget'].includes(cmd.name));
			await Promise.all(commandsToDelete.map((cmd) => guild.commands.delete(cmd.id)));

			const registered = await guild.commands.set([newTranslateCommand, newLanguageCommand, newForgetCommand]);
			const langCmd = registered.find((cmd) => cmd.name === 'language');
			if (langCmd) languageCommandIds.set(guild.id, langCmd.id);
			console.log(`Commands registered for guild: ${guild.name}`);
		} catch (error) {
			console.error(`Error registering commands for guild: ${guild.name}`, error.stack);
		}
	});

	const webhookClient = new WebhookClient({ id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN });

	const embed = new EmbedBuilder()
		.setColor(0x5865f2)
		.setTitle('Bot Status')
		.setDescription(`Bot is ready as: ${client.user.tag}`)
		.setFooter({ text: 'TranslateBot' })
		.setTimestamp();

	await webhookClient.send({ embeds: [embed] });
});

/*
 * GuildCreate — fires when the bot joins a new guild.
 *
 * Registers the same application commands that ClientReady registers
 * for already-cached guilds, so new guilds get commands immediately
 * without requiring a bot restart.
 */
client.on(Events.GuildCreate, async (guild) => {
	try {
		const registered = await guild.commands.set([newTranslateCommand, newLanguageCommand, newForgetCommand]);
		const langCmd = registered.find((cmd) => cmd.name === 'language');
		if (langCmd) languageCommandIds.set(guild.id, langCmd.id);
		console.log(`Commands registered for new guild: ${guild.name}`);
	} catch (error) {
		console.error(`Error registering commands for new guild: ${guild.name}`, error.stack);
	}
});

/*
 * Slash command handler — `/language`
 *
 * Replies ephemerally with the language-picker button panel defined in
 * discord/embeds/panel.js. If the command fires before registration has
 * finished propagating, catches the "Unknown command" Discord API error
 * and asks the user to retry.
 */
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	try {
		const { commandName } = interaction;

		if (commandName === 'language') {
			await interaction.reply({
				content: 'Set your preferred language:',
				components: language_buttons,
				ephemeral: true,
			});
		}

		if (commandName === 'forget') {
			const deleted = await UserPreferences.destroy({ where: { id: interaction.user.id } });
			await interaction.reply({
				content: deleted
					? ':white_check_mark: Your stored language preference has been deleted.'
					: 'You have no stored language preference to delete.',
				ephemeral: true,
			});
		}
	} catch (error) {
		if (error.message.includes('Unknown command')) {
			await interaction.reply({
				content: 'This command is still being registered. Please try again in a few minutes.',
				ephemeral: true,
			});
		} else {
			console.error('An error occurred while processing the interaction:', error.stack);
		}
	}
});

/*
 * Context-menu handler — "Translate Message"
 *
 * Triggered when a user right-clicks a message and selects
 * Apps -> "Translate Message". The flow is:
 *
 *   1. Validate the target message has translatable text content
 *      and is within the MAX_TRANSLATE_LENGTH character limit.
 *   2. Look up the requesting user's preferred language in the DB.
 *      If no preference exists, show the language-picker panel instead.
 *   3. Run local language detection via the `languagedetect` library.
 *      detect() returns an array of [langCode, probability] pairs sorted
 *      by confidence — we take the top result.
 *   4. Short-circuit if the detected language matches the user's preference.
 *   5. Send the text to Google Translate targeting the user's language.
 *   6. Reply with an ephemeral embed showing from/to languages, the
 *      translated text, and the original message, plus a button row with
 *      a jump link, an invite link, and a "How to Configure" helper.
 */
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isContextMenuCommand()) return;

	const targetMessage = interaction.options.getMessage('message');

	if (!targetMessage.content || !targetMessage.content.trim()) {
		await interaction.reply({
			content: 'That message has no text content to translate.',
			ephemeral: true,
		});
		return;
	}

	if (targetMessage.content.length > MAX_TRANSLATE_LENGTH) {
		await interaction.reply({
			content: `Message is too long to translate (max ${MAX_TRANSLATE_LENGTH} characters).`,
			ephemeral: true,
		});
		return;
	}

	const userPref = await UserPreferences.findOne({ where: { id: interaction.user.id } });

	if (!userPref) {
		await interaction.reply({
			content: 'Set your preferred language to automatically translate to with `Apps -> Translate Message`:',
			components: language_buttons,
			ephemeral: true,
		});
		return;
	}

	const targetLang = userPref.lang;

	/*
	 * languagedetect.detect() returns an array of [langCode, probability]
	 * pairs sorted by confidence descending, e.g. [["english", 0.54], ...].
	 * An empty array means detection failed entirely.
	 */
	const detectResult = languagedetect.detect(targetMessage.content);
	const msgLang = detectResult.length > 0 ? detectResult[0][0] : null;

	if (!msgLang) {
		const embed = new EmbedBuilder()
			.setTitle('Translation Error')
			.setColor(0xed4245)
			.addFields({ name: 'Details', value: 'Unable to detect language of message!' })
			.setTimestamp();
		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
		return;
	}

	if (msgLang === targetLang) {
		const embed = new EmbedBuilder()
			.setTitle('Translation Error')
			.setColor(0xed4245)
			.addFields({ name: 'Details', value: 'Message is already in the same language as your own native language!' })
			.setTimestamp();
		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
		return;
	}

	try {
		const translated = await translate(targetMessage.content, { to: targetLang });
		const langName = ISO6391.getName(translated.from.language.iso);

		const flag = FLAG_EMOJIS[translated.from.language.iso] || '';
		const embed = new EmbedBuilder()
			.setTitle(`${flag ? flag + ' ' : ''}${langName} Translation`)
			.setColor(0x5865f2)
			.addFields(
				{ name: 'From', value: langName || 'Unknown', inline: true },
				{ name: 'To', value: ISO6391.getName(targetLang), inline: true },
				{ name: 'Translated Text', value: translated.text },
				{ name: 'Original Message', value: targetMessage.content.slice(0, 1024) },
			)
			.setFooter({ text: 'TranslateBot' })
			.setTimestamp();

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setLabel('Jump to Original').setStyle(ButtonStyle.Link).setURL(targetMessage.url),
			new ButtonBuilder()
				.setLabel('Add to Server')
				.setStyle(ButtonStyle.Link)
				.setURL('https://discord.com/api/oauth2/authorize?client_id=1127004226816573490&permissions=83968&scope=bot'),
			new ButtonBuilder()
				.setCustomId('translatebot_configure')
				.setLabel('How to Configure')
				.setStyle(ButtonStyle.Secondary),
		);

		await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
	} catch (error) {
		console.error('Error during translation:', error.stack);
		await interaction.reply({
			content: 'Sorry, there was an error trying to translate the message. Please try again in a little while.',
			ephemeral: false,
		});
	}
});

/*
 * Button handler — language selection
 *
 * Listens for button presses whose customId starts with "translatebot_lang_".
 * The third segment of the customId (split on "_") is the ISO 639-1 code
 * chosen by the user, e.g. "translatebot_lang_es" -> "es".
 *
 * After validating the code with ISO6391, the handler upserts the user's
 * preference into the DB and confirms the selection ephemerally.
 *
 * A log embed is also sent to the dev logging channel (configured via
 * LOG_GUILD_ID / LOG_CHANNEL_ID) so admins can see adoption. The log
 * gracefully no-ops if the guild or channel isn't in cache.
 */
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isButton()) return;

	if (interaction.customId === 'translatebot_configure') {
		const cmdId = languageCommandIds.get(interaction.guildId);
		const langMention = cmdId ? `</language:${cmdId}>` : '`/language`';
		await interaction.reply({
			content: `Use ${langMention} to set your preferred language. Once set, any message you translate with **Apps → Translate Message** will automatically be translated into that language.`,
			ephemeral: true,
		});
		return;
	}

	if (!interaction.customId.startsWith('translatebot_lang_')) return;

	const langCode = interaction.customId.split('_')[2];

	try {
		if (!ISO6391.validate(langCode)) return;

		await UserPreferences.upsert({ id: interaction.user.id, lang: langCode });
		await interaction.reply({
			content: `:white_check_mark: Your native language has been set to **${ISO6391.getName(langCode)}** (${langCode}).`,
			ephemeral: true,
		});

		const logGuild = client.guilds.cache.get(process.env.LOG_GUILD_ID);
		const logChannel = logGuild?.channels.cache.get(process.env.LOG_CHANNEL_ID);

		if (logChannel) {
			const embed = new EmbedBuilder()
				.setTitle('Language Set')
				.setColor(0x57f287)
				.addFields(
					{ name: 'User', value: interaction.user.toString(), inline: true },
					{ name: 'Guild', value: interaction.guild.name, inline: true },
					{ name: 'Channel', value: interaction.channel.toString(), inline: true },
					{ name: 'Language', value: ISO6391.getName(langCode), inline: true },
				)
				.setThumbnail(interaction.user.avatarURL())
				.setFooter({ text: 'TranslateBot' })
				.setTimestamp();

			await logChannel.send({ embeds: [embed] });
		}
	} catch (e) {
		console.error('Error handling language button:', e.stack);
	}
});

/*
 * Mention-based translation — messageCreate
 *
 * An alternative to the context-menu flow for situations where ephemeral
 * replies aren't possible (e.g. mobile, or when the user wants the
 * translation visible to everyone in the channel).
 *
 * Fires when a user replies to a message while @mentioning the bot.
 * The handler fetches both the reply and the original message it
 * references, then translates the original into the mentioning user's
 * preferred language (falling back to English if no preference is set).
 *
 * Embed field values are sliced to 1024 characters to stay within
 * Discord's embed field value limit.
 *
 * If the user has no language preference saved, a non-ephemeral
 * language-picker panel is sent after the translation so they can set one.
 */
client.on('messageCreate', async (message) => {
	if (message.author.bot) return;
	if (/^[!^%$&]/.test(message.content)) return;

	if (message.reference && message.mentions.has(client.user)) {
		const repliedToMessage = await message.channel.messages.fetch(message.id);
		const originalMessage = await message.channel.messages.fetch(message.reference.messageId);

		if (!originalMessage.content || !originalMessage.content.trim()) {
			await message.reply({ content: 'That message has no text content to translate.' });
			return;
		}

		if (originalMessage.content.length > MAX_TRANSLATE_LENGTH) {
			await message.reply({ content: `Message is too long to translate (max ${MAX_TRANSLATE_LENGTH} characters).` });
			return;
		}

		const recipientPref = await UserPreferences.findOne({ where: { id: message.author.id } });
		const targetLang = recipientPref ? recipientPref.lang : 'en';

		try {
			const translated = await translate(originalMessage.content, { to: targetLang });
			const langName = ISO6391.getName(translated.from.language.iso);

			const embed = new EmbedBuilder()
				.setTitle('Translation')
				.setColor(0x5865f2)
				.addFields(
					{ name: 'Original', value: originalMessage.content.slice(0, 1024), inline: true },
					{ name: 'Translated', value: translated.text.slice(0, 1024), inline: true },
					{ name: 'Detected Language', value: langName || 'Unknown', inline: true },
				)
				.setThumbnail(message.author.avatarURL())
				.setFooter({ text: 'TranslateBot' })
				.setTimestamp();

			await repliedToMessage.reply({ embeds: [embed] });
		} catch (error) {
			console.error('Error during translation:', error.stack);
			await message.reply({
				content: 'Sorry, there was an error trying to translate the message. Please try again in a little while.',
			});
		}

		if (!recipientPref) {
			await message.reply({
				content: 'Set your preferred language to automatically translate to:',
				components: language_buttons,
			});
		}
	}
});

/*
 * Disconnect handler
 *
 * Sends a notification to a designated channel when the bot loses its
 * WebSocket connection. Gracefully no-ops if the guild or channel
 * isn't in cache (e.g. the bot was removed from that server).
 */
client.on('disconnect', () => {
	const guild = client.guilds.cache.get(process.env.DISCONNECT_GUILD_ID);
	const channel = guild?.channels.cache.get(process.env.DISCONNECT_CHANNEL_ID);
	if (channel) {
		channel.send('Bot is going offline!');
	}
});

client.login(process.env.DISCORD_TOKEN);
