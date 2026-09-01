"use client";

import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";

export interface TimelineStep {
  title: string;
  description?: string;
  date?: string;
  status: "completed" | "current" | "upcoming" | "failed";
}

export interface TimelineProps {
  steps: TimelineStep[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function Timeline({
  steps,
  orientation = "vertical",
  className = "",
}: TimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className={`w-full py-4 ${className}`}>
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0" />

          {steps.map((step, idx) => {
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";

            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center relative z-10 px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-sm"
                      : isCurrent
                      ? "bg-[#002147] text-white ring-4 ring-[#FED65B]/60 shadow-sm"
                      : "bg-slate-100 text-slate-400 border border-slate-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <p
                  className={`text-xs font-semibold mt-2 ${
                    isCurrent
                      ? "text-[#002147] font-bold"
                      : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                {step.date && (
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {step.date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Timeline
  return (
    <div className={`space-y-6 relative pl-6 border-l-2 border-slate-200 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        return (
          <div key={idx} className="relative group">
            {/* Step Node */}
            <div
              className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted
                  ? "bg-emerald-600 text-white shadow-sm"
                  : isCurrent
                  ? "bg-[#002147] text-white ring-4 ring-[#FED65B]/60"
                  : "bg-slate-100 text-slate-400 border border-slate-300"
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : isCurrent ? (
                <Clock className="w-3.5 h-3.5 text-[#FED65B]" />
              ) : (
                <span className="text-[10px]">{idx + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-[#002147]"
                      : isCompleted
                      ? "text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-xs text-slate-400">{step.date}</span>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
