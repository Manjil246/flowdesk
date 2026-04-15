/** OpenAI Chat Completions `tools` array for StyleSutra WhatsApp bot. */
export const LADIES_FASHION_WHATSAPP_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "browse_categories",
      description:
        "Load active product categories. Call when the customer wants to shop (welcome option 1) or browse. Returns a numbered list of categories. The backend tracks session state — you only see names and numbers, never raw IDs.",
      parameters: {
        type: "object",
        properties: {},
        required: [] as string[],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "browse_products",
      description:
        "List products in a category. Pass the category number the customer chose from the last browse_categories menu. Returns a numbered product list with names. Backend resolves the real category from session.",
      parameters: {
        type: "object",
        properties: {
          categoryNumber: {
            type: "integer",
            description:
              "The number the customer chose from the category menu (1, 2, 3…).",
          },
          limit: {
            type: "integer",
            description: "Max products to return (default 25, max 50).",
          },
        },
        required: ["categoryNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "select_product",
      description:
        "Select a product by number from the last browse_products menu. Returns product detail including sizes (as a list) and colours (numbered). Backend resolves real IDs from session.",
      parameters: {
        type: "object",
        properties: {
          productNumber: {
            type: "integer",
            description:
              "The number the customer chose from the product menu (1, 2, 3…).",
          },
        },
        required: ["productNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "select_size",
      description:
        "Record the customer's size choice. Pass the exact size string (S, M, L, XL, Free Size, etc.) from the product's available sizes. Backend validates against the current product.",
      parameters: {
        type: "object",
        properties: {
          size: {
            type: "string",
            description:
              "The size the customer chose, exactly as shown in the sizes list.",
          },
        },
        required: ["size"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "select_color",
      description:
        "Record the customer's colour choice by number from the colour menu. Backend resolves to the real colour and validates.",
      parameters: {
        type: "object",
        properties: {
          colorNumber: {
            type: "integer",
            description:
              "The number the customer chose from the colour menu (1, 2, 3…).",
          },
        },
        required: ["colorNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_product_image",
      description:
        "Send the product photo on WhatsApp. By default sends the image for the currently selected product + colour from session. Optionally pass colorNumber to preview a specific colour before formal selection. If no colour selected and no colorNumber given, sends the first available colour as preview. Never paste URLs in follow-up text.",
      parameters: {
        type: "object",
        properties: {
          colorNumber: {
            type: "integer",
            description:
              "Optional colour number for preview. Omit to use the currently selected colour.",
          },
        },
        required: [] as string[],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "place_order",
      description:
        "Save the confirmed order. Call after billing recap with NPR 150 delivery. Backend fills product, colour, size, and price from session state — you only provide quantity, phone, location, and verification. On success returns orderReference (e.g. SS-20260414-A1B2C3) — you MUST give that code in the thank-you.",
      parameters: {
        type: "object",
        properties: {
          quantity: {
            type: "integer",
            description: "Number of pieces the customer wants.",
          },
          customerOrderPhone: {
            type: "string",
            description:
              "Callback / order phone the customer gave (E.164 or local digits as typed).",
          },
          deliveryLocation: {
            type: "string",
            description:
              "Full delivery address or area text the customer confirmed.",
          },
          locationVerified: {
            type: "boolean",
            description:
              "True if the address was clear or they confirmed after double-check.",
          },
        },
        required: [
          "quantity",
          "customerOrderPhone",
          "deliveryLocation",
          "locationVerified",
        ],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_order_status",
      description:
        "Look up an order by the customer-facing orderReference (SS-YYYYMMDD-HEX). Use when the customer chose welcome menu 2 and sent their order number.",
      parameters: {
        type: "object",
        properties: {
          orderReference: {
            type: "string",
            description:
              "The SS-… order number exactly as given to the customer (case-insensitive).",
          },
        },
        required: ["orderReference"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "restart_shopping",
      description:
        "Resets the shopping session completely. Use when the customer wants to start over, browse a different category, or says 'go back to start'. Clears all product/size/color selections. Categories are preserved.",
      parameters: {
        type: "object",
        properties: {},
        required: [] as string[],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "change_product",
      description:
        "Clears the current product selection and returns to the product list. Use when the customer says 'actually I want a different product', 'show me other options', or 'go back'. Size and color are also cleared. The product list for the current category is preserved.",
      parameters: {
        type: "object",
        properties: {},
        required: [] as string[],
      },
    },
  },
];
