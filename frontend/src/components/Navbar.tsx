"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Briefcase,
  BarChart3,
  Search,
  LogIn,
  LogOut,
  UserCheck,
  Shield,
  Layers,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NotificationDrawer } from "./NotificationDrawer";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loginAs } = useAuth();
  const [trackQuery, setTrackQuery] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      router.push(`/citizen?track=${encodeURIComponent(trackQuery.trim())}`);
      setTrackQuery("");
    }
  };

  const navLinks = [
    { name: "Citizen PWA", href: "/citizen", icon: Users, role: "citizen" },
    { name: "HEI Portal", href: "/hei", icon: Building2, role: "hei_reviewer" },
    { name: "Industry Portal", href: "/industry", icon: Briefcase, role: "industry_partner" },
    { name: "Govt Dashboard", href: "/govt", icon: BarChart3, role: "govt_admin" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Helper Bar */}
      <div className="bg-primary-container text-white text-[11px] px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-blue-900/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-secondary-container tracking-wider uppercase">
            Govt. of Jharkhand
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            Samadhan Setu — Civic Grievance to HEI Research & CSR Resolution
          </span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-300 mr-1 hidden md:inline font-medium">
            Demo Persona Switcher:
          </span>
          <button
            onClick={() => {
              loginAs("citizen");
              router.push("/citizen");
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === "citizen"
                ? "bg-secondary-container text-slate-950 font-bold"
                : "bg-blue-950/80 text-slate-300 hover:text-white"
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => {
              loginAs("hei_reviewer");
              router.push("/hei");
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === "hei_reviewer"
                ? "bg-secondary-container text-slate-950 font-bold"
                : "bg-blue-950/80 text-slate-300 hover:text-white"
            }`}
          >
            BIT Mesra (HEI)
          </button>
          <button
            onClick={() => {
              loginAs("industry_partner");
              router.push("/industry");
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === "industry_partner"
                ? "bg-secondary-container text-slate-950 font-bold"
                : "bg-blue-950/80 text-slate-300 hover:text-white"
            }`}
          >
            Tata Steel (CSR)
          </button>
          <button
            onClick={() => {
              loginAs("govt_admin");
              router.push("/govt");
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === "govt_admin"
                ? "bg-secondary-container text-slate-950 font-bold"
                : "bg-blue-950/80 text-slate-300 hover:text-white"
            }`}
          >
            Govt Admin
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-secondary-container flex items-center justify-center font-black text-xl shadow-sm border border-blue-900">
              सं
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight font-heading flex items-center gap-1.5">
                Samadhan Setu
                <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-slate-950 px-1.5 py-0.5 rounded">
                  Jharkhand
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Bridging Public Needs, Academia & Industry
              </p>
            </div>
          </Link>

          {/* Portal Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary-container text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Quick Track Search, Notifications, User */}
          <div className="flex items-center gap-3">
            {/* Quick Track Input */}
            <form onSubmit={handleTrackSubmit} className="hidden sm:flex items-center relative">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Track ID (e.g. JH-2026-4192)"
                className="w-48 lg:w-56 pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            </form>

            {/* In-app Notification Bell */}
            <NotificationDrawer />

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-container hover:bg-blue-950 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-50 border-t border-slate-200 px-2 py-2 text-[11px] font-semibold">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                isActive ? "text-primary-container font-bold" : "text-slate-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
