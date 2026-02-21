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
const language_buttons = [
	new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('translatebot_lang_en').setLabel('English').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_es').setLabel('Spanish').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_hi').setLabel('Hindi').setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('translatebot_lang_fr').setLabel('French').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_de').setLabel('German').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_it').setLabel('Italian').setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('translatebot_lang_zh').setLabel('Chinese').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_ja').setLabel('Japanese').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_ko').setLabel('Korean').setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('translatebot_lang_pl').setLabel('Polish').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_ru').setLabel('Russian').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_ar').setLabel('Arabic').setStyle(ButtonStyle.Secondary),
	),

	new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('translatebot_lang_nl').setLabel('Dutch').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_no').setLabel('Norwegian').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('translatebot_lang_fi').setLabel('Finnish').setStyle(ButtonStyle.Secondary),
	),
];

module.exports = { language_buttons };
