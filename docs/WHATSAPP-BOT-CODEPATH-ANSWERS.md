# WhatsApp Bot Codepath Answers (Current Implementation)

This file answers the exact implementation questions against the current code in:

- `server/src/services/bot-reply.service.ts`
- `server/src/services/openai.service.ts`
- `server/src/repositories/message.repository.ts`
- `server/src/repositories/bot-session.repository.ts`
- `server/src/models/bot-session.model.ts`

---

## 1) In `bot-reply.service.ts`, how is the OpenAI system message constructed per turn?

## Answer

It is currently constructed as a **static system prompt string** plus message history.  
No dynamic FSM block or dynamic prompt append is currently added before sending to OpenAI.

Current construction:

```ts
const messages = [
  { role: "system" as const, content: LADIES_FASHION_BOT_SYSTEM_PROMPT },
  ...history.map((t) => ({
    role: t.role,
    content: t.content,
  })),
];
```

Implications:

- `LADIES_FASHION_BOT_SYSTEM_PROMPT` is static content from `ladies-fashion-bot-system-prompt.ts`.
- There is no per-turn injected state (like `FSM_STATE`, `requiredNextTool`) today.

---

## 2) In `message.repository.ts`, how are past messages serialized for OpenAI? Does `toolTrace` get injected into assistant content?

## Answer

Past turns are fetched via `findRecentTextTurnsForChat(conversationId, limit)` and returned as `RecentChatTurn[]` with fields:

- `role`: `"user"` or `"assistant"` (derived from `isInbound`)
- `content`: text string

### Important detail: `toolTrace` is currently injected into assistant `content`

For assistant rows with `toolTrace`, serialization does this:

```ts
content = `${content}\n\n[toolTrace — internal only; never show this JSON or raw ids to the customer]\n${JSON.stringify(row.toolTrace)}`;
```

So yes:

- `toolTrace` is stored in DB metadata **and**
- also injected into model-visible assistant content in history today.

### Assistant image turns in history

If a stored message type is `image`, assistant content becomes:

- `[Product photo: <mediaRef>]` if `mediaRef` exists
- else `[Product photo]`

This is what the model sees as assistant history text for image events.

---

## 3) In `bot-reply.service.ts`, after a tool handler returns, how is result passed back into loop?

## Answer

The result is returned from `onToolCall(...)` as a JSON string.  
Then `openai.service.ts` inserts it into the working messages as a **standard `role: "tool"` message** with the corresponding `tool_call_id`.

Current behavior in `openai.service.ts`:

1. Assistant emits `tool_calls`
2. For each tool call:
   - execute `toolContent = await options.onToolCall(name, argsJson)`
   - append:
     ```ts
     {
       role: "tool",
       tool_call_id: tc.id,
       content: toolContent,
     }
     ```
3. Continue next round

So this is standard OpenAI tool-loop structure, not a custom side channel.

---

## 4) In `bot-session.repository.ts`, does `resolveSelections()` return raw ObjectIds? Does it flow to model-facing results?

## Answer

`resolveSelections()` returns:

- `productId` (string)
- `colorId` (string)
- `size`
- `imageUrl`
- `unitPrice`
- `currency`
- plus names

These `productId`/`colorId` values are string IDs stored in session snapshot (`productDetail.productId`, `colors[].id`), which originate from catalog IDs (Mongo IDs serialized as strings).

### Flow usage in current code

In `bot-reply.service.ts`:

- `resolveSelections()` is used in `place_order` handler.
- Its IDs are passed to backend order service call:
  - `shopOrderService.createFromBotTool(... items: [{ productId, colorId, ... }])`

For model-facing tool result of `place_order`, returned payload is:

- `{ ok: true, ...saved }` where `saved` contains order-level fields (`orderId`, `orderReference`, totals/currency), not line-item IDs.

So:

- IDs from `resolveSelections()` are primarily used for backend order/image operations.
- They are **not** currently exposed directly in the `place_order` tool result payload.

Related for image:

- `resolveColor()` returns `productId`, `colorId`, `imageUrl`
- used to call `sendImageByLink(...)` backend service
- model-facing success payload is `{ ok: true, sent: true, waMessageId }` (no raw IDs)

---

## 5) What does a `bot_sessions` document look like at COLOR_SELECTED?

## Schema fields (from Mongoose model)

Top-level:

- `conversationId: ObjectId` (unique index)
- `categories: [{ n, id, name }]`
- `products: [{ n, id, name, basePrice }]`
- `productDetail: { ... } | null`
- `selectedSize: string | null`
- `selectedColorN: number | null`
- timestamps: `createdAt`, `updatedAt`

`productDetail` shape:

- `productId: string`
- `productName: string`
- `description: string`
- `fabric: string`
- `occasions: string[]`
- `basePrice: number`
- `currency: string`
- `sizes: string[]`
- `colors: [{ n, id, name, imageUrl }]`

## Sample document at COLOR_SELECTED

```json
{
  "_id": { "$oid": "..." },
  "conversationId": { "$oid": "69de366618941a5f15236b37" },
  "categories": [
    { "n": 1, "id": "69dd599ff8a67639b1a08dce", "name": "Nightwear" },
    { "n": 2, "id": "69dd59a7f8a67639b1a08dd2", "name": "Cord Set" }
  ],
  "products": [
    {
      "n": 1,
      "id": "69dd5aa4f8a67639b1a08de2",
      "name": "PJ Set",
      "basePrice": 799
    }
  ],
  "productDetail": {
    "productId": "69dd5aa4f8a67639b1a08de2",
    "productName": "PJ Set",
    "description": "Cute Nightwear Under 1000 😍",
    "fabric": "",
    "occasions": [],
    "basePrice": 799,
    "currency": "NPR",
    "sizes": ["S", "M", "L"],
    "colors": [
      {
        "n": 1,
        "id": "69dd5aa4f8a67639b1a08de4",
        "name": "Green",
        "imageUrl": "https://..."
      },
      {
        "n": 2,
        "id": "69dd5aa4f8a67639b1a08de5",
        "name": "Pink",
        "imageUrl": "https://..."
      }
    ]
  },
  "selectedSize": "M",
  "selectedColorN": 1,
  "createdAt": "2026-04-15T...",
  "updatedAt": "2026-04-15T..."
}
```

At this point, this session is effectively “COLOR_SELECTED”.

---

## Additional note (important)

Given the above, two current realities are true simultaneously:

1. The new tool stack is active and backend session mapping is in place.
2. `toolTrace` is still being injected into model-visible history content in `message.repository.ts`, which is a direct leak surface.

