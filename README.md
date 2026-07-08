# Lion Camera License System

Discord bot + backend API for managing license keys for the Lion Camera Mod (Gorilla Tag).

## Features

- `/createkey` – Owner-only command to create a license key for a user.
- `/mylicense` – Any user can retrieve their own license key.
- Backend API routes:
  - `POST /license/create`
  - `GET /license/by-discord/:discordId`

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and fill in:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_GUILD_ID`
   - `SELLAUTH_API_KEY`
   - `SELLAUTH_SHOP_ID`
   - `MONGODB_URI`
   - `API_PORT` (optional, default `3000`)

4. Ensure `config/config.json` has your real:
   - `bot.clientId`
   - `bot.guildId`
   - `sellauth.shopId`

## Running locally

Terminal 1 – API:

```bash
npm run start:api
```

Terminal 2 – Bot:

```bash
npm run start:bot
```

You should see:

- `Lion License API listening on port 3000`
- `Lion License Bot is ready!`
- `Slash commands registered.`

Test the commands in your Discord test server:

- `/createkey @someuser` (only works for server owner)
- `/mylicense` (shows your license status)

## Next steps

- Wire `/createkey` and `/mylicense` to the SellAuth API and your database.
- Add real license key generation and storage.
- Connect the Lion Camera Mod to `POST /license/validate` (to be added).
