# Taste of Us

**Plan your week together — menu, dishes, and shopping list in one Telegram app.**

A mini app for couples who want less “what’s for dinner?” and more time eating together. Built as a [Telegram Web App](https://core.telegram.org/bots/webapps).

---

## At a glance


|           |                                                        |
| --------- | ------------------------------------------------------ |
| **Plan**  | Pick brunch, dinner & dessert for each day of the week |
| **Cook**  | Assign who cooks — by meal, by day, or with rotation   |
| **Shop**  | Auto-generate a list from the menu + your staples      |
| **Share** | Send the menu to your partner’s Telegram chat          |


Open the app from your Telegram bot → plan → tap **Send Menu** → done.

---

## How it works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Mini App   │────▶│   Your menu  │────▶│ Partner's chat  │
│  (browser)  │     │   + shopping │     │  (pinned msg)   │
└─────────────┘     └──────────────┘     └─────────────────┘
```

1. **Open in Telegram** — the app only works inside Telegram (not in a regular browser tab).
2. **Fill the week** — choose dishes from your library or add new ones.
3. **Optional: Settings** — add your Chat ID and your partner’s so menus and cook reminders arrive in DM.
4. **Send** — confirm and push the menu to Telegram.

> **Partner setup:** both people should send `/start` to the bot. Add Chat IDs in **Settings** (get yours from [@userinfobot](https://t.me/userinfobot)).

---

## Features

- **Weekly planner** — 7-day view with quick day switching
- **Dish library** — brunch / dinner / dessert, import from JSON
- **Cook assignment** — manual per meal or rotation (by day / by week)
- **Shopping list** — manual items, common staples, generate from menu
- **Telegram delivery** — text menu + optional cook notifications

---

## Tech stack

Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS · Supabase · Telegram Bot API

Architecture follows [Feature-Sliced Design](https://feature-sliced.design/) — see `.cursor/rules/ARCHITECTURE.md` for contributors.

---

## Development

### Prerequisites

- [Bun](https://bun.sh) (or Node 20+)
- Supabase project
- Telegram bot ([BotFather](https://t.me/Botfather))

### Quick start

```bash
git clone <repo-url>
cd taste-of-us
bun install
# create .env with the variables below
bun dev
```

App runs at [http://localhost:3000](http://localhost:3000). Use Telegram’s test environment or tunnel (ngrok) for Web App auth locally.

### Environment variables


| Variable                    | Required | Description                                                             |
| --------------------------- | -------- | ----------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`        | yes      | Bot token from BotFather                                                |
| `SUPABASE_URL`              | yes      | Supabase project URL                                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | yes      | Service role key (server only)                                          |
| `CRON_SECRET_TOKEN`         | optional | Protects reminder cron endpoints                                        |
| `NUXT_PUBLIC_POSTHOG_KEY`   | optional | Analytics                                                               |
| `NUXT_PUBLIC_POSTHOG_HOST`  | optional | PostHog host                                                            |
| `NUXT_PUBLIC_SITE_URL`      | optional | Web App URL for bot welcome button (default: `https://taste-of-us.com`) |


### Scripts


| Command             | Description                |
| ------------------- | -------------------------- |
| `bun dev`           | Dev server                 |
| `bun build`         | Production build           |
| `bun preview`       | Preview production build   |
| `bun run typecheck` | TypeScript check           |
| `bun run lint`      | ESLint                     |
| `bun run lint:fsd`  | FSD architecture (Steiger) |
| `bun run ci:check`  | typecheck + lint + fsd     |


