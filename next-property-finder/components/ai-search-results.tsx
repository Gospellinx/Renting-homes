"use client";

import { PropertyMatchList } from "@/components/property-match-list";
import type { ChatMessage } from "@/lib/types";

interface AISearchResultsProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const LoadingPreview = () => (
  <div className="space-y-3">
    <div className="h-4 w-28 rounded-full bg-slate-200" />
    <div className="h-16 rounded-2xl bg-slate-100" />
    <div className="grid gap-3 md:grid-cols-2">
      <div className="h-36 rounded-2xl bg-slate-100" />
      <div className="h-36 rounded-2xl bg-slate-100" />
    </div>
  </div>
);

export function AISearchResults({ messages, isLoading, error }: AISearchResultsProps) {
  const visibleMessages = messages.filter((message) => !message.isTransient);
  const lastAssistantMessage = [...visibleMessages].reverse().find((message) => message.role === "assistant");

  if (visibleMessages.length === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/92 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out">
      <div className="border-b border-slate-100 px-5 py-4 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">AI search results</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Live recommendations on this page</h2>
      </div>

      <div className="space-y-5 px-5 py-5 md:px-6">
        {visibleMessages.length > 0 && (
          <div className="space-y-4">
            {visibleMessages.slice(-4).map((message) => (
              <div key={message.id} className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {message.role === "user" ? "You asked" : "AI summary"}
                </span>
                <div
                  className={
                    message.role === "user"
                      ? "rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                      : "rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-800"
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              Searching matching homes and preparing the AI response...
            </div>
            <LoadingPreview />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {lastAssistantMessage?.properties && lastAssistantMessage.properties.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">Matching properties</h3>
              <span className="text-xs font-medium text-slate-500">
                {lastAssistantMessage.properties.length} result
                {lastAssistantMessage.properties.length === 1 ? "" : "s"}
              </span>
            </div>
            <PropertyMatchList properties={lastAssistantMessage.properties} />
          </div>
        )}

        {!isLoading && !error && lastAssistantMessage && lastAssistantMessage.properties?.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No exact property cards came back for that query yet. Try a looser budget, another location, or fewer
            must-have features.
          </div>
        )}
      </div>
    </section>
  );
}
