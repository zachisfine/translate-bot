# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main`  | Yes       |

Only the latest commit on the `main` branch is actively maintained.

## Reporting a vulnerability

If you discover a security vulnerability in this project, **please do not open a public issue.** Instead, report it privately:

1. **Email:** Send details to the repository owner via their GitHub profile contact.
2. **GitHub Private Vulnerability Reporting:** Use the [Security Advisories](https://github.com/zachisfine/translate-bot/security/advisories/new) tab to submit a private report directly on GitHub.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof of concept.
- The file(s) and line number(s) involved, if known.
- Any suggested fix or mitigation.

You can expect an initial response within **72 hours**. If the issue is confirmed, a fix will be prioritised and you will be credited in the commit message (unless you prefer to remain anonymous).

## Scope

The following are in scope for security reports:

- **Credential exposure** — hardcoded tokens, secrets committed to the repo, or leaks through logs/error messages.
- **Injection** — SQL injection via Sequelize queries, Discord embed injection, or command injection through user-supplied input.
- **Denial of service** — input that crashes the bot or causes unbounded resource consumption (e.g. excessively long messages sent to the translation API).
- **Privilege escalation** — any way for a non-admin Discord user to trigger admin-only behaviour.
- **Dependency vulnerabilities** — known CVEs in direct or transitive dependencies that are exploitable in this project's context.

The following are **out of scope**:

- Vulnerabilities in Discord's API or infrastructure.
- Vulnerabilities in Google Translate's API.
- Social engineering attacks against bot users.
- Rate limiting or abuse of Discord's own rate limits.

## Current security measures

- **No hardcoded secrets** — all credentials (bot token, webhook, database) are loaded from a `.env` file via `dotenv` and validated at startup with Joi.
- **Environment validation** — the bot exits immediately if any required variable is missing or malformed, preventing partial startup with broken config.
- **Input validation** — messages are checked for empty content and capped at 5,000 characters before being sent to the translation API.
- **Embed field truncation** — user-supplied content is sliced to Discord's 1,024-character field limit to prevent API errors.
- **Button ID namespacing** — the bot only processes buttons with the `translatebot_lang_` prefix, ignoring interactions from other bots.
- **ISO 639-1 validation** — language codes extracted from button IDs are validated before any database write.
- **Null-safe model getters** — database fields that may be null are handled gracefully instead of crashing.
- **`.env` in `.gitignore`** — environment files are excluded from version control.

## Dependency management

- Dependabot is enabled and will open PRs for known vulnerabilities in dependencies.
- Run `npm audit` periodically to check for new advisories.
- Non-breaking audit fixes are applied with `npm audit fix`. Breaking changes (e.g. eslint v8 → v10, undici in discord.js) are evaluated manually before upgrading.
