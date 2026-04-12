# FlowDesk

Monorepo: **React + Vite** frontend (`client/`) and **Express + TypeScript** API (`server/`), based on [node-backend-template-ts](https://github.com/Manjil246/node-backend-template-ts).

## Prerequisites

- [Bun](https://bun.sh)

## Client

```bash
cd client
cp .env.example .env
bun install
bun run dev
```

The app runs at **http://localhost:5173**.

Use **`VITE_API_BASE_URL`** in `.env` (default: `http://localhost:8000`) so the UI can call the API.

## Server

```bash
cd server
cp .env.example .env
bun install
bun run dev
```

Runs on **http://localhost:8000** by default (`PORT` in `.env`). **Bun** executes TypeScript directly; `--watch` restarts on file changes.

Copy **`server/.env.example`** → **`.env`** and fill in values (MongoDB Atlas URI, Meta **`VERIFY_TOKEN`** / **`WHATSAPP_TOKEN`** / **`PHONE_NUMBER_ID`** / **`WABA_ID`**, **`OPENAI_API_KEY`** when you use the bot). See comments in `.env.example`.

- Meta webhook verify: **GET** `https://<tunnel>/webhook?hub.mode=subscribe&hub.verify_token=…&hub.challenge=…`
- Meta webhook events: **POST** `https://<tunnel>/webhook` — responds with `200` + `EVENT_RECEIVED` immediately, then logs payload to the server console
- Health: **GET** `http://localhost:8000/api/v1/health-check` (see template routes)

**Production:** `bun run build` then `bun run start` (serves compiled `dist/`).

## Run both

1. Terminal A: `cd server && bun run dev`
2. Terminal B: `cd client && bun run dev`

Align CORS origins via `server/.env` (`FRONTEND_BASE_URL`, `BACKEND_BASE_URL`).

## Build

**Client:** `cd client && bun run build` → `client/dist`.

**Server:** `cd server && bun run build` → `dist/`.
