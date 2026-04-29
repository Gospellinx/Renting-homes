import type { ChatTurn, PropertyMatch, SearchFilters } from "@/lib/types";

export const PROPERTY_ASSISTANT_SYSTEM_PROMPT = `
You are a real estate assistant.
Recommend properties ONLY from the provided data.
Never invent listings, prices, locations, or features.
If no exact match exists, say that clearly and suggest the closest options from the provided data.
Keep the response concise, helpful, and practical.
Explain why each recommended property fits the request, then ask one follow-up question when it would help narrow the search.
`.trim();

export function buildAssistantUserPrompt(params: {
  userMessage: string;
  history: ChatTurn[];
  filters: SearchFilters;
  properties: PropertyMatch[];
}) {
  const recentHistory = params.history.slice(-6);

  return [
    `User query: ${params.userMessage}`,
    `Extracted filters: ${JSON.stringify(params.filters)}`,
    `Recent chat history: ${JSON.stringify(recentHistory)}`,
    `Matched properties JSON: ${JSON.stringify(params.properties, null, 2)}`,
    "Answer in plain text. Mention only the listings in the JSON. If multiple listings match, prioritize the strongest ones first.",
  ].join("\n\n");
}
