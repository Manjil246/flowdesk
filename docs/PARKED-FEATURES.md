# Parked features

Items we are **not** implementing now; tracked for later. (Schema or partial plumbing may already exist—this list is about **product behaviour**, UI, and integrations.)

---

## Archive & spam tagging

- **Archive:** full workflow—list filters, bulk actions, “archived” inbox, and clear rules with WhatsApp sends (sending to archived chats is already blocked server-side where applicable).
- **Spam:** mark/unmark spam, hide from default views, optional auto-rules, reporting.
- **`tags`:** use the existing `tags: string[]` on conversations for segments/labels with UI and API.

Related model fields today: `isArchived`, `isSpam`, `tags` on `Conversation` (`server/src/models/conversation.model.ts`).

---

## Inbound WhatsApp images (dashboard & storage)

- Webhooks already persist inbound **`image`** rows with **`mediaId`** and caption-derived **`text`**; **`mediaUrl`** stays **null** (no Graph media download).
- **Later:** resolve media via Meta Graph (`mediaId` → short-lived URL → download or upload to your storage), set **`mediaUrl`** (or a first-party proxy URL) so the dashboard can render `<img>` like outbound catalog photos.
- **Optional:** let the bot react to inbound images (captions only vs vision vs “please describe in text”).

---

## Bot & LLM (optional follow-ups)

- Trigger auto-reply on **non-text** inbound types if product needs it (today **`maybeReplyAfterInbound`** is **text-only**).
- Stricter API behaviour: e.g. `parallel_tool_calls`, richer logging/metrics around tool rounds and validation failures.
- Prompt tuning if the model skips tools or mis-orders image vs text.

---

## Catalogue & assets

- Ensure each **product color** in Mongo has a reachable **`imageUrl`** (HTTPS, e.g. Cloudinary) for WhatsApp outbound images.

---

## Other quality / ops (when needed)

- Unit tests for tool-arg Zod schemas, webhook idempotency helpers.
- Pre-deploy check: active catalog colors used by the bot have valid `imageUrl` values.
- Rate limiting / dedupe if outbound tool calls are ever abused.
