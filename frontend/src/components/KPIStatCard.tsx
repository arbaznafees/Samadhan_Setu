"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface KPIStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: "navy" | "gold" | "emerald" | "purple";
}

export function KPIStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accentColor = "navy",
}: KPIStatCardProps) {
  const getColors = () => {
    switch (accentColor) {
      case "gold":
        return {
          iconBg: "bg-amber-100 text-amber-900 border-amber-200",
          border: "border-amber-200",
        };
      case "emerald":
        return {
          iconBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
          border: "border-emerald-200",
        };
      case "purple":
        return {
          iconBg: "bg-purple-100 text-purple-900 border-purple-200",
          border: "border-purple-200",
        };
      default:
        return {
          iconBg: "bg-primary-container text-white border-primary-container",
          border: "border-slate-200",
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`bg-white rounded-2xl p-5 border ${colors.border} shadow-subtle hover:shadow-card transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${colors.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={`font-semibold ${
                  trendPositive ? "text-emerald-600" : "text-slate-600"
                }`}
              >
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
