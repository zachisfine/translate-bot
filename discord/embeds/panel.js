const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/*
 * Language picker button panel
 *
 * An array of 5 ActionRows, each containing 3 buttons (15 languages total).
 * Displayed ephemerally when a user runs `/language` or is prompted to
 * choose a language before their first translation.
 *
 * Each button's customId follows the pattern "translatebot_lang_[ISO_CODE]"
 * where ISO_CODE is a 2-letter ISO 639-1 language code. The button handler
 * in app.js splits on "_" and takes index [2] to extract the code, then
 * validates it with ISO6391.validate() before saving to the database.
 *
 * Discord limits a message to 5 ActionRows with up to 5 buttons each.
 * Currently 15 of the 25 available slots are used.
 */

const FLAG_EMOJIS = {
	en: '\u{1F1EC}\u{1F1E7}',
	es: '\u{1F1EA}\u{1F1F8}',
	hi: '\u{1F1EE}\u{1F1F3}',
	fr: '\u{1F1EB}\u{1F1F7}',
	de: '\u{1F1E9}\u{1F1EA}',
	it: '\u{1F1EE}\u{1F1F9}',
	zh: '\u{1F1E8}\u{1F1F3}',
	ja: '\u{1F1EF}\u{1F1F5}',
	ko: '\u{1F1F0}\u{1F1F7}',
	pl: '\u{1F1F5}\u{1F1F1}',
	ru: '\u{1F1F7}\u{1F1FA}',
	ar: '\u{1F1F8}\u{1F1E6}',
	nl: '\u{1F1F3}\u{1F1F1}',
	no: '\u{1F1F3}\u{1F1F4}',
	fi: '\u{1F1EB}\u{1F1EE}',
};

const language_buttons = [
	new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('translatebot_lang_en')
			.setLabel('English')
			.setEmoji(FLAG_EMOJIS.en)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_es')
			.setLabel('Spanish')
			.setEmoji(FLAG_EMOJIS.es)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_hi')
			.setLabel('Hindi')
			.setEmoji(FLAG_EMOJIS.hi)
			.setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('translatebot_lang_fr')
			.setLabel('French')
			.setEmoji(FLAG_EMOJIS.fr)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_de')
			.setLabel('German')
			.setEmoji(FLAG_EMOJIS.de)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_it')
			.setLabel('Italian')
			.setEmoji(FLAG_EMOJIS.it)
			.setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('translatebot_lang_zh')
			.setLabel('Chinese')
			.setEmoji(FLAG_EMOJIS.zh)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_ja')
			.setLabel('Japanese')
			.setEmoji(FLAG_EMOJIS.ja)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_ko')
			.setLabel('Korean')
			.setEmoji(FLAG_EMOJIS.ko)
			.setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('translatebot_lang_pl')
			.setLabel('Polish')
			.setEmoji(FLAG_EMOJIS.pl)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_ru')
			.setLabel('Russian')
			.setEmoji(FLAG_EMOJIS.ru)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_ar')
			.setLabel('Arabic')
			.setEmoji(FLAG_EMOJIS.ar)
			.setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('translatebot_lang_nl')
			.setLabel('Dutch')
			.setEmoji(FLAG_EMOJIS.nl)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_no')
			.setLabel('Norwegian')
			.setEmoji(FLAG_EMOJIS.no)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('translatebot_lang_fi')
			.setLabel('Finnish')
			.setEmoji(FLAG_EMOJIS.fi)
			.setStyle(ButtonStyle.Secondary),
	),
];

module.exports = { language_buttons, FLAG_EMOJIS };
