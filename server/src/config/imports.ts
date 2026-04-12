import dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";

/** HTTP listen port (must match ngrok when testing webhooks locally). */
export const PORT = Number(process.env.PORT) || 8000;

export const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || "http://localhost:5173";
export const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export const LOCAL_DEVELOPMENT_URL = process.env.LOCAL_DEVELOPMENT_URL || "";

/**
 * MongoDB connection string (Atlas or local).
 * `MONGO_URI` is accepted as an alias for older env files.
 */
export const MONGODB_URI =
  process.env.MONGODB_URI || process.env.MONGO_URI || "";

/** Meta webhook verification — must match the Verify Token in Meta Developer Console. */
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "";

/** Meta Graph API (Cloud API) access token — send messages, read webhooks app config. */
export const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

/** WhatsApp Business phone number ID from Meta dashboard. */
export const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";

/** Your business WhatsApp number in E.164 (used for outbound `fromPhone` in DB). */
export const WHATSAPP_BUSINESS_PHONE =
  process.env.WHATSAPP_BUSINESS_PHONE ||
  process.env.WHATSAPP_BUSINESS_DISPLAY_NUMBER ||
  "";

/** Graph API version for Cloud API calls (no leading slash). */
export const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";

/** WhatsApp Business Account ID. */
export const WABA_ID = process.env.WABA_ID || "";

/** OpenAI API key for GPT bot replies. */
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

/** Chat Completions model (default gpt-4o-mini; set gpt-5-* for GPT-5 family). */
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Sampling temperature for models that support it (e.g. gpt-4o-mini). Ignored for
 * GPT-5 / o-series in OpenAIService. Range 0–2; default moderate for stable retail tone.
 */
const rawTemp = Number(process.env.OPENAI_TEMPERATURE);
export const OPENAI_TEMPERATURE =
  Number.isFinite(rawTemp) && rawTemp >= 0 && rawTemp <= 2
    ? rawTemp
    : 0.45;

/**
 * GPT-5 / reasoning models count internal reasoning toward the same output cap
 * as visible text; too low a value yields empty `content`. Default 8192.
 */
const rawMc = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS);
export const OPENAI_MAX_COMPLETION_TOKENS =
  Number.isFinite(rawMc) && rawMc >= 1024
    ? Math.min(128_000, Math.floor(rawMc))
    : 8192;

/** max_tokens for non–GPT-5 chat models (short WhatsApp replies; env optional). */
const rawLegacyMax = Number(process.env.OPENAI_MAX_TOKENS);
export const OPENAI_MAX_TOKENS =
  Number.isFinite(rawLegacyMax) && rawLegacyMax >= 128 && rawLegacyMax <= 4096
    ? Math.floor(rawLegacyMax)
    : 512;

const botAutoExplicit = process.env.BOT_AUTO_REPLY_ENABLED?.toLowerCase();
/** GPT reply after each new inbound text message when conversation has bot mode on. */
export const BOT_AUTO_REPLY_ENABLED =
  botAutoExplicit === "false" || botAutoExplicit === "0" ? false : true;

/** Max prior + current turns (user/assistant text only) sent to OpenAI. */
export const BOT_REPLY_HISTORY_LIMIT = Math.min(
  40,
  Math.max(4, Number(process.env.BOT_REPLY_HISTORY_LIMIT) || 24),
);
