# Response to Architecture Feedback

## Context

This document responds directly to the latest design feedback on three threads:

1. Sequencing and FSM error response shape
2. Trace leak root cause and best fix
3. Scope strategy (Option A vs B) and FSM/prompt drift

It also recommends which thread to execute first.

---

## 1) Sequencing: hard FSM + error payload design

You raised a strong point: if FSM enforcement is truly hard, does returning `allowedTools` to the model create extra freedom and possibly more wrong choices?

## Position

Yes, that risk is real.  
For production robustness, the response should be **minimal and directive**, not exploratory.

### Recommended error response (strict mode)

Use a compact error contract:

```json
{
  "ok": false,
  "error": "invalid_state",
  "requiredNextTool": "select_product",
  "reasonCode": "NO_PRODUCT_SELECTED"
}
```

### Why this is better than `allowedTools[]`

- Reduces model branching freedom
- Lowers chance of “creative” but legal-yet-wrong tool picks
- Makes recovery deterministic at decision layer
- Simpler to test

### When `allowedTools[]` can still be useful

Only in debug/analysis environments (not default runtime), where you want observability of the state machine for diagnostics.

Recommended pattern:

- Production mode: `requiredNextTool` only
- Debug mode: include optional `allowedTools[]` and `state`

---

## 2) Trace leak: sanitizer vs removing trace from model context

You said removing model-visible trace is higher leverage than sanitizer. Agreed.

## Position

The primary fix should be:

1. **Do not place raw trace text in model-visible history**
2. Keep sanitizer as defense-in-depth at final outbound chokepoint

### Why trace is likely in history today

Most likely reason is historical convenience:

- Wanted replay awareness / debugging continuity
- Injected tool trace into conversation content as a quick way to expose prior tool work to model

That approach helped observability but introduced leakage risk:

- Model sees literal `[toolTrace ...]`
- Model can copy/echo it
- Sanitizer must perfectly catch all variants

### Better architecture for continuity without leakage

Split concerns:

- **Observability channel** (logs/DB): full trace JSON
- **Model context channel**: compact, curated state summary only

Example model-safe summary:

```json
{
  "selectedProduct": "PJ Set",
  "selectedSize": "M",
  "selectedColor": "Green",
  "lastImageSend": "success",
  "orderStep": "awaiting_quantity"
}
```

No raw arguments, no internal IDs, no JSON traces that can leak.

### Sanitizer role after this change

Still mandatory, but as the final guard:

- strip `[toolTrace` blocks
- strip accidental internal markers
- enforce outbound-safe text

The correct model is: **prevention first, sanitizer second**.

---

## 3) Scope and drift: keeping FSM and prompt aligned

You flagged the long-term drift risk between backend FSM and prompt. Correct and important.

## Position

Yes, drift will happen unless backend and prompt consume a shared source of truth.

### Recommended design: dynamic FSM state injection

At each turn, backend should provide model with a small computed state block derived from the same FSM engine that enforces tools.

Example injected context (not user-visible):

```json
{
  "fsmState": "PRODUCT_SELECTED",
  "requiredNextTool": "select_size",
  "completed": ["browse_categories", "browse_products", "select_product"],
  "constraints": {
    "canSendImage": false,
    "canPlaceOrder": false
  }
}
```

This makes model understanding match backend reality per turn.

### How to avoid duplicated logic

Do not hardcode flow rules in two places.

Instead:

1. Define FSM transitions in code (single authority)
2. Generate model-facing state hints from that same FSM object
3. Keep prompt generic (“follow backend-required next step”) rather than encoding every edge transition textually

### Prompt strategy with dynamic state

Prompt should become:

- policy-heavy (tone, formatting, no URLs, no internal exposure)
- flow-light (delegate exact next step to backend-provided state hints)

This dramatically reduces drift cost over time.

---

## Which thread to pull first

Recommended priority order:

1. **Thread 2 (trace prevention):** remove raw trace from model-visible history + outbound chokepoint sanitizer  
   - fastest trust/safety win
   - removes embarrassing leakage immediately

2. **Thread 1 (hard FSM strict response):** enforce deterministic tool eligibility + `requiredNextTool` error format  
   - directly reduces sequencing loops/retries

3. **Thread 3 (dynamic state injection):** wire FSM-derived state hints into model context  
   - medium effort, high long-term maintainability
   - prevents prompt/FSM drift

This order gives immediate safety, then correctness, then maintainability.

---

## Concrete implementation stance (if approved later)

### Minimal safe baseline

- Remove toolTrace injection from model-visible chat history
- Add final outbound text sanitizer in `WhatsAppService.sendTextMessage`
- Hard FSM gate with strict `requiredNextTool` errors (no `allowedTools` in prod)

### Next maturity step

- Add dynamic FSM state summary block into system/context message every turn
- Reduce prompt’s embedded flow branching details
- Keep only policy + communication rules in static prompt

---

## Final answer to your three core questions

1. **Do we need `allowedTools` in error if FSM is hard?**  
   Usually no in production. Prefer `requiredNextTool` only.

2. **Is trace leak best solved by sanitizer only?**  
   No. Best fix is to stop exposing raw trace to model; sanitizer remains backup.

3. **Can we prevent FSM/prompt drift?**  
   Yes: derive dynamic state hints from the same FSM used for enforcement and inject per turn.

