# FlowDesk

Monorepo: **React + Vite** frontend (`client/`) and **Go** API (`server/`).

## Prerequisites

- [Bun](https://bun.sh) (or use npm/pnpm if you prefer)
- [Go](https://go.dev/dl/) 1.22+

## Client

```bash
cd client
cp .env.example .env
bun install
bun run dev
```

The app runs at **http://localhost:5173** (see `client/vite.config.ts`).

Use **`VITE_API_BASE_URL`** in `.env` for the Go API base URL (default in `.env.example`: `http://localhost:8000`). Read it in code as `import.meta.env.VITE_API_BASE_URL`.

## Server

```bash
cd server
go run .
```

The API listens on **http://localhost:8000** by default. Override with the **`PORT`** environment variable if needed.

- Health check: **GET** `http://localhost:8000/health`

## Run both

1. Terminal A: start the server (`cd server && go run .`).
2. Terminal B: start the client (`cd client && bun run dev`).

Point the client at the API via `client/.env` (`VITE_API_BASE_URL`).

## Build

**Client:** `cd client && bun run build` (output: `client/dist`).

**Server:** `cd server && go build -o flowdesk-server .` (Windows: `flowdesk-server.exe`).
