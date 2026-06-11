# Privacy Policy

_Last updated: 2026-06-11_

This privacy policy describes how the **TranslateBot** Discord application ("the bot") handles your data.

## What we store

The bot stores exactly two things per user, in a single database row:

1. **Your Discord user ID** — used as the primary key so the bot can look up your preferred language on future translations.
2. **Your chosen target language** — a 2–3 character ISO 639-1 code (e.g. `en`, `ja`, `de`).

That's the entire schema for user data.

## What we do NOT store

- ❌ **Message content** — text you ask the bot to translate is sent to the translation provider at request time and discarded as soon as the result is returned. It is never written to disk and never logged.
- ❌ **Translation history** — we do not keep records of what you translated, when, or for whom.
- ❌ **Usernames, display names, or avatars**
- ❌ **Server (guild) membership, roles, or permissions**
- ❌ **Channel or message IDs, timestamps, or any other metadata**
- ❌ **Presence data** (online status, activity)
- ❌ **Direct messages** — the bot does not read or send DMs.

## How message content is used

When you trigger a translation (right-click → "Translate Message", or @mention reply), the bot:

1. Reads the text of the message you selected.
2. Sends that text to Google Translate via the [`@iamtraction/google-translate`](https://www.npmjs.com/package/@iamtraction/google-translate) library.
3. Returns the translated text to you as an embed.
4. Discards the original and translated text from memory.

No copy of the message content is retained by the bot. Google Translate's handling of the text is governed by [Google's Privacy Policy](https://policies.google.com/privacy).

## Machine learning / AI training

Your data is **not** used to train any machine learning or AI models, by us or by any third party we control.

## Data deletion

You can delete your stored language preference at any time by running the slash command:

```
/forget
```

This immediately removes your row from the database. There is no soft-delete, no archive, no backup retention for user preferences — once deleted, it's gone.

If you remove the bot from your server, no data is deleted automatically (because preferences are per-user, not per-server). Use `/forget` to clean up.

## Logging

The bot maintains a private logging channel that records when users set their preferred language. This log contains: the user mention, the guild name, the channel mention, and the chosen language. It does **not** contain message content. Logs are accessible only to the bot operator.

## Children

The bot is intended for use on Discord, which requires users to be at least 13 years old (or older in some jurisdictions). The bot does not knowingly collect data from users under that age.

## Changes to this policy

Material changes to this policy will be reflected in the file's "Last updated" date and the project's git history.

## Contact

For privacy questions or deletion requests beyond `/forget`, open an issue at:

https://github.com/zachisfine/translate-bot/issues
