"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type Role = "user" | "model";
interface ChatMessage {
  role: Role;
  content: string;
}

const PORTAL_BY_PATH: { prefix: string; portal: string }[] = [
  { prefix: "/citizen", portal: "citizen" },
  { prefix: "/hei", portal: "hei" },
  { prefix: "/industry", portal: "industry" },
  { prefix: "/govt", portal: "govt" },
];

// The assistant's capabilities are the same everywhere (file/track a grievance, get site
// navigation help, or ask general questions) — only the greeting copy changes by page, as a
// light contextual touch.
const PORTAL_LABEL = "Setu Sahayak";

const PORTAL_GREETING: Record<string, string> = {
  citizen:
    "Namaste! I'm Setu Sahayak. I can help you file a new grievance, track any report by tracking number, or find your way around the site.",
  hei: "Namaste! I'm Setu Sahayak. Ask me about how reports are matched to institutions, forming a team and submitting a proposal — or I can also file/track a citizen grievance for you.",
  industry: "Namaste! I'm Setu Sahayak. Ask me about browsing proposals or pledging CSR funding — or I can also file/track a citizen grievance for you.",
  govt: "Namaste! I'm Setu Sahayak. Ask me about the analytics dashboard, duplicate inspection, or reassigning a report — or I can also file/track a citizen grievance for you.",
};

function getPortal(pathname: string | null): string {
  if (!pathname) return "citizen";
  const match = PORTAL_BY_PATH.find((p) => pathname.startsWith(p.prefix));
  return match ? match.portal : "citizen";
}

/** Very small **bold** / `code` / [label](/path) renderer — no markdown lib dependency. */
function renderInline(text: string, onNavigate: () => void) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(\/[^)]*\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-surface-container-high px-1 py-0.5 rounded text-[12px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\((\/[^)]*)\)$/);
    if (linkMatch) {
      const [, label, path] = linkMatch;
      return (
        <Link
          key={i}
          href={path}
          onClick={onNavigate}
          className="inline-flex items-center underline decoration-dotted font-medium text-primary-container hover:text-secondary"
        >
          {label}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatWidget() {
  const pathname = usePathname();
  const portal = getPortal(pathname);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSimulated, setLastSimulated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.sendChatMessage({ messages: nextMessages, portal });
      setMessages([...nextMessages, { role: "model", content: res.reply }]);
      setLastSimulated(!!res.is_simulated);
    } catch (err: any) {
      setMessages([
        ...nextMessages,
        { role: "model", content: "Sorry, something went wrong reaching the assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const displayMessages = messages.length > 0 ? messages : [{ role: "model" as Role, content: PORTAL_GREETING[portal] }];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-xl shadow-elevated border border-outline-variant flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary-container text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-secondary-container text-slate-950 font-bold flex items-center justify-center text-xs">
                सं
              </div>
              <div>
                <div className="font-heading font-semibold text-sm leading-tight">{PORTAL_LABEL}</div>
                <div className="text-[10px] text-on-primary-container leading-tight">Samadhan Setu Jharkhand</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-slate-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-surface-container-low">
            {displayMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary-container text-white rounded-br-sm"
                      : "bg-white text-on-surface border border-outline-variant rounded-bl-sm shadow-subtle"
                  }`}
                >
                  {renderInline(m.content, () => setOpen(false))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-outline-variant rounded-lg rounded-bl-sm px-3 py-2 shadow-subtle flex items-center gap-2 text-on-surface-variant text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {lastSimulated && (
            <div className="px-3 py-1 bg-secondary-container/40 text-[10px] text-on-secondary-container border-t border-outline-variant flex items-center gap-1 shrink-0">
              <Sparkles size={11} /> AI: Simulated mode (no live Gemini key configured)
            </div>
          )}

          {/* Input */}
          <div className="p-2.5 border-t border-outline-variant bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question, file a report, or track one…"
              className="flex-1 text-sm border border-outline-variant rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-container/40"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-full bg-secondary-container text-slate-950 flex items-center justify-center disabled:opacity-40 shadow-gold shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="w-14 h-14 rounded-full bg-primary-container text-white shadow-elevated flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
