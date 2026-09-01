"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, LogIn, UserPlus, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

export function PublicNavbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [trackQuery, setTrackQuery] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      router.push(`/track?id=${encodeURIComponent(trackQuery.trim())}`);
      setTrackQuery("");
    }
  };

  const getPortalLink = () => {
    if (!user) return "/auth/login";
    if (user.role === "hei_reviewer") return "/hei";
    if (user.role === "industry_partner") return "/industry";
    if (user.role === "govt_admin") return "/govt";
    return "/citizen";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Institutional Header Bar */}
      <div className="bg-[#001733] text-white text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-blue-950">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#FED65B] tracking-wider uppercase">
              Govt. of Jharkhand
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300">
              Department of Higher, Technical Education & Skill Development
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/track" className="hover:text-[#FED65B] transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#FED65B]" />
              Public Tracking
            </Link>
            <span className="text-slate-600">|</span>
            <a href="tel:1800-345-6543" className="hidden md:inline hover:text-white">
              Toll-Free Helpline: 1800-345-6543
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-extrabold text-xl shadow-sm border border-[#0A3161]">
              सं
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base sm:text-lg leading-tight font-heading flex items-center gap-1.5">
                Samadhan Setu
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FED65B] text-[#002147] px-1.5 py-0.5 rounded">
                  Jharkhand
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Civic Need to Institutional R&D & CSR Solution Platform
              </p>
            </div>
          </Link>

          {/* Quick Track Input */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleTrackSubmit} className="hidden md:flex items-center relative">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Track ID (e.g. JH-2026-4192)"
                className="w-56 pl-8 pr-3 py-1.5 text-xs rounded-full border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FED65B]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            </form>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href={getPortalLink()}>
                  <Button variant="primary" size="sm">
                    Open My Portal ({user.role.replace("_", " ")})
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="accent" size="sm">
                    <UserPlus className="w-3.5 h-3.5" />
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#001733] text-white pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs text-slate-300">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FED65B] text-[#002147] font-bold flex items-center justify-center text-sm">
                सं
              </div>
              <span className="font-bold text-white text-sm font-heading">
                Samadhan Setu Jharkhand
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              An institutional bridge transforming citizen grievance telemetry into applied university R&D problem statements and CSR-funded civic innovations.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Participating HEIs
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li>BIT Mesra, Ranchi</li>
              <li>IIT (ISM) Dhanbad</li>
              <li>NIT Jamshedpur</li>
              <li>Birsa Agricultural University (BAU)</li>
              <li>Jharkhand Rai University</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Stakeholder Portals
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li><Link href="/citizen" className="hover:text-white">Citizen PWA Service</Link></li>
              <li><Link href="/hei" className="hover:text-white">HEI Research Dashboard</Link></li>
              <li><Link href="/industry" className="hover:text-white">Industry CSR Innovation</Link></li>
              <li><Link href="/govt" className="hover:text-white">State Administration BI</Link></li>
              <li><Link href="/track" className="hover:text-white">Public Status Tracker</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">
              Governance & Compliance
            </h4>
            <p className="text-slate-400">
              Department of Higher, Technical Education & Skill Development, Govt. of Jharkhand, Nepal House, Doranda, Ranchi.
            </p>
            <p className="text-[#FED65B] font-medium pt-1">
              Grievance SLA: 72h Triage
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Government of Jharkhand • All Rights Reserved
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>AI Triage: Gemini 2.5 Flash</span>
            <span>Vector Search: pgvector</span>
            <span>PostGIS Geotagging</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
