import OpenAI from "openai";
import { getEnv } from "@/lib/env";
import { buildAssistantUserPrompt, PROPERTY_ASSISTANT_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ChatTurn, PropertyMatch, SearchFilters } from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __propertyFinderOpenAI__: OpenAI | undefined;
}

export function getOpenAIClient() {
  if (!globalThis.__propertyFinderOpenAI__) {
    globalThis.__propertyFinderOpenAI__ = new OpenAI({
      apiKey: getEnv().OPENAI_API_KEY,
    });
  }

  return globalThis.__propertyFinderOpenAI__;
}

export async function generateAssistantReply(params: {
  userMessage: string;
  history: ChatTurn[];
  filters: SearchFilters;
  properties: PropertyMatch[];
}) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: getEnv().OPENAI_CHAT_MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: PROPERTY_ASSISTANT_SYSTEM_PROMPT,
      },
      ...params.history.slice(-6).map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
      {
        role: "user",
        content: buildAssistantUserPrompt(params),
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "I could not prepare a recommendation just now. Please try again."
  );
}
