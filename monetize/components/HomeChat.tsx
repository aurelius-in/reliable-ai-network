"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { track } from "@/lib/track";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How do I find my first paying customer?",
  "What do I get free?",
  "Is this an app builder?",
];

const LINK_RE = /(\/(?:signup|sample|pricing|guarantee|methodology))\b/g;

function renderWithLinks(text: string) {
  const parts = text.split(LINK_RE);
  return parts.map((part, i) =>
    /^\/(signup|sample|pricing|guarantee|methodology)$/.test(part) ? (
      <a
        key={i}
        href={part}
        className="font-semibold text-aqua underline hover:text-aqua-bright"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function HomeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    track("home_chat_send", { len: question.length });
    try {
      const res = await fetch("/api/home-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.reply ??
            "Sorry — something went wrong. Try /sample or email ai@reliableainetwork.com.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Sorry — something went wrong. Try /sample or email ai@reliableainetwork.com.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/15 bg-night-900 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 bg-night-800 px-4 py-3">
            <p className="text-sm font-bold text-white">
              Questions? Ask before you sign up.
            </p>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-slate-400 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-left"
          >
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Honest answers, no hard sell. Try one:
                </p>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="block w-full rounded-lg border border-white/10 bg-night-800 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-aqua/40 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-xl rounded-br-sm bg-aqua/15 px-3 py-2 text-sm text-white"
                    : "mr-8 rounded-xl rounded-bl-sm bg-night-800 px-3 py-2 text-sm leading-relaxed text-slate-200"
                }
              >
                {m.role === "assistant" ? renderWithLinks(m.content) : m.content}
              </div>
            ))}
            {busy && (
              <p className="mr-8 rounded-xl bg-night-800 px-3 py-2 text-sm text-slate-400">
                Thinking…
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-night-800 px-3 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              maxLength={500}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-night-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-aqua/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="rounded-lg bg-aqua/20 p-2 text-aqua transition enabled:hover:bg-aqua/30 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => {
          setOpen((o) => {
            if (!o) track("home_chat_open");
            return !o;
          });
        }}
        className="fixed bottom-4 right-4 z-50 flex h-13 w-13 items-center justify-center rounded-full border border-aqua/40 bg-night-800 p-3.5 text-aqua shadow-lg shadow-black/40 transition hover:bg-night-700"
      >
        <MessageCircle size={22} />
      </button>
    </>
  );
}
