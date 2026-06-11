const {
	WebhookClient,
	Events,
	Client,
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ButtonStyle,
	SlashCommandBuilder,
	GatewayIntentBits,
} = require('discord.js');

/*
 * Discord.js Client
 *
 * Creates the single shared Client instance used by the entire bot.
 * The enabled gateway intents control which events Discord will send:
 *
 *   - Guilds            — access to guild structures (channels, roles, etc.)
 *   - GuildMessages     — receive messageCreate events in guild channels
 *   - MessageContent    — read the actual text of messages (privileged intent,
 *                         must also be enabled in the Developer Portal)
 *
 * This module re-exports the discord.js classes that app.js needs so
 * that the rest of the codebase imports from one place rather than
 * importing discord.js directly in every file.
 */
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

module.exports = {
	client: client,
	Events: Events,
	ApplicationCommandType: ApplicationCommandType,
	EmbedBuilder: EmbedBuilder,
	WebhookClient: WebhookClient,
	ContextMenuCommandBuilder: ContextMenuCommandBuilder,
	SlashCommandBuilder: SlashCommandBuilder,
	ButtonBuilder: ButtonBuilder,
	ActionRowBuilder: ActionRowBuilder,
	ButtonStyle: ButtonStyle,
};
