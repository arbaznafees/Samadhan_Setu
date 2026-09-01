"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lightbulb,
  Briefcase,
  Layers,
  Award,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NotificationDrawer } from "@/components/NotificationDrawer";

export function IndustrySidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Browse Solutions", href: "/industry", icon: Lightbulb, exact: true },
    { label: "Funded Projects", href: "/industry/commitments", icon: Layers },
    { label: "Impact & ESG Reports", href: "/industry/impact", icon: Award },
  ];

  return (
    <aside className="w-[260px] max-w-[260px] shrink-0 bg-[#001733] text-white flex flex-col justify-between min-h-screen border-r border-slate-800 z-30">
      {/* Top Section */}
      <div className="p-5 space-y-6">
        {/* Brand & Corporate ID */}
        <div className="space-y-3 pb-4 border-b border-slate-800">
          <Link href="/industry" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-extrabold text-xl shadow-sm border border-[#0A3161]">
              सं
            </div>
            <div>
              <div className="font-bold text-white text-sm font-heading flex items-center gap-1.5">
                Industry Portal
                <span className="text-[9px] font-bold uppercase bg-[#FED65B] text-[#002147] px-1.5 py-0.2 rounded">
                  CSR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                {user?.organization || "Tata Steel CSR Foundation"}
              </p>
            </div>
          </Link>

          {/* CSR Allocation Status */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>CSR Budget FY26</span>
              <span className="text-emerald-400 font-bold">₹50,00,000</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#FED65B] h-full w-[45%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Pledged: ₹22,50,000</span>
              <span>Available: ₹27,50,000</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Innovation Marketplace
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
              {user?.full_name?.charAt(0) || "I"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || "CSR Manager"}
              </p>
              <p className="text-[10px] text-slate-400">CSR Officer</p>
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

export function IndustryHeader() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Jharkhand CSR & Corporate Co-Innovation Framework
        </span>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDrawer />
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-slate-800 block leading-tight">
            Schedule VII Compliant
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            100% Tax Deductible 80G
          </span>
        </div>
      </div>
    </header>
  );
}
