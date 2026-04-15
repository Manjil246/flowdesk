# WhatsApp Bot Decision Q&A (Sequencing, Trace Leak, Scope)

## Why this document exists

This is a focused deep-dive answering three high-impact architecture questions:

1. What happens today when backend returns `no_product_selected`?
2. Where is `[toolTrace ...]` leaking from?
3. Is a deterministic orchestrator (LLM as text renderer) actually on the table?

The goal is to support decision-making before more implementation.

---

## 1) Sequencing behavior today: what the LLM does after `no_product_selected`

## Short answer

Today, behavior is **best-effort self-correction**, not deterministic enforcement.

- Sometimes the model recovers and calls `select_product` next.
- Sometimes it repeats the same invalid tool call first.
- So it is not a guaranteed spiral, but also not guaranteed correction.

This means sequencing is currently **probabilistic**, not deterministic.

## Evidence from observed runtime logs

Observed sequence (real run):

1. `browse_categories` ✅
2. `browse_products` ✅
3. `select_size({ size: "M" })` ❌ → `{ ok: false, error: "no_product_selected" }`
4. `select_size({ size: "M" })` ❌ again (repeated invalid call)
5. `select_product({ productNumber: 1 })` ✅ (eventual correction)

Interpretation:

- The model did not immediately self-correct on first failure.
- It retried the same invalid call once.
- Then corrected later.

So current behavior is a mixed recovery pattern, not robust state control.

## Why it behaves this way in current architecture

Current `BotReplyService` tool loop:

- backend returns structured JSON error
- model sees tool result in conversation context
- model decides next tool call autonomously

There is no hard backend `allowedToolsByState` gate that forces a legal next step, and no deterministic server-side rewrite of invalid tool attempts into the required predecessor call.

## What this implies for design choice (FSM gate vs better error format)

If the question is **“Can we fix this only with better error messages?”**:

- Better error format can improve recovery rate.
- It cannot guarantee legal progression under all prompts/turns.

If requirement is **“Must never progress illegally”**:

- You need a hard FSM gate (or equivalent deterministic orchestrator logic).

### Practical recommendation

Use both:

1. **Hard FSM eligibility gate** (authoritative safety)
2. **Machine-friendly error format** (better model recovery and cleaner UX)

Example error envelope:

```json
{
  "ok": false,
  "error": "invalid_state",
  "state": "CATEGORY_SELECTED",
  "requiredNextTool": "select_product",
  "allowedTools": ["select_product", "browse_products", "browse_categories"]
}
```

This gives strong control and useful guidance at the same time.

---

## 2) Trace leak analysis: which code path is leaking `[toolTrace ...]`

## Short answer

Based on current code shape and observed symptom, the leak source is most likely:

- **model-generated fallback text** that copied the `[toolTrace ...]` block from history context,
- then got sent via the normal `onContentFallback -> sendTextMessage` path.

So this is primarily a **sanitization/chokepoint problem**, not necessarily a separate outbound transport path.

## Why this is plausible

Message history builder currently appends an internal marker block for assistant turns with tool metadata (for model replay/awareness), in this pattern:

- assistant content
- then internal block:
  - `[toolTrace — internal only; never show ...]`
  - JSON payload

That means the model can literally “see” this marker text in history context.  
If the model echoes/copies it in a response, that content becomes normal assistant text unless stripped before outbound send.

## Primary outbound text path today

In `bot-reply.service.ts`:

- Final assistant visible text goes through `onContentFallback`.
- `onContentFallback` applies text sanitizer utility before `sendTextMessage`.

This means if trace leaked to user, one of these is true:

1. sanitizer does not currently strip `[toolTrace ...]` patterns, or
2. sanitizer is applied but misses actual variants/newlines/formatting, or
3. there exists at least one alternate outbound text path not passing that sanitizer.

## Do we have evidence of a separate path?

From current known flow:

- Tool handlers mostly return tool results (not direct user text)
- User-visible text is expected to go through `onContentFallback`

So with current evidence, the highest-probability issue is **sanitizer coverage gap at main fallback path**, not a fully separate message path.

However, to be production-safe, we should assume possibility of secondary paths and put sanitizer at a lower chokepoint too.

## Correct engineering posture: single chokepoint + defense in depth

### Chokepoint fix (mandatory)

Apply a strict “final outbound text cleaner” inside `WhatsAppService.sendTextMessage` (or equivalent final outbound adapter), so every outbound bot text is cleaned regardless of caller.

This should strip:

- any block starting with `[toolTrace`
- JSON-like traces following that block
- raw URLs if policy says none

### Defense in depth

Keep/expand sanitizer in `onContentFallback` too, but do not rely only on it.

### Additional hardening

Stop injecting raw toolTrace content into model-visible chat history at all. Keep tool trace in logs/DB for observability, but avoid placing full JSON trace in prompt/history content.

---

## 3) Scope decision: is Direction B (deterministic orchestrator) on the table?

## Short answer

Yes, Direction B is technically on the table.  
No, it is not mandatory unless we require strict deterministic workflow control beyond what FSM-gated tool calling provides.

## Clarifying the real choice

This is not binary “LLM full control” vs “LLM just text renderer”.  
There is a middle path:

- Keep LLM in conversational decision loop,
- but enforce legal action space server-side with FSM/tool eligibility.

That middle path usually gives most value with moderate complexity.

## Decision matrix

### Option A: Harden current session architecture (LLM-led + hard guards)

What it means:

- Keep current tool architecture.
- Add strict state gate (`allowedToolsByState`).
- Improve error envelopes.
- Add hard outbound sanitizer.
- Add session lifecycle reset/TTL.

Pros:

- Lowest migration cost from current code.
- Preserves model flexibility for natural conversation.
- Can become reliable enough for commerce flows if guardrails are strict.

Cons:

- Still depends on model for selecting next legal action among allowed set.
- More prompt/model tuning needed for edge cases.

### Option B: Deterministic orchestrator (LLM as NLG mostly)

What it means:

- Backend owns step progression deterministically.
- LLM primarily renders user-facing text, not progression decisions.

Pros:

- Highest reliability and auditability.
- Clear state transitions, fewer regressions.

Cons:

- Largest redesign effort.
- Lower conversational flexibility.
- More product/engineering overhead to maintain workflow logic.

### Option C: Integer IDs + FSM

What it means:

- Introduce integer IDs, but still keep session/FSM architecture.

Pros:

- Better debug readability and smaller payloads.

Cons:

- Does not solve sequencing/sanitization by itself.
- Not a substitute for state enforcement.

## Recommended scope stance (current project reality)

Given current codebase and progress, practical recommendation is:

1. Commit first to **Option A hardening** (strict FSM gate + sanitizer chokepoint + session reset policy).
2. Evaluate reliability after that with explicit test cases.
3. Move to Option B only if hard requirements demand near-deterministic workflow behavior that A cannot satisfy.

In other words: Direction B should remain available, but do not jump there before fully hardening A.

---

## Concrete next experiments (to decide quickly)

Run these as acceptance tests against current/new build:

1. User sends size before product:
   - expected: backend blocks, assistant recovers in one turn, no repeated invalid call.
2. User changes category mid-flow:
   - expected: downstream state reset, no stale options.
3. Force model to output fake trace string:
   - expected: outbound sanitizer removes it fully.
4. Expired WhatsApp token during image send:
   - expected: safe user message, no false “image sent”.
5. Post-order behavior:
   - expected: session reset policy verified.

If A passes these consistently, B may be unnecessary.

---

## Final position summary

1. **Sequencing today**: semi-recovering, non-deterministic.  
   Better errors help, but hard FSM gate is needed for guarantees.

2. **Trace leak today**: most likely main fallback path with insufficient sanitizer coverage + model echo from history.  
   Fix at final outbound chokepoint and stop exposing raw trace in model-visible history.

3. **Scope**: deterministic orchestrator is possible, but not yet mandatory.  
   First harden existing architecture with strict backend controls and evaluate.

