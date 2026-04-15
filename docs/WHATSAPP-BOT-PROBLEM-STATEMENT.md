# WhatsApp Bot Reliability Problem Statement

## Purpose of this document

This document describes the current reliability problem in the FlowDesk/StyleSutra WhatsApp bot so we can discuss and evaluate solutions with other tools (Claude, etc.) before implementing further changes.

The goal is to make the problem unambiguous:

- What the bot is supposed to do
- What architecture is currently in place
- Which tools/schemas are involved
- What failures are still happening
- Why those failures happen
- What constraints a final solution must satisfy

---

## Business context

We run a WhatsApp commerce assistant for a ladies' fashion shop (StyleSutra) with this flow:

1. Customer browses categories/products
2. Selects product, size, color
3. Bot sends product image
4. Bot confirms per-piece price
5. Bot collects quantity, phone, delivery location
6. Bot adds NPR 150 delivery
7. Bot saves order to DB and returns a trackable `orderReference` (`SS-...`)
8. Customer can later track order status

Key UX requirements:

- Numbered menu interactions
- No internal IDs shown to users
- No image URLs pasted in text
- Image must be sent reliably and not falsely claimed
- Stable ordering flow without contradictory options

---

## Original technical pain point (before session architecture)

Historically, the LLM received raw Mongo ObjectIds from catalog tools and had to pass those IDs back in later calls (`productId`, `colorId`, etc.).

Observed issues:

- LLM confused `productId` and `colorId`
- LLM reused stale/incorrect IDs from earlier turns
- LLM invented plausible but wrong IDs
- `send_product_image` failed with `not_found`
- Risk of wrong item/color during order save

Root cause:

- Opaque IDs are difficult for the model to handle consistently across multi-turn flows
- Prompt-only controls are insufficient for deterministic correctness

---

## Current architecture (after migration)

### High-level strategy

Move from “LLM passes raw IDs” to “LLM passes small numbers; backend resolves IDs deterministically from conversation state”.

### New session storage

File: `server/src/models/bot-session.model.ts`

Collection: `bot_sessions`

Stored per `conversationId` (unique index), with:

- `categories`: numbered list shown in latest category menu
- `products`: numbered list shown in latest product menu
- `productDetail`: selected product snapshot (sizes/colors/etc.)
- `selectedSize`
- `selectedColorN`

Repository: `server/src/repositories/bot-session.repository.ts`

Main responsibilities:

- `getOrCreate(conversationId)`
- `setCategoriesMenu(...)` and clear downstream state
- `setProductsMenu(...)` and clear downstream state
- `setProductDetail(...)` and clear size/color
- `setSize(...)`, `setColor(...)`
- Resolve final selections for image/order calls

### New tool interface (LLM-facing)

File: `server/src/constants/whatsapp-bot-tools.ts`

Current tools:

- `browse_categories`
- `browse_products({ categoryNumber })`
- `select_product({ productNumber })`
- `select_size({ size })`
- `select_color({ colorNumber })`
- `send_product_image({ colorNumber? })`
- `place_order({ quantity, customerOrderPhone, deliveryLocation, locationVerified })`
- `get_order_status({ orderReference })`

### New tool arg schemas

File: `server/src/schemas/whatsapp-bot-tool-args.ts`

ObjectId-based schemas were replaced with number/string-based schemas.

### Bot orchestration

File: `server/src/services/bot-reply.service.ts`

Key behavior:

- Validates tool args with Zod
- Reads/writes `BotSession`
- Resolves actual catalog IDs server-side
- Calls catalog/order/whatsapp services
- Persists server-side `toolTrace` metadata

### Prompt layer

File: `server/src/constants/ladies-fashion-bot-system-prompt.ts`

Prompt updated to:

- Use numbered interactions
- Use new tool names
- Avoid internal IDs/SKUs in customer text
- Enforce image/price/order flow expectations

---

## What is working now

From recent runtime logs, the server is using new tool names (evidence of new architecture active):

- `browse_categories`
- `browse_products`
- `select_product`
- `select_size`

This confirms runtime switched from old ID-based tool names.

---

## Current failures still observed

Even after migration, reliability issues remain:

1. **Tool-order violations**
   - Example observed: `select_size("M")` called before `select_product`
   - Result: `no_product_selected` error
   - Indicates LLM can still sequence tools incorrectly

2. **Conversation-level inconsistency in UX output**
   - Customer saw contradictory size options at different points
   - Indicates flow synchronization gaps between menu state and model response behavior

3. **Internal trace leak into customer-visible message**
   - `[toolTrace — internal only ...]` appeared in WhatsApp text
   - This should never be user-visible
   - Suggests sanitization gap in some output path

4. **Image send reliability dependency**
   - If WhatsApp token/session expires, image sending fails at provider layer
   - Can present as bot flow failure even when logic is correct

---

## Problem framing: what the real issue is now

This is no longer only an “ID hallucination” problem.

Current problem is broader:

- **State machine enforcement problem** (tool ordering, prerequisites)
- **Output sanitization problem** (internal diagnostics leaking to users)
- **Operational reliability problem** (token/session validity, external API errors)
- **Prompt + orchestration mismatch** (model still making invalid next-step choices)

So we need hardening at multiple layers, not just identifier format.

---

## Detailed component map

### Catalog and variants

- Product model, color model, variant stock model remain source of truth
- Pricing from variant stock / base price logic
- Color image URLs from catalog colors

### Orders

- `ShopOrderService` creates order from validated inputs
- Recomputes prices server-side
- Generates unique `orderReference`
- `get_order_status` constrained by same WhatsApp customer context

### Messaging

- Outbound text/image via `whatsapp.service.ts`
- Message persistence includes `toolTrace` metadata for internal replay/debug

---

## Constraints for any final solution

Any acceptable solution should guarantee:

1. LLM never directly controls critical foreign-key mapping
2. Invalid tool sequence is auto-corrected or blocked deterministically
3. Internal traces/errors never reach customer text
4. Image-send failure handling is honest and user-safe
5. Order save path remains price-safe and inventory-safe
6. Works under multilingual conversational noise (Nepali/Hindi/English mixed input)
7. Keeps token usage reasonable

---

## Why “integer primary key for LLM” alone is not sufficient

Using auto-increment integers instead of ObjectIds may improve readability/token cost, but by itself it does not solve:

- Wrong-entity selection (`productId` passed as `colorId`)
- Wrong sequence (`select_size` before selecting product)
- Stale context reuse
- Output leakage (`toolTrace`)

Integer IDs can be a useful data-layer enhancement, but not a complete reliability fix without orchestration guardrails.

---

## Open questions to discuss with external tools

1. Should we enforce a strict finite-state machine (FSM) in backend for tool eligibility?
2. Should invalid tool calls trigger automatic server-driven correction steps?
3. Should we hard-reset/expire session after successful order placement?
4. Should bot session have inactivity TTL (e.g., 30–60 min)?
5. Should we maintain a lightweight cart model in session for multi-item flow?
6. Should `toolTrace` be fully excluded from model-visible history and kept only in logs?
7. Do we need stronger output sanitizer that strips any accidental `[toolTrace ...]` blocks before outbound send?
8. Do we need a provider-health gate for expired WhatsApp access token before attempting media sends?

---

## Candidate solution directions (for discussion only)

### Direction A: Harden existing session architecture

- Keep current number-based session mapping
- Add strict backend FSM checks
- Add session reset policies
- Add outbound sanitizer hard block
- Improve prompt minimally

### Direction B: Hybrid with deterministic orchestrator

- Keep LLM for language generation only
- Move step progression to deterministic server workflow
- LLM cannot choose illegal next tools

### Direction C: Integer catalog IDs + session + FSM

- Add stable integer IDs for catalog entities
- Keep session mapping and FSM guardrails
- Use integers only for admin/debug readability (not sole safety mechanism)

---

## Immediate status summary

- New session-based architecture is implemented and active in runtime logs.
- Core old-ID hallucination surface is reduced.
- Remaining failures indicate orchestration and sanitization hardening is still required.

This document should be used as the baseline for solution design discussions before additional edits.

---

## Extended technical handoff (detailed)

This section is intentionally verbose so the full context can be shared with other models/tools without requiring follow-up from this codebase.

## End-to-end flow we are implementing

### Product discovery and checkout (intended behavior)

1. User opens/restarts chat and gets 3-option numbered menu.
2. If user chooses shop (`१`), assistant calls `browse_categories`.
3. Assistant shows numbered category list only.
4. User picks category number; assistant calls `browse_products`.
5. Assistant shows numbered product list only.
6. User picks product number; assistant calls `select_product`.
7. Assistant collects one field at a time:
   - size (call `select_size`)
   - color (call `select_color`)
8. Assistant sends image via `send_product_image`.
9. Assistant asks price confirmation (`proceed to checkout?`), then quantity.
10. Assistant collects phone and delivery location (with re-confirm if vague).
11. Assistant gives billing recap with delivery charge NPR 150.
12. Assistant calls `place_order`.
13. Assistant shares `orderReference` and closes politely.
14. For tracking, assistant uses `get_order_status({ orderReference })`.

### Why we moved to this flow

We wanted to remove direct LLM dependency on raw database identifiers and move all critical resolution to deterministic server code.

---

## What changed over time (how we reached current state)

### Phase 1: Original ID-based tool calling

- LLM called tools with raw Mongo IDs (`categoryId`, `productId`, `colorId`).
- Prompt attempted to force correct usage.
- Frequent model mistakes:
  - product/color ID swaps
  - stale ID reuse from history
  - fake-but-valid-looking ID strings

### Phase 2: Prompt hardening and message sanitation

- Prompt got stricter on numbered menus and image behavior.
- URL stripping utility added for outbound text.
- Tool trace and logging improved.
- This reduced some confusion but did not make behavior deterministic.

### Phase 3: Session-based backend resolution (current)

- Introduced `bot_sessions` state keyed by `conversationId`.
- Replaced old tools with number-based tools.
- Moved final ID resolution and order payload assembly to backend.
- Runtime now shows new tool names in logs.

### Remaining gap after Phase 3

Even with session-based mapping, the LLM can still call tools in the wrong order (`select_size` before `select_product`) unless backend enforces a stronger state machine.

---

## Current code-level architecture (detailed)

## 1) Session model and state shape

File: `server/src/models/bot-session.model.ts`

Collection: `bot_sessions`

Stored fields:

- `conversationId` (ObjectId, unique index)
- `categories[]` with `{ n, id, name }`
- `products[]` with `{ n, id, name, basePrice }`
- `productDetail` snapshot:
  - `productId`
  - `productName`
  - `description`
  - `fabric`
  - `occasions[]`
  - `basePrice`
  - `currency`
  - `sizes[]`
  - `colors[]` with `{ n, id, name, imageUrl }`
- `selectedSize`
- `selectedColorN`
- timestamps (`createdAt`, `updatedAt`)

Important:

- No TTL configured currently.
- Session is not auto-cleared after order placement currently.

## 2) Session repository and cascade-clearing rules

File: `server/src/repositories/bot-session.repository.ts`

Implemented behavior:

- `getOrCreate(conversationId)` — upsert session.
- `setCategoriesMenu(...)` clears:
  - `products`
  - `productDetail`
  - `selectedSize`
  - `selectedColorN`
- `setProductsMenu(...)` clears:
  - `productDetail`
  - `selectedSize`
  - `selectedColorN`
- `setProductDetail(...)` clears:
  - `selectedSize`
  - `selectedColorN`
- `setSize(...)`, `setColor(...)` store final picks.
- `resolveSelections(...)` returns resolved `{ productId, colorId, size, imageUrl, unitPrice, currency }` or null.
- `resolveColor(...)` supports preview fallback logic.

## 3) LLM tool schema contracts (current)

File: `server/src/schemas/whatsapp-bot-tool-args.ts`

Schemas:

- `browseCategoriesToolArgsSchema` => `{}` passthrough.
- `browseProductsToolArgsSchema` => `{ categoryNumber: int>=1, limit?: int<=50 }`.
- `selectProductToolArgsSchema` => `{ productNumber: int>=1 }`.
- `selectSizeToolArgsSchema` => `{ size: string.trim() }`.
- `selectColorToolArgsSchema` => `{ colorNumber: int>=1 }`.
- `sendProductImageToolArgsSchema` => `{ colorNumber?: int>=1 }`.
- `placeOrderToolArgsSchema` => `{ quantity, customerOrderPhone, deliveryLocation, locationVerified, currency? }`.
- `getOrderStatusToolArgsSchema` => `{ orderReference }`.

Key design point:

- No ObjectId validation in LLM-facing tool schemas anymore.
- Backend owns all real-ID resolution.

## 4) Tool definitions exposed to OpenAI

File: `server/src/constants/whatsapp-bot-tools.ts`

Tool names (new):

- `browse_categories`
- `browse_products`
- `select_product`
- `select_size`
- `select_color`
- `send_product_image`
- `place_order`
- `get_order_status`

Each tool description instructs the model to operate via numbered choices and session context.

## 5) Bot orchestration service

File: `server/src/services/bot-reply.service.ts`

Main processing:

- Reads recent conversation turns from `MessageRepository`.
- Sends `system prompt + history` into OpenAI tool loop.
- For each tool call:
  - parse JSON args
  - validate with Zod
  - perform server-side state mutation/resolution
  - return structured JSON result
- Persists `toolTrace` metadata for observability.
- Sends fallback assistant text via WhatsApp service.

Current behavior to note:

- It still allows model to *attempt* invalid sequencing, then returns explicit errors (e.g., `no_product_selected`), but there is no strict FSM gate that precludes entire classes of invalid tool attempts.

## 6) Order save bridge

`place_order` in `BotReplyService`:

- Pulls selected product/color/size from session via resolver.
- Creates `items[]` payload and calls `ShopOrderService.createFromBotTool`.
- Returns `orderReference` from persisted order.

Related file:

- `server/src/services/shop-order.service.ts`

Still authoritative on:

- price recomputation
- stock checks
- order reference generation

## 7) Runtime wiring

File: `server/src/webhook/process-incoming.ts`

`BotReplyService` now constructed with:

- `OpenAIService`
- `WhatsAppService`
- `MessageRepository`
- `CatalogService`
- `ShopOrderService`
- `BotSessionRepository`

This confirms session layer is in active runtime path.

---

## Active system prompt we are currently using (detailed)

Canonical file:

- `server/src/constants/ladies-fashion-bot-system-prompt.ts`

This is the single system prompt string sent to the LLM for bot replies.

### Prompt intent

- Keep assistant tone friendly and local-language adaptive (Nepali/Hindi/English handling).
- Force numbered menu interactions.
- Avoid markdown artifacts and URL leakage in WhatsApp.
- Enforce catalog-backed responses only (no inventory invention).
- Enforce order collection sequence and NPR 150 delivery recap.

### Critical prompt rules currently included

1. **Formatting rules**
   - No markdown headings/links.
   - Numbered options only for menus.
   - Ask user to reply with one number only.

2. **No internal data exposure**
   - Never show internal IDs/SKUs.
   - Never show internal trace blocks.

3. **Image behavior**
   - No image URLs in text.
   - Send image through tool; do not fake success.
   - Continue sales flow without “image above” style text.

4. **Ordering sequence**
   - Collect one missing field at a time.
   - Size + color + image + price confirmation before quantity.
   - Delivery recap must include NPR 150.
   - Save order and return order reference.

5. **Tool usage in prompt**
   - Uses the new session-based tool names:
     - `browse_categories`
     - `browse_products`
     - `select_product`
     - `select_size`
     - `select_color`
     - `send_product_image`
     - `place_order`
     - `get_order_status`

### Practical note about prompt vs deterministic behavior

Even though prompt rules are strict, prompt text alone cannot guarantee perfect sequencing. That is why backend guardrails/state machine enforcement is still required.

---

## Observed failures in production-like testing (expanded)

## A) Sequencing failure

Observed logs show:

- `browse_categories`
- `browse_products`
- `select_size("M")` (before product selected)
- error: `no_product_selected`
- then later `select_product(1)`

Interpretation:

- New architecture active, but model still made invalid next-call choice before establishing required prerequisite state.

## B) Contradictory option presentation

User reported:

- Earlier step showed fewer size options
- Later step showed full size list

Likely causes:

- Model produced premature text before the definitive `select_product` result was grounded.
- Error-recovery branch did not force a reset of visible conversation state.

## C) Internal trace leak to end-user text

`[toolTrace — internal only ...]` appeared in WhatsApp message.

This indicates at least one output path is not fully sanitizing internal trace text before outbound send.

## D) Provider dependency failure

Expired WhatsApp access token can cause message/media failures independent of business logic correctness.

---

## Why this is still hard (discussion framing)

We currently have:

- better identifier safety (session mapping)
- better observability (tool logs, trace)

But still need:

- deterministic tool eligibility enforcement
- deterministic response recovery after invalid tool call
- guaranteed outbound sanitation for internal blocks
- session lifecycle strategy (TTL/reset)

---

## Recommended minimum hardening checklist (for external review)

1. Add explicit FSM state in `bot_sessions`:
   - e.g., `WELCOME`, `CATEGORY_SELECTED`, `PRODUCT_SELECTED`, `SIZE_SELECTED`, `COLOR_SELECTED`, `READY_TO_ORDER`, `ORDER_PLACED`.
2. Enforce `allowedToolsByState` in backend before executing tool handlers.
3. Add hard sanitizer before outbound WhatsApp send:
   - strip any `[toolTrace ...]` blocks regardless of source.
4. Add session lifecycle policy:
   - clear on successful `place_order`
   - optional inactivity TTL (30/60 mins) with safe restart UX.
5. Improve invalid-tool recovery format:
   - machine-readable error codes + prescribed next-tool hint.
6. Add regression tests:
   - “size before product” case
   - trace leak case
   - image failure/expired token case
   - order placement with stale selections

---

## Exact files relevant for solution design

Core:

- `server/src/services/bot-reply.service.ts`
- `server/src/constants/ladies-fashion-bot-system-prompt.ts`
- `server/src/constants/whatsapp-bot-tools.ts`
- `server/src/schemas/whatsapp-bot-tool-args.ts`
- `server/src/models/bot-session.model.ts`
- `server/src/repositories/bot-session.repository.ts`
- `server/src/services/whatsapp.service.ts`
- `server/src/services/shop-order.service.ts`
- `server/src/repositories/message.repository.ts`
- `server/src/webhook/process-incoming.ts`

Supporting:

- `server/src/schemas/shop-order-tool-args.ts`
- `server/src/errors/service.errors.ts`

---

## Final summary for external discussion

We have already migrated from raw-ID tool calling to session-based number mapping, and runtime confirms the new tool stack is active. This solved the primary ObjectId hallucination risk surface, but reliability is still not production-safe due to sequencing errors, output trace leakage, and operational dependencies.

The next solution should focus on backend state-machine enforcement and guaranteed output sanitation, with session lifecycle cleanup and robust failure recovery patterns.
