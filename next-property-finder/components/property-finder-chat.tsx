"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PropertyMatchList } from "@/components/property-match-list";
import type { ChatApiResponse, ChatMessage } from "@/lib/types";

const STORAGE_KEY = "next-property-finder-chat";

const starterPrompts = [
  "I want a 2-bedroom apartment in Abuja under 2 million",
  "Show me family houses in Lagos with at least 3 bedrooms",
  "Find affordable apartments in Port Harcourt with good amenities",
];

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const initialAssistantMessage: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Tell me what kind of property you want, where you want it, and your budget. I will search the database and explain the best matches.",
};

export function PropertyFinderChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const savedMessages = window.localStorage.getItem(STORAGE_KEY);

      if (!savedMessages) {
        return;
      }

      const parsed = JSON.parse(savedMessages) as ChatMessage[];

      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const requestHistory = useMemo(
    () =>
      messages
        .filter((message) => !message.isTransient)
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    [messages]
  );

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: buildId(),
      role: "user",
      content: trimmed,
    };

    const loadingMessage: ChatMessage = {
      id: "assistant-loading",
      role: "assistant",
      content: "Searching listings and writing a recommendation...",
      isTransient: true,
    };

    setInput("");
    setError(null);
    setIsLoading(true);
    setMessages((current) => [...current, userMessage, loadingMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: [...requestHistory, { role: "user", content: trimmed }],
        }),
      });

      const payload = (await response.json()) as ChatApiResponse | { error?: string };

      if (!response.ok || !("reply" in payload)) {
        throw new Error(payload.error || "The property finder could not complete that request.");
      }

      const assistantMessage: ChatMessage = {
        id: buildId(),
        role: "assistant",
        content: payload.reply,
        properties: payload.properties,
      };

      setMessages((current) => [...current.filter((message) => !message.isTransient), assistantMessage]);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while contacting the property finder.";

      setMessages((current) => current.filter((message) => !message.isTransient));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid w-full gap-4 rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_25px_90px_rgba(15,23,42,0.08)] backdrop-blur md:grid-cols-[300px_minmax(0,1fr)] md:p-6">
      <aside className="rounded-3xl bg-slate-950 px-5 py-6 text-slate-50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">AI Property Finder</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">Search listings the way people actually talk.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Ask for bedrooms, locations, budgets, or features. The assistant filters PostgreSQL records, reranks them,
          and explains why each listing fits.
        </p>

        <div className="mt-8 space-y-3">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-blue-400 hover:bg-slate-900"
            >
              {prompt}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-h-[78vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
          <p className="text-sm text-slate-500">The assistant only recommends properties returned from your database.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-2xl rounded-3xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white"
                      : "max-w-3xl rounded-3xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-800"
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.properties && message.properties.length > 0 && (
                    <PropertyMatchList properties={message.properties} />
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollAnchorRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          {error && (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form
            className="flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Try: I want a 3-bedroom house in Lagos under 80 million with parking"
              className="min-h-28 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:self-end"
            >
              {isLoading ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
