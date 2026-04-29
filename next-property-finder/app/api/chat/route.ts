import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAssistantReply } from "@/lib/openai";
import { searchPropertiesForQuery } from "@/lib/property-search";
import type { ChatApiResponse } from "@/lib/types";

const requestSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000, "Message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .default([]),
});

export async function POST(request: Request) {
  try {
    const requestBody = requestSchema.parse(await request.json());
    const { filters, candidates, properties } = await searchPropertiesForQuery(requestBody.message);

    const reply = await generateAssistantReply({
      userMessage: requestBody.message,
      history: requestBody.history,
      filters,
      properties,
    });

    const payload: ChatApiResponse = {
      reply,
      properties,
      filters,
      rawMatchesCount: candidates.length,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Property finder API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message || "Invalid request payload.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "The property finder could not process that request.",
      },
      { status: 500 }
    );
  }
}
