"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || "";

  if (normalized === "resolved" || normalized === "completed" || normalized === "accepted") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
        Resolved
      </span>
    );
  }

  if (normalized === "industry_funded" || normalized === "industry_offered") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
        CSR / Industry Funded
      </span>
    );
  }

  if (normalized === "proposal_submitted") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-600"></span>
        Proposal Formulated
      </span>
    );
  }

  if (normalized === "hei_assigned") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-indigo-600"></span>
        HEI Assigned
      </span>
    );
  }

  if (normalized === "triaged") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-purple-600"></span>
        AI Triaged
      </span>
    );
  }

  if (normalized === "in_progress") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-cyan-600"></span>
        In R&D
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-400"></span>
      {status || "Submitted"}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toLowerCase() || "";
  if (p === "critical") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white uppercase tracking-wider">
        Critical
      </span>
    );
  }
  if (p === "high") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
        High
      </span>
    );
  }
  if (p === "medium") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      Low
    </span>
  );
}

export function AISimulatedBadge({ isSimulated }: { isSimulated: boolean }) {
  if (isSimulated) {
    return (
      <span
        title="Classified via local deterministic heuristic rule engine (GEMINI_API_KEY unconfigured)"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        AI: Simulated
      </span>
    );
  }
  return (
    <span
      title="Verified live by Google Gemini 2.5 Flash API"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      AI: Gemini Live
    </span>
  );
}
