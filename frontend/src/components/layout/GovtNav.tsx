"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitMerge,
  BarChart3,
  MapPin,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NotificationDrawer } from "@/components/NotificationDrawer";

export function GovtSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "State Overview", href: "/govt", icon: LayoutDashboard, exact: true },
    { label: "Triage & Duplicates", href: "/govt/triage", icon: GitMerge },
    { label: "Department Performance", href: "/govt/performance", icon: BarChart3 },
    { label: "GIS & Heatmaps", href: "/govt/analytics", icon: MapPin },
  ];

  return (
    <aside className="w-[260px] max-w-[260px] shrink-0 bg-[#001733] text-white flex flex-col justify-between min-h-screen border-r border-slate-800 z-30">
      {/* Top Section */}
      <div className="p-5 space-y-6">
        {/* State Seal & Brand */}
        <div className="space-y-3 pb-4 border-b border-slate-800">
          <Link href="/govt" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-extrabold text-xl shadow-sm border border-[#0A3161]">
              सं
            </div>
            <div>
              <div className="font-bold text-white text-sm font-heading flex items-center gap-1.5">
                Govt Cockpit
                <span className="text-[9px] font-bold uppercase bg-rose-600 text-white px-1.5 py-0.2 rounded">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                Govt. of Jharkhand
              </p>
            </div>
          </Link>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>System Telemetry</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-200 mt-1">
              Engine: PostgreSQL + PostGIS
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Executive Command
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all focus-ring ${
                  isActive
                    ? "bg-[#0A3161] text-white font-semibold border-l-4 border-[#FED65B] shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-black/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#002147] text-[#FED65B] font-bold text-xs flex items-center justify-center border border-[#0A3161] shrink-0">
              {user?.full_name?.charAt(0) || "G"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || "State Administrator"}
              </p>
              <p className="text-[10px] text-slate-400">Govt Admin</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function GovtHeader() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          State Civic Intelligence & HEI Allocation Control Room
        </span>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDrawer />
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-slate-800 block leading-tight">
            Dept. of Higher & Tech Education
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Ranchi, Jharkhand
          </span>
        </div>
      </div>
    </header>
  );
}
