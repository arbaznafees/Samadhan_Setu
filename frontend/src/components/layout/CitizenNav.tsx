"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MapPin,
  Languages,
  LogOut,
  User,
  PlusCircle,
  FileText,
  Home,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { Button } from "@/components/ui/Button";

export function CitizenHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [lang, setLang] = useState<"en" | "hi">("en");

  const toggleLang = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/citizen" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-bold text-lg shadow-sm">
            सं
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base font-heading flex items-center gap-1.5 leading-tight">
              {lang === "en" ? "Citizen Portal" : "नागरिक सेवा"}
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FED65B] text-[#002147] px-1.5 py-0.2 rounded">
                JH
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              {lang === "en"
                ? "Grievance to HEI Resolution Service"
                : "नागरिक समस्या एवं समाधान पोर्टल"}
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors focus-ring"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-[#002147]" />
            <span>{lang === "en" ? "हिन्दी" : "English"}</span>
          </button>

          {/* Notifications */}
          <NotificationDrawer />

          {/* Desktop New Report Button */}
          <Link href="/citizen/report" className="hidden sm:inline-flex">
            <Button variant="accent" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              {lang === "en" ? "File Grievance" : "शिकायत दर्ज करें"}
            </Button>
          </Link>

          {/* Profile & Logout */}
          {user ? (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#002147] text-white flex items-center justify-center text-xs font-bold">
                {user.full_name?.charAt(0) || "C"}
              </div>
              <button
                onClick={() => logout()}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function CitizenBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Home", href: "/citizen", icon: Home },
    { label: "Report", href: "/citizen/report", icon: PlusCircle, isCta: true },
    { label: "My Reports", href: "/citizen#reports", icon: FileText },
    { label: "Track", href: "/track", icon: MapPin },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/citizen"
              ? pathname === "/citizen"
              : pathname.startsWith(tab.href);

          if (tab.isCta) {
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#FED65B] border-4 border-white text-[#002147] flex items-center justify-center shadow-elevated transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-900 mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-[#002147] font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
