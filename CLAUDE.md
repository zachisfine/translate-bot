# CLAUDE.md

## Commands
- `npm run lint` — lint the project (ESLint)
- `npm run format` — format the project (Prettier)
- `npm start` / `node app.js` — run the bot (requires MariaDB and a `.env` file; see below)

## Architecture
- **app.js** — Single-file entry point. Validates env vars with Joi at startup, then registers Discord event handlers: `ready` (command registration), `interactionCreate` (slash commands, context menus, buttons), `messageCreate` (mention-based translation), `disconnect`
- **discord/helpers/bot.js** — Creates and exports the Discord.js Client (with Guilds, GuildMessages, MessageContent, GuildMembers intents) and re-exports commonly used discord.js classes (EmbedBuilder, ActionRowBuilder, etc.)
- **discord/helpers/models.js** — Sequelize connection to MariaDB and the `UserPreferences` model. Fields use comma-separated strings with null-safe custom getters/setters to behave as arrays.
- **discord/embeds/panel.js** — Exports `language_buttons`, 5 ActionRows of buttons (15 languages total) with custom IDs following `translatebot_lang_[ISO_CODE]` pattern.

## Translation flow
1. User sets preferred language via `/language` slash command (shows button panel)
2. User right-clicks a message -> Apps -> "Translate Message"
3. Bot validates message has text content and is under 5000 chars
4. Bot looks up user's language preference from DB; if none, prompts to set one
5. Source language auto-detected via `languagedetect`; translated via `@iamtraction/google-translate`
6. Result returned as ephemeral embed with translation details and "Jump to original" link
7. Alternative flow: user replies to a message while mentioning the bot -> translates in a non-ephemeral embed

## Code style
- **Prettier** (.prettierrc.json) — tabs, single quotes, semicolons, trailing commas, 120 char width
- **ESLint** (.eslintrc.json) — extends `eslint:recommended` + `prettier`; prefer const, no var, comma dangle on multiline, max 4 nested callbacks
- Run `npm run format` then `npm run lint` to check

## Environment variables (.env)
The bot loads credentials from a `.env` file in the project root via `dotenv`. All variables are validated with Joi at startup. Required variables:
- `DISCORD_TOKEN` — Discord bot token
- `WEBHOOK_ID` — Webhook ID for bot status notifications
- `WEBHOOK_TOKEN` — Webhook token for bot status notifications
- `LOG_GUILD_ID` — Guild ID for the dev logging channel
- `LOG_CHANNEL_ID` — Channel ID for the dev logging channel
- `DISCONNECT_GUILD_ID` — Guild ID for the disconnect notification channel
- `DISCONNECT_CHANNEL_ID` — Channel ID for the disconnect notification channel
- `DB_HOST` — MariaDB host
- `DB_PORT` — MariaDB port
- `DB_NAME` — Database name
- `DB_USER` — Database user
- `DB_PASS` — Database password

## Database
- MariaDB on the host/port specified in `.env`, database name from `DB_NAME`
- Single table: `UserPreferences` (id=Discord user ID, lang=ISO 639-1 code, plus ignored* fields for future filtering features)
