# translate-bot

A Discord bot that translates messages on demand. Users pick a preferred language once and the bot remembers it across every server — right-click a message, hit **Translate Message**, and get an ephemeral translation only you can see.

## Features

- **Context-menu translation** — right-click any message → Apps → **Translate Message**. The result is ephemeral (only visible to you) and includes a link back to the original.
- **Mention-based translation** — reply to a message while @mentioning the bot to get a public translation in the channel.
- **Per-user language preference** — set once with `/language`, remembered across all servers the bot is in.
- **15 supported languages** — English, Spanish, Hindi, French, German, Italian, Chinese, Japanese, Korean, Polish, Russian, Arabic, Dutch, Norwegian, Finnish.
- **Auto-detection** — source language is detected automatically; no need to specify it.

## Quick start

### Prerequisites

- **Node.js** 20+
- **MariaDB** running and accessible
- A **Discord bot token** with the `MESSAGE_CONTENT` privileged intent enabled in the [Developer Portal](https://discord.com/developers/applications)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/zachisfine/translate-bot.git
   cd translate-bot
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   DISCORD_TOKEN=your-bot-token
   WEBHOOK_ID=your-webhook-id
   WEBHOOK_TOKEN=your-webhook-token
   LOG_GUILD_ID=guild-id-for-admin-logs
   LOG_CHANNEL_ID=channel-id-for-admin-logs
   DISCONNECT_GUILD_ID=guild-id-for-disconnect-alerts
   DISCONNECT_CHANNEL_ID=channel-id-for-disconnect-alerts
   DB_HOST=127.0.0.1
   DB_PORT=3307
   DB_NAME=translate
   DB_USER=root
   DB_PASS=your-db-password
   ```

   All variables are validated at startup with Joi — the bot will exit immediately with a clear error if anything is missing or malformed.

3. Start the bot:

   ```bash
   npm start
   ```

   The bot will connect to MariaDB, sync the `userPreferences` table, register slash/context-menu commands in every guild, and send a status embed to the configured webhook.

## Usage

1. **Set your language** — run `/language` in any channel and click a button.
2. **Translate a message** — right-click a message → Apps → **Translate Message**. You'll get a private embed with the translation.
3. **Public translation** — reply to any message while @mentioning the bot. The translation is posted as a visible embed in the channel.

## Development

```bash
npm run lint          # ESLint
npm run format        # Prettier (writes changes)
npm run format:check  # Prettier (CI-safe, check only)
```

CI runs ESLint, Prettier, and a syntax/import validation check on every push and pull request.

## Add the bot to your server

[Invite link](https://discord.com/api/oauth2/authorize?client_id=1127004226816573490&permissions=83968&scope=bot)

## License

Private — all rights reserved.
