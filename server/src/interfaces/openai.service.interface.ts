/** One message in an OpenAI Chat Completions \`messages\` array (caller-built payload). */
export type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIToolCallHandler = (
  functionName: string,
  argumentsJson: string,
) => Promise<string>;

export interface IOpenAIService {
  /**
   * Runs chat completions with tools until the model stops requesting tools.
   * Executes each tool call via \`onToolCall\` (return a short JSON string for the tool role).
   * If the model returns plain assistant \`content\` without tool_calls, \`onContentFallback\` runs when provided.
   */
  runChatWithTools(
    messages: OpenAIChatMessage[],
    options: {
      tools: unknown[];
      onToolCall: OpenAIToolCallHandler;
      onContentFallback?: (text: string) => Promise<void>;
    },
  ): Promise<void>;
}
