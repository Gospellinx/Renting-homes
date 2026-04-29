"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AISearchResults } from "@/components/ai-search-results";
import type { ChatApiResponse, ChatMessage } from "@/lib/types";

const STORAGE_KEY = "next-property-finder-chat";

const suggestionChips = [
  "2 bedroom in Abuja",
  "cheap rent",
  "luxury villa",
  "house near Lekki with pool",
  "studio close to university",
];

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function PropertyFinderChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const savedMessages = window.localStorage.getItem(STORAGE_KEY);

      if (!savedMessages) {
        return;
      }

      const parsed = JSON.parse(savedMessages) as ChatMessage[];

      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter((message) => !message.isTransient)));
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 || isLoading || error) {
      resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages, isLoading, error]);

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
    setMessages((current) => [...current.filter((message) => !message.isTransient), userMessage, loadingMessage]);

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
        throw new Error(("error" in payload && payload.error) || "The property finder could not complete that request.");
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
    <section className="w-full">
      <div
        className="overflow-hidden rounded-[36px] bg-slate-900 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(15,23,42,0.28), rgba(15,23,42,0.58)), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
              Find the exact home you&apos;re looking for
            </h1>
            <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-white/92 md:text-[2rem] md:leading-[1.4]">
              Jitty helps you cut through irrelevant listings, discover new areas by commute time and learn more
              about every home.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <div className="rounded-[34px] border border-white/70 bg-white/96 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(input);
                }}
                className="space-y-4"
              >
                <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(input);
                      }
                    }}
                    placeholder="Describe the home you're looking for..."
                    className="min-h-[160px] w-full resize-none border-0 bg-transparent px-6 py-6 pr-24 text-2xl leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 md:min-h-[190px]"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute bottom-5 right-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    aria-label="Send AI search"
                  >
                    {isLoading ? "..." : "->"}
                  </button>
                </div>

                <div className="rounded-[28px] bg-slate-50/90 px-5 py-5">
                  <p className="text-2xl font-medium text-slate-500">Be inspired...</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {suggestionChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => void sendMessage(chip)}
                        className="rounded-full border border-violet-200 bg-white px-4 py-2 text-lg font-medium text-indigo-500 transition hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        <span className="mr-2 text-indigo-300">*</span>
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div ref={resultsAnchorRef} />
      <div
        className={`transition-all duration-300 ease-out ${
          messages.length > 0 || isLoading || error ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <AISearchResults messages={messages} isLoading={isLoading} error={error} />
      </div>
    </section>
  );
}
