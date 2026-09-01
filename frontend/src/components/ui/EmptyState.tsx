"use client";

import React from "react";
import { LucideIcon, FileQuestion } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`py-12 px-4 text-center max-w-md mx-auto ${className}`}>
      {/* Dual-tone circular icon container with subtle gold accent */}
      <div className="relative w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-subtle">
        <Icon className="w-8 h-8 text-slate-500" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FED65B] border-2 border-white" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-800 font-heading">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div>
          {actionHref ? (
            <a href={actionHref}>
              <Button variant="primary" size="md">
                {actionLabel}
              </Button>
            </a>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
