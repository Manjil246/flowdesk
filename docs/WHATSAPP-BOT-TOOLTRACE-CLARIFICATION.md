# ToolTrace Clarification (Storage vs Model Visibility)

This file answers exactly how `toolTrace` is shaped, where it is stored, and how it becomes model-visible today.

---

## Q1) What does `toolTrace` actually contain in `bot-reply.service.ts`?

## Exact shape

In `bot-reply.service.ts`, per inbound run, `runToolTrace` is built as:

```ts
Array<{
  name: string;
  arguments: string;
  result: string;
}>
```

Each step is pushed by `pushResult(...)`:

- `name`: tool name
- `arguments`: `argsJson` string from tool call (raw JSON string)
- `result`: tool handler return string (typically `JSON.stringify(...)` result)

So this is **raw-ish trace payload**, not a curated summary object.

### Important nuance

- If argument JSON parsing fails (`invalid_arguments_json` path), that immediate return does **not** call `pushResult`, so it may not appear in `runToolTrace`.
- For normal handled calls (success/failure/validation), `pushResult` is used and stored.

---

## Q2) Is the same `toolTrace` used both for DB storage and model-visible history?

## Short answer

Yes — conceptually the same shape/data, reused across both concerns.

### (a) DB storage path

`runToolTrace` is passed into outbound send calls:

- text path:
  - `whatsAppService.sendTextMessage({ ..., toolTrace: [...runToolTrace] })`
- image path:
  - `whatsAppService.sendImageByLink({ ..., toolTrace: [...runToolTrace] })`

In `whatsapp.service.ts`, these are persisted via `insertOutboundMessage`:

- `toolTrace: input.toolTrace?.length ? input.toolTrace : undefined`

In `message.model.ts`, `toolTrace` schema is:

```ts
toolTrace: [
  {
    name: string,
    arguments: string,
    result: string
  }
]
```

### (b) Model-visible history path

In `message.repository.ts`, when serializing assistant turns for OpenAI history:

If `row.toolTrace` exists, it appends to assistant `content`:

```text
[toolTrace — internal only; never show this JSON or raw ids to the customer]
<JSON.stringify(row.toolTrace)>
```

That means the trace from DB is transformed into a text block and injected into the model-visible message content.

---

## Are these “two different objects/shapes”?

They are effectively the same underlying data with minor representation difference:

1. Stored in DB as structured array of `{name, arguments, result}` objects
2. Later converted to text via `JSON.stringify(row.toolTrace)` and appended to assistant message `content`

So concerns are currently coupled:

- Observability trace storage
- Model context injection

---

## Does fixing model-visible trace require major separation work?

## Practical answer

It is close to a one-line behavioral change at serialization chokepoint.

The coupling exists, but the injection point is explicit:

- `message.repository.ts` appends toolTrace text to `content`

If you remove that append block, you keep DB trace for observability while stopping model-visible trace injection.

Conceptually:

- Keep `Message.toolTrace` persistence unchanged
- Stop concatenating `toolTrace` into `RecentChatTurn.content`

That decouples the two concerns without redesigning trace storage format.

---

## Final conclusion

- `toolTrace` currently stores raw tool call args/result strings (not curated summary).
- The same trace data is persisted to DB and then re-exposed to the model via content serialization.
- This is why removing trace from model-visible history is mostly a serialization-layer change, not a full schema redesign.

