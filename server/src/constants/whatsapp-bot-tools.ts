import { LADIES_FASHION_CATALOG_SKUS } from "./catalog-skus";

const skuEnum = [...LADIES_FASHION_CATALOG_SKUS] as unknown as string[];

/** OpenAI Chat Completions `tools` array for StyleSutra WhatsApp bot. */
export const LADIES_FASHION_WHATSAPP_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "send_product_image",
      description:
        "Send a product photo on WhatsApp for one catalogue sku. Use when the customer is viewing, asking about, or has clearly chosen that product and a picture would help. If unsure, omit. When sending both image and text, call this before send_whatsapp_text so the image arrives first. The server will skip if no image file exists for that sku.",
      parameters: {
        type: "object",
        properties: {
          sku: {
            type: "string",
            enum: skuEnum,
            description: "Catalogue sku exactly as listed (e.g. SS-K01).",
          },
        },
        required: ["sku"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_whatsapp_text",
      description:
        "Send your full reply to the customer on WhatsApp. Every customer-visible message must go through this tool (Nepali/English per system rules). WhatsApp: bold uses single asterisks around Latin text only (*StyleSutra*) — never **. For Nepali menus use plain numbered lines (1. कुर्ता) with no asterisks around Devanagari. For menus ask the user to reply with a number only; do not dump the full catalogue in one message. No Markdown # or [text](url). Keep replies short.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description:
              "Complete message body for the customer. WhatsApp formatting: *bold* not **bold**; no Markdown headings or link syntax.",
          },
        },
        required: ["text"],
      },
    },
  },
];
