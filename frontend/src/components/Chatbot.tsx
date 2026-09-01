"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Lady AI Assistant SVG Icon (Used consistently everywhere) ────────────────
function LadyAvatarIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head */}
      <circle cx="32" cy="21" r="11" fill="currentColor" fillOpacity="0.95" />
      {/* Hair top with soft bun/curve */}
      <path d="M21 19 Q22 8 32 7 Q42 8 43 19" fill="currentColor" fillOpacity="0.95" />
      {/* Hair side strands */}
      <path
        d="M21 19 Q18 24 20 28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M43 19 Q46 24 44 28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Eyes */}
      <circle cx="27.5" cy="20" r="1.4" fill="#002147" fillOpacity="0.75" />
      <circle cx="36.5" cy="20" r="1.4" fill="#002147" fillOpacity="0.75" />
      {/* Friendly Smile */}
      <path
        d="M28 25 Q32 28 36 25"
        stroke="#002147"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Shoulders / Formal Blazer Silhouette */}
      <path
        d="M17 48 Q18 36 24 33 Q28 31 32 31 Q36 31 40 33 Q46 36 47 48"
        fill="currentColor"
        fillOpacity="0.95"
      />
      {/* Headset Arc */}
      <path
        d="M19 20 Q19 7 32 7 Q45 7 45 20"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Headset Earpieces */}
      <rect x="16" y="20" width="5.5" height="8" rx="2.75" fill="currentColor" opacity="0.95" />
      <rect x="42.5" y="20" width="5.5" height="8" rx="2.75" fill="currentColor" opacity="0.95" />
      {/* Headset Mic */}
      <path
        d="M39 29 Q42 32 39 35"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <circle cx="38" cy="35.5" r="1.5" fill="currentColor" opacity="0.95" />
    </svg>
  );
}

// ─── Role Configuration (English UI & Website Navy-Gold Theme) ─────────────────
const ROLE_CONFIG = {
  guest: {
    name: "Samadhan AI",
    subtitle: "Civic Platform Guide",
    roleBadge: "Public Guide",
    tooltipCallout: "Need help exploring Samadhan Setu? ✨",
    greeting:
      "Hello! 👋 Welcome to **Samadhan Setu Jharkhand**.\n\nI am your AI guide. You can ask me:\n- 🏛️ How the platform works & how to report civic issues\n- 📋 Which departments handle water, road, or electricity problems\n- ✍️ How to draft a formal grievance letter to authorities\n- 🔐 *Note: To track your personal complaints, please log in.*",
    suggestions: [
      "How does Samadhan Setu work?",
      "How do I file a water supply grievance?",
      "Which colleges and CSR partners are involved?",
      "Draft a complaint letter for a broken road",
    ],
  },
  citizen: {
    name: "Samadhan AI",
    subtitle: "Civic Platform Assistant",
    roleBadge: "Citizen Support",
    tooltipCallout: "Need help or want to check your grievance status? ✨",
    greeting:
      "Hello! 👋 I am **Samadhan AI** — your assistant on the Samadhan Setu platform.\n\nHow can I assist you today?\n- 🏛️ Check the live status of your filed grievances\n- 📋 Learn how to submit a new complaint\n- 📸 Guidance on uploading photos & evidence\n- ✍️ Draft formal complaint applications to authorities",
    suggestions: [
      "What is the status of my recent complaints?",
      "How do I file a new grievance?",
      "Draft a road repair letter to the Mukhiya",
      "Which department handles electricity issues?",
    ],
  },
  govt_admin: {
    name: "Samadhan Analytics AI",
    subtitle: "Policy & Administrative Intelligence",
    roleBadge: "Govt Admin",
    tooltipCallout: "Officer, need live district analytics or notes? 📊",
    greeting:
      "Welcome, Officer. I am your **Samadhan Analytics AI**.\n\nI can assist you with administrative workflows:\n- 📊 District & domain-wise grievance summaries\n- ⚠️ Critical escalation & priority reports across 24 districts\n- 📝 Drafting official policy notices, press releases, and memos\n- 🏫 HEI performance tracking (BIT Mesra, IIT ISM, NIT)",
    suggestions: [
      "Summarize pending water issues in Khunti district",
      "Which domain has the highest critical complaints?",
      "Draft an official response for a road repair report",
      "Which HEI has the highest active proposals?",
    ],
  },
  industry_partner: {
    name: "CSR Impact Navigator",
    subtitle: "CSR Investment & Impact Advisor",
    roleBadge: "CSR Partner",
    tooltipCallout: "Discover high-impact CSR projects to sponsor 💼",
    greeting:
      "Welcome! I am your **CSR Impact Navigator** for Samadhan Setu Jharkhand.\n\nI can assist you with:\n- 💼 Discovering high-impact civic R&D projects needing CSR sponsorship\n- 📊 Tracking your funded CSR commitments & milestone progress\n- 🎯 Aligning investments with SDG goals & Section 135 compliance\n- 📋 Drafting CSR impact briefs & board presentations",
    suggestions: [
      "Show me Education & Skilling projects needing funding",
      "What is our total CSR budget pledged so far?",
      "Which water sanitation projects have high social impact?",
      "Track the progress of our funded project at BIT Mesra",
    ],
  },
  hei_reviewer: {
    name: "Research Coordinator AI",
    subtitle: "Academic Research & Proposal Assistant",
    roleBadge: "HEI Reviewer",
    tooltipCallout: "Review assigned civic reports & draft proposals 🔬",
    greeting:
      "Hello, Professor. I am your **Research Coordinator AI** on Samadhan Setu.\n\nI can assist your institution with:\n- 🔬 Matching citizen grievance clusters with your department's specialization\n- 📝 Drafting technical proposals, research methodologies & budgets\n- 📋 Analyzing citizen evidence & field survey reports\n- 🤝 Inter-institutional collaboration & CSR funding proposals",
    suggestions: [
      "Show new agriculture grievances for biotechnology dept",
      "Draft a technical proposal for rural soil salinity issue",
      "Summarize evidence and citizen notes in Report #102",
      "Suggest field research methodology for water filtration",
    ],
  },
} as const;

type UserRole = keyof typeof ROLE_CONFIG;
const DEFAULT_ROLE: UserRole = "guest";

// ─── Simple Markdown Renderer ──────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-sm mt-2 mb-1 text-navy-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-sm mt-2 mb-1 text-navy-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h2 class="font-bold text-sm mt-2 mb-1 text-navy-900">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc text-slate-800">$1</li>')
    .replace(/^• (.+)$/gm, '<li class="ml-3 list-disc text-slate-800">$1</li>')
    .replace(/\n/g, "<br/>");
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div
        className="w-2 h-2 rounded-full bg-navy-800 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 rounded-full bg-gold-600 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 rounded-full bg-navy-800 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

// ─── Main Chatbot Component ────────────────────────────────────────────────────
export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showCallout, setShowCallout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const role = ((user?.role as UserRole) ?? "guest") in ROLE_CONFIG ? ((user?.role as UserRole) ?? "guest") : DEFAULT_ROLE;
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG[DEFAULT_ROLE];

  // Automatically clear all chat messages on logout or when switching accounts
  const previousUserIdRef = useRef<number | undefined>(user?.id);

  useEffect(() => {
    if (previousUserIdRef.current !== user?.id) {
      previousUserIdRef.current = user?.id;
      setMessages([]);
      setHasGreeted(false);
      setInput("");
    }
  }, [user]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowCallout(false);
    }
  }, [isOpen]);

  // Add greeting message when first opened
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setMessages([
        {
          id: `greeting-${user?.id ?? "guest"}-${Date.now()}`,
          role: "assistant",
          content: config.greeting,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, hasGreeted, config.greeting, user]);

  // Animate button in after 1.2s, then show callout popup after 2.4s
  useEffect(() => {
    const timer1 = setTimeout(() => setIsVisible(true), 1200);
    const timer2 = setTimeout(() => {
      if (!isOpen) setShowCallout(true);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      // Build history from current messages (excluding greeting)
      const history = messages
        .filter((m) => !m.id.startsWith("greeting"))
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

      try {
        const res = await api.sendChatMessage(trimmed, history);
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: res.reply || "I apologize, I could not generate a response. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Error**: ${err?.message || "Could not connect to the AI server. Please try again."}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setShowCallout(false);
  };

  const clearChat = () => {
    setHasGreeted(false);
    setMessages([]);
    setTimeout(() => {
      setHasGreeted(true);
      setMessages([
        {
          id: `greeting-reset-${Date.now()}`,
          role: "assistant",
          content: config.greeting,
          timestamp: new Date(),
        },
      ]);
    }, 50);
  };

  return (
    <>
      {/* ── Floating Chat Window (Website Navy & Clean Design) ────────── */}
      <div
        className={`fixed bottom-24 right-5 z-[9998] flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{
          width: "min(420px, calc(100vw - 24px))",
          height: "min(620px, calc(100vh - 120px))",
          transformOrigin: "bottom right",
          filter: "drop-shadow(0 20px 40px rgba(0, 33, 71, 0.22))",
        }}
        aria-label="Samadhan Setu AI Chatbot"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-border-subtle shadow-modal">
          {/* ── Header (Website Primary Navy & Gold Stripe) ───────────── */}
          <div className="relative flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white flex-shrink-0 shadow-md">
            {/* Top subtle Gold line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-500" />

            {/* Lady AI Avatar Icon */}
            <div className="relative w-10 h-10 rounded-full bg-navy-800 border-2 border-gold-500/60 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
              <LadyAvatarIcon size={26} className="text-white" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-navy-900" />
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-sm leading-tight truncate">
                  {config.name}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gold-500/20 text-gold-500 border border-gold-500/30">
                  {config.roleBadge}
                </span>
              </div>
              <p className="text-slate-300 text-xs truncate mt-0.5">{config.subtitle}</p>
            </div>

            <div className="relative flex items-center gap-1 flex-shrink-0">
              {/* Clear button */}
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                title="Clear chat"
                aria-label="Clear chat history"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
              {/* Close button */}
              <button
                onClick={handleToggle}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages List (Clean & Readable) ────────────────────── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 bg-surface-subtle"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Assistant Lady Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-navy-900 border border-gold-500/40 text-white shadow-sm mt-auto">
                    <LadyAvatarIcon size={20} className="text-white" />
                  </div>
                )}
                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gold-500 text-navy-950 font-bold text-xs shadow-sm mt-auto border border-gold-600">
                    {user?.full_name?.charAt(0)?.toUpperCase() ?? "G"}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm
                    ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-navy-900 text-white"
                        : "rounded-bl-sm bg-white text-text-primary border border-border-subtle"
                    }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    className="prose-sm leading-relaxed"
                  />
                  <p
                    className={`text-[10px] mt-1.5 text-right ${
                      msg.role === "user" ? "text-slate-300" : "text-text-muted"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-end">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-navy-900 border border-gold-500/40 text-white shadow-sm">
                  <LadyAvatarIcon size={20} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-white border border-border-subtle shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Suggestions (English Action Chips) ────────────── */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 py-2.5 bg-surface-sunken/80 border-t border-border-subtle flex flex-wrap gap-1.5 flex-shrink-0">
              {config.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all bg-white hover:bg-navy-50 text-navy-900 border border-border-subtle hover:border-navy-800/40 shadow-subtle active:scale-95 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Input Area (Always Active) ─────────────────────────── */}
          <div className="px-3.5 py-3 bg-white border-t border-border-subtle flex-shrink-0">
            <div className="flex items-end gap-2 rounded-xl px-3 py-2 bg-surface-subtle border border-border-subtle focus-within:border-navy-800 focus-within:ring-2 focus-within:ring-navy-100 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 90)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-text-primary text-sm outline-none resize-none placeholder:text-text-muted leading-relaxed"
                style={{ maxHeight: "90px", minHeight: "24px" }}
                aria-label="Chat message input"
                id="chatbot-input"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-navy-900 hover:bg-navy-800 text-white disabled:opacity-30 active:scale-90 shadow-sm"
                aria-label="Send message"
                id="chatbot-send-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            {/* Clean Platform Footer */}
            <div className="flex items-center justify-center gap-1.5 mt-2 text-text-muted text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
              <span>Samadhan Setu Jharkhand · AI Assistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Speech Bubble Callout (In English Above Toggle) ── */}
      {!isOpen && showCallout && (
        <div
          onClick={handleToggle}
          className="fixed bottom-24 right-5 z-[9999] max-w-[280px] bg-navy-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl rounded-br-none border border-gold-500/40 shadow-modal cursor-pointer transition-all duration-300 hover:scale-[1.03] animate-bounce"
          style={{
            animationDuration: "3s",
            filter: "drop-shadow(0 10px 20px rgba(0, 33, 71, 0.35))",
          }}
          title="Click to chat"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-base mt-0.5 animate-pulse">✨</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gold-500 leading-tight">
                {config.name}
              </p>
              <p className="text-[11.5px] text-slate-200 mt-0.5 leading-snug">
                {config.tooltipCallout}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCallout(false);
              }}
              className="text-slate-400 hover:text-white p-0.5 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Dismiss greeting"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button (Circle with Lady AI + Sparkle & Live Dot) ── */}
      <button
        onClick={handleToggle}
        id="chatbot-toggle-btn"
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        className={`fixed bottom-5 right-5 z-[9999] w-16 h-16 rounded-full
          flex items-center justify-center transition-all duration-500 active:scale-90 hover:scale-105 group
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{
          background: "linear-gradient(135deg, #001733 0%, #002147 60%, #0A3161 100%)",
          boxShadow: "0 10px 30px rgba(0, 33, 71, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2)",
          border: "2.5px solid #FED65B",
        }}
      >
        {/* Soft Gold Pulse ring when closed */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
            style={{ background: "#FED65B" }}
          />
        )}

        {/* Golden AI Sparkle Badge (Top-Left) */}
        {!isOpen && (
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center text-[10px] shadow-sm border border-navy-950 animate-pulse">
            ✨
          </span>
        )}

        {/* Live Online Green Dot (Bottom-Right) */}
        {!isOpen && (
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-navy-950 shadow-sm" />
        )}

        {/* Main Center Icon */}
        <span className="relative flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
          {isOpen ? (
            /* Close X icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            /* Female AI Assistant Lady Icon */
            <LadyAvatarIcon size={34} className="text-white" />
          )}
        </span>

        {/* Unread message count badge */}
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-white text-white text-[10px] flex items-center justify-center font-extrabold shadow">
            {messages.length - 1}
          </span>
        )}
      </button>
    </>
  );
}
