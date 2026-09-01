"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export type StatusType =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "in-progress"
  | "resolved"
  | "duplicate"
  | "duplicate_flagged"
  | "funded"
  | "closed"
  | "rejected"
  | string;

interface BadgeProps {
  status?: StatusType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status = "submitted",
  label,
  size = "md",
  className = "",
  showDot = true,
}: BadgeProps) {
  const norm = (status || "").toLowerCase().replace("-", "_");

  let config = {
    text: "#0369A1",
    bg: "#E0F2FE",
    border: "#BAE6FD",
    dot: "#0284C7",
    displayName: "Submitted",
  };

  switch (norm) {
    case "submitted":
    case "pending":
    case "open":
      config = {
        text: "#0369A1",
        bg: "#E0F2FE",
        border: "#BAE6FD",
        dot: "#0284C7",
        displayName: "Submitted",
      };
      break;
    case "assigned":
    case "assigned_to_hei":
      config = {
        text: "#3730A3",
        bg: "#EEF2FF",
        border: "#C7D2FE",
        dot: "#4F46E5",
        displayName: "Assigned to HEI",
      };
      break;
    case "in_progress":
    case "research_in_progress":
    case "prototype_ready":
      config = {
        text: "#92400E",
        bg: "#FEF3C7",
        border: "#FDE68A",
        dot: "#D97706",
        displayName: norm === "prototype_ready" ? "Prototype Ready" : "In Progress",
      };
      break;
    case "resolved":
    case "completed":
    case "verified":
      config = {
        text: "#065F46",
        bg: "#D1FAE5",
        border: "#A7F3D0",
        dot: "#059669",
        displayName: "Resolved",
      };
      break;
    case "duplicate":
    case "duplicate_flagged":
      config = {
        text: "#9F1239",
        bg: "#FFE4E6",
        border: "#FECDD3",
        dot: "#E11D48",
        displayName: "Duplicate Flagged",
      };
      break;
    case "funded":
    case "csr_funded":
    case "partially_funded":
      config = {
        text: "#115E59",
        bg: "#CCFBF1",
        border: "#99F6E4",
        dot: "#0D9488",
        displayName: "CSR Funded",
      };
      break;
    case "closed":
    case "rejected":
      config = {
        text: "#334155",
        bg: "#F1F5F9",
        border: "#E2E8F0",
        dot: "#64748B",
        displayName: "Closed",
      };
      break;
    default:
      config = {
        text: "#334155",
        bg: "#F1F5F9",
        border: "#E2E8F0",
        dot: "#64748B",
        displayName: status.replace("_", " "),
      };
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border capitalize tracking-wide ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          style={{ backgroundColor: config.dot }}
          className="w-1.5 h-1.5 rounded-full shrink-0"
        />
      )}
      {label || config.displayName}
    </span>
  );
}

export function PriorityBadge({
  priority,
  size = "md",
}: {
  priority: string;
  size?: "sm" | "md";
}) {
  const norm = (priority || "").toLowerCase();
  let bg = "bg-slate-100 text-slate-700 border-slate-200";
  if (norm === "high" || norm === "urgent" || norm === "critical") {
    bg = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (norm === "medium") {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (norm === "low") {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-medium rounded-md border capitalize ${bg} ${sizeClasses}`}>
      {priority} Priority
    </span>
  );
}

export function AISimulatedBadge({ text = "AI Triaged" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#E6EDF5] text-[#002147] border border-[#B3C9E2]">
      <Sparkles className="w-3 h-3 text-[#0A3161]" />
      {text}
    </span>
  );
}
