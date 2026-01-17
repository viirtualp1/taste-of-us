# Taste of Us - Meal Planning App

A meal planning application for couples to plan weekly menus together.

## Features

- 📅 Select dishes for each day of the week (breakfast, lunch, dinner)
- 📋 Menu organized by categories
- 💾 Auto-save schedules to Supabase
- 🔄 Load previously saved schedules
- 📱 Send menu to Telegram bot
- 📄 Generate PDF with weekly menu

## Installation

```bash
# Install dependencies
bun install
```

## Supabase Setup

This app uses Supabase for storing dishes and schedules. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

Quick setup:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration from `supabase/migrations/001_initial_schema.sql`
3. Add your Supabase credentials to `.env`:
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. (Optional) Migrate existing menu data: `POST /api/migrate-menu`

## Telegram Bot Setup

### What is Chat ID?

The `chat_id` is a unique identifier that tells the Telegram bot **where** to send messages. It identifies the specific chat (conversation) where the bot should deliver notifications and PDFs. Without it, the bot doesn't know where to send the menu.

- For personal chats: It's your user ID (a number)
- For groups/channels: It's the group/channel ID

### Setup Steps

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Get your bot token from BotFather
3. Get your Chat ID:
   - Send any message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":123456789}` - that's your Chat ID
   - If you want to send to your girlfriend, she needs to message the bot first, then you can find her chat ID in the same way

4. Create a `.env` file in the project root:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

**Note:** If you want to send to multiple people, you can modify the server code to support multiple chat IDs or create separate bots.

## Development

```bash
# Start dev server
bun run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
app/
  components/     # Vue components
    ui/          # shadcn-vue UI components
  layouts/       # Page layouts
  pages/         # Application pages
  assets/        # CSS and other resources
server/
  api/           # API endpoints (Nitro)
public/
  menu.json      # Menu data (editable)
```

## Managing Dishes

Dishes are now stored in Supabase. You can:

1. **Via API**: Use the `/api/dishes` endpoints:
   - `GET /api/dishes` - Get all dishes
   - `POST /api/dishes` - Add a new dish
   - `DELETE /api/dishes/[id]` - Delete a dish

2. **Via Supabase Dashboard**: Go to your Supabase dashboard → Table Editor → `dishes`

3. **Migrate from JSON**: If you have existing `menu.json` data, use `POST /api/migrate-menu` to import it

## Usage

1. Open the app in your browser
2. Select dishes for each day of the week
3. Click "Send Menu"
4. The menu will be sent to Telegram and a PDF will be generated

## Technologies

- Nuxt 4
- Vue 3
- Tailwind CSS
- shadcn-vue components
- Supabase (database)
- Puppeteer (for PDF generation)
- Telegram Bot API
