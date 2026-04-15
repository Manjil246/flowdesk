import {
  OPENAI_API_KEY,
  OPENAI_MAX_COMPLETION_TOKENS,
  OPENAI_MAX_TOKENS,
  OPENAI_MODEL,
  OPENAI_TEMPERATURE,
} from "../config/imports";
import type {
  IOpenAIService,
  OpenAIChatMessage,
  OpenAIToolCallHandler,
} from "../interfaces/openai.service.interface";

type ToolCallPart = {
  id: string;
  type?: string;
  function: { name: string; arguments: string };
};

type ChatCompletionsResponse = {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string | null | unknown;
      refusal?: string | null;
      tool_calls?: ToolCallPart[];
    };
  }>;
  usage?: {
    completion_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
  error?: { message?: string; type?: string; code?: string | number };
};

function assistantVisibleText(message: {
  content?: string | null | unknown;
  refusal?: string | null;
}): { text: string; refusal: string } {
  const refusal =
    typeof message.refusal === "string" ? message.refusal.trim() : "";
  if (refusal) return { text: "", refusal };

  const c = message.content;
  if (c == null) return { text: "", refusal: "" };
  if (typeof c === "string") return { text: c.trim(), refusal: "" };
  if (Array.isArray(c)) {
    const joined = c
      .map((part) => {
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text?: string }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("");
    return { text: joined.trim(), refusal: "" };
  }
  return { text: "", refusal: "" };
}

/**
 * GPT-5 and several reasoning / o-series models use different Chat Completions
 * fields than legacy chat models:
 * - `max_completion_tokens` instead of `max_tokens`
 * - custom `temperature` is rejected (only default sampling); omit the field.
 * @see https://community.openai.com/t/inconsistent-api-parameters-across-models/1344937
 * @see https://community.openai.com/t/temperature-in-gpt-5-models/1337133
 */
function usesRestrictedChatCompletionParams(model: string): boolean {
  const m = model.toLowerCase().trim();
  if (m.includes("gpt-5")) return true;
  if (/^o[0-9]/.test(m)) return true;
  return false;
}

export class OpenAIService implements IOpenAIService {
  async runChatWithTools(
    messages: OpenAIChatMessage[],
    options: {
      tools: unknown[];
      onToolCall: OpenAIToolCallHandler;
      onContentFallback?: (text: string) => Promise<void>;
    },
  ): Promise<void> {
    const key = OPENAI_API_KEY.trim();
    if (!key) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    if (!messages.length) {
      throw new Error("OpenAI chat completion requires at least one message");
    }

    const restricted = usesRestrictedChatCompletionParams(OPENAI_MODEL);
    const basePayload: Record<string, unknown> = {
      model: OPENAI_MODEL,
      ...(restricted
        ? {
            max_completion_tokens: OPENAI_MAX_COMPLETION_TOKENS,
            ...(OPENAI_MODEL.toLowerCase().includes("gpt-5")
              ? { reasoning_effort: "minimal" }
              : {}),
          }
        : {
            max_tokens: OPENAI_MAX_TOKENS,
            temperature: OPENAI_TEMPERATURE,
          }),
      tools: options.tools,
      tool_choice: "auto",
      /** Catalog + image tools only; keep sequential for predictable ordering. */
      parallel_tool_calls: false,
    };

    const working: unknown[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const maxRounds = 8;
    for (let round = 0; round < maxRounds; round += 1) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...basePayload,
          messages: working,
        }),
      });

      const json = (await res.json()) as ChatCompletionsResponse;

      if (!res.ok) {
        const msg =
          json.error?.message ?? `OpenAI request failed with HTTP ${res.status}`;
        throw new Error(msg);
      }

      const choice = json.choices?.[0];
      const message = choice?.message;
      if (!message) {
        throw new Error("OpenAI returned no assistant message object");
      }

      const { refusal } = assistantVisibleText(message);
      if (refusal) {
        throw new Error(`OpenAI refusal: ${refusal}`);
      }

      const toolCalls = message.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        working.push({
          role: "assistant",
          content: null,
          tool_calls: toolCalls,
        });

        for (const tc of toolCalls) {
          const name = tc.function?.name ?? "";
          const argsJson = tc.function?.arguments ?? "{}";
          let toolContent: string;
          try {
            toolContent = await options.onToolCall(name, argsJson);
          } catch (err: unknown) {
            const em = err instanceof Error ? err.message : String(err);
            toolContent = JSON.stringify({ ok: false, error: em });
          }
          working.push({
            role: "tool",
            tool_call_id: tc.id,
            content: toolContent,
          });
        }
        continue;
      }

      const { text } = assistantVisibleText(message);
      if (text && options.onContentFallback) {
        await options.onContentFallback(text);
      }
      return;
    }

    throw new Error("OpenAI tool loop exceeded max rounds");
  }
}
