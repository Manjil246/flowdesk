# Design Stress-Test Response (FSM Re-entry, Tool Result Visibility, State Injection Placement)

## Context

This document responds to the stress-test questions across the three priority threads:

1. FSM with `requiredNextTool` only
2. Removing trace from model-visible history
3. Dynamic FSM state injection placement in OpenAI messages

The objective is to decide designs that are both reliable and practical under real conversational behavior.

---

## Thread 1: FSM + `requiredNextTool` only — what about rewind/re-entry intents?

You’re correct: a pure “forward-only directive” model breaks natural re-entry requests unless rewind paths are first-class.

Examples you gave are real and common:

- “actually I want a different product” after size selected
- “go back” after color selected
- restart from a different category

If backend state is `SIZE_SELECTED` and we only expose `requiredNextTool=select_color`, then natural rewind intent has no legal action unless we explicitly model rewind transitions.

## Recommended design

### 1) FSM must support both forward and backward transitions

Do not model checkout as strictly linear only.  
Add explicit transition classes:

- **Forward transitions** (normal flow)
- **Rewind transitions** (user wants to change selection)
- **Restart transitions** (hard reset to browse root)

### 2) Add intent-level “control tools” for rewind/restart

To keep behavior deterministic, expose explicit safe tools for flow control:

- `change_selection({ level })` where `level ∈ ["category","product","size","color"]`
- or small explicit tools:
  - `restart_shopping()`
  - `change_product()`
  - `change_category()`

This prevents forcing the model to “hack” rewinds through unrelated tools.

### 3) Session cascade-clearing is necessary but not sufficient

Current cascade-clearing in repository is good (technical reset), but the model still needs sanctioned ways to invoke these resets.

So:

- repository handles reset mechanics
- FSM + tool contract handles legal “how to trigger reset”
- prompt teaches when to use those reset tools

### 4) `requiredNextTool` should remain strict for forward-only errors

For invalid forward attempts, keep strict directive:

```json
{
  "ok": false,
  "error": "invalid_state",
  "requiredNextTool": "select_product",
  "reasonCode": "NO_PRODUCT_SELECTED"
}
```

But for rewind-eligible states, return a deterministic envelope that includes a sanctioned branch:

```json
{
  "ok": false,
  "error": "state_conflict",
  "requiredNextTool": "select_color",
  "rewindTool": "change_selection",
  "rewindLevelOptions": ["product","category"]
}
```

This keeps control tight while still allowing user intent to override forward progression.

## Answer to your core question

Yes — FSM needs explicit backward/restart transitions; cascade-clearing alone does not tell the model it is allowed to rewind.

---

## Thread 2: If trace is removed from history, what about tool result payload visibility?

Great question. The model can still see tool results in the same turn, so if tool results contain internal/sensitive structures, leakage risk remains.

## Current behavior (from current implementation pattern)

After successful tool calls, the model receives structured JSON result strings from backend handlers.  
For `select_product`, the returned payload is already partially user-safe and currently includes:

- `product` name
- description/fabric/occasions
- `basePrice`, `currency`
- `sizes`
- numbered `colors` with names
- `stockByColor` with size availability and price

Notably, the current `select_product` response does **not** return raw ObjectIds in that payload.

### However:

- Other tool payloads could still become too verbose
- Future edits might accidentally reintroduce internal fields
- Even user-safe internal metadata can still be echoed awkwardly if over-detailed

## Recommended payload policy

Define a strict tool-result visibility contract:

1. **Model-facing payloads should be minimum necessary for next decision**
2. **No raw DB IDs in model-facing payloads**
3. **No operational debug fields in model-facing payloads**
4. **No full trace JSON in model-facing payloads**

### Split outputs into two channels

- **Model channel:** concise decision payloads (safe)
- **Observability channel:** full detail logs/traces (internal only)

This avoids a second leakage source even after history cleanup.

## Practical safeguard

Add a server-side serializer per tool:

- `toModelPayload(toolResult)` (strict whitelist)
- never pass raw service response directly to model

This guards against accidental payload expansion over time.

---

## Thread 3: Dynamic FSM state injection — where should it live in OpenAI messages?

You’re right: placement affects authority weighting and truncation behavior.

## Options considered

### A) Inject into System message

Pros:

- Highest model priority
- Strong instruction weight

Cons:

- If appended verbosely every turn, system prompt can bloat
- Dynamic per-turn system reconstruction complexity

### B) Inject as synthetic tool result

Pros:

- Naturally structured and near the action loop
- Easy to keep machine-readable JSON

Cons:

- Semantically odd if not tied to a real tool
- Slightly weaker “policy” authority than system role

### C) Inject as synthetic user/developer-like turn

Pros:

- Easy implementation

Cons:

- Lower authority
- Can be misinterpreted as conversational content
- More fragile under long context

## Recommended placement strategy (hybrid)

### Primary: compact dynamic state block in System message (per turn)

Keep it short and authoritative, e.g.:

```text
FSM_STATE: PRODUCT_SELECTED
REQUIRED_NEXT_TOOL: select_size
REWIND_ALLOWED: change_selection(product|category), restart_shopping
```

### Secondary: include matching machine fields in invalid-state tool errors

So even if model misses system hint, runtime error still guides deterministic correction.

This gives:

- policy authority (system)
- runtime correction authority (tool error)

## Context pressure/truncation considerations

To reduce truncation risk:

- Keep dynamic state block tiny (3–6 lines)
- Do not include historical transition logs
- Recompute fresh each turn from backend FSM
- Prefer replacing previous dynamic block, not appending unboundedly

---

## Recommended concrete approach for next implementation pass

1. **FSM evolution**
   - Add backward/restart transitions explicitly.
   - Add one deterministic rewind tool (`change_selection`) or explicit restart/change tools.

2. **Error contract**
   - Keep `requiredNextTool` strict for forward invalid calls.
   - Add optional sanctioned rewind hint only when user intent conflicts with forward path.

3. **Model-visible payload hardening**
   - Implement per-tool payload whitelist serializers.
   - Ensure all model-facing tool results are ID-free and concise.

4. **State injection placement**
   - Put compact dynamic FSM block in system message each turn.
   - Mirror correction hints in tool error envelopes.

5. **Sanitization**
   - Remove raw trace from model-visible history.
   - Keep final outbound sanitizer as last-line defense.

---

## Direct answers to your three questions

1. **Does FSM need backward transitions?**  
   Yes. Without explicit rewind/restart transitions, `requiredNextTool`-only becomes too rigid for natural user intent.

2. **Is tool result content also a leak surface?**  
   Yes. Even after history trace removal, same-turn tool results are model-visible and must be strictly curated.

3. **Where should dynamic FSM block be injected?**  
   Best default: compact per-turn system block (authoritative) + matching runtime error hints (corrective fallback).

