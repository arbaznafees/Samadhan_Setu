"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Briefcase,
  BarChart3,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  GraduationCap,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/formatters";

export default function PublicLandingPage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [trackInput, setTrackInput] = useState("");

  useEffect(() => {
    api.getGovtAnalytics()
      .then((data) => setStats(data))
      .catch((err) => console.warn("Analytics fetch error:", err));
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      router.push(`/track?id=${encodeURIComponent(trackInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <PublicNavbar />

      <main className="flex-1 space-y-16 pb-20">
        {/* Hero Section - Light Clean Civic Standard with Deep Navy Typography */}
        <section className="relative bg-gradient-to-b from-[#002147] via-[#001733] to-[#0A3161] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FED65B_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FED65B] text-xs font-semibold tracking-wide shadow-sm backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Empowered by AI Triage, University R&D & CSR Capital
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight max-w-4xl mx-auto">
              Bridging Citizen Needs with <br className="hidden sm:inline" />
              <span className="text-[#FED65B]">University Research & Industry CSR</span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
              Samadhan Setu connects Jharkhand citizens directly with premier institutions
              (BIT Mesra, IIT ISM, NIT, BAU) to engineer permanent technological solutions funded by corporate CSR.
            </p>

            {/* Quick Track Input in Hero */}
            <div className="max-w-xl mx-auto pt-2">
              <form
                onSubmit={handleTrackSubmit}
                className="flex items-center bg-white rounded-full p-1.5 shadow-elevated border border-slate-200"
              >
                <div className="pl-4 pr-2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  placeholder="Enter Grievance Tracking ID (e.g. JH-2026-4192)"
                  className="flex-1 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#FED65B] hover:bg-[#E8BE40] text-[#002147] text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  Track Status
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Live Telemetry Summary from PostgreSQL */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-10 border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-white font-heading">
                    {stats.total_reports}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">Reported Grievances</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-heading">
                    {stats.resolution_rate_percentage}%
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">Resolution Rate</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-[#FED65B] font-heading">
                    {stats.active_projects}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">Active HEI R&D Projects</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-teal-300 font-heading">
                    {formatINR(stats.total_csr_funding_inr)}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">CSR Capital Pledged</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4 Dedicated Stakeholder Portals */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Four Specialized Stakeholder Experiences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Each stakeholder accesses an isolated workspace engineered specifically for their role in the civic innovation lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Citizen Portal */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002147] flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#002147] transition-colors font-heading">
                    Citizen Service
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Mobile-first PWA for filing grievances with GPS location & photo proofs. Track verified milestones in real time.
                  </p>
                </div>
              </div>
              <div className="pt-6 space-y-2">
                <Link href="/citizen">
                  <Button variant="accent" size="sm" className="w-full">
                    Open Citizen PWA
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    await loginAs("citizen");
                    router.push("/citizen");
                  }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-700 py-1"
                >
                  Quick Demo: Ramesh Kumar
                </button>
              </div>
            </div>

            {/* 2. HEI Portal */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors font-heading">
                    HEI Research
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Academic dashboard for state universities. Triage AI-matched problems, assign research teams, and submit prototype proposals.
                  </p>
                </div>
              </div>
              <div className="pt-6 space-y-2">
                <Link href="/hei">
                  <Button variant="primary" size="sm" className="w-full">
                    Open HEI Portal
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await loginAs("hei_reviewer");
                      router.push("/hei");
                    } catch {
                      router.push("/auth/login?role=hei_reviewer");
                    }
                  }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-700 py-1"
                >
                  Quick Demo: BIT Mesra
                </button>
              </div>
            </div>

            {/* 3. Industry Portal */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors font-heading">
                    Industry & CSR
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Deal-flow and innovation marketplace. Sponsor university R&D solutions for measurable ESG and 100% tax-deductible CSR.
                  </p>
                </div>
              </div>
              <div className="pt-6 space-y-2">
                <Link href="/industry">
                  <Button variant="primary" size="sm" className="w-full">
                    Open Industry Portal
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await loginAs("industry_partner");
                      router.push("/industry");
                    } catch {
                      router.push("/auth/login?role=industry_partner");
                    }
                  }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-700 py-1"
                >
                  Quick Demo: Tata Steel CSR
                </button>
              </div>
            </div>

            {/* 4. Govt Portal */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#002147] transition-colors font-heading">
                    Govt Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Executive command center with AI duplicate clustering, GIS heatmaps, SLA tracking, and manual HEI reassignment controls.
                  </p>
                </div>
              </div>
              <div className="pt-6 space-y-2">
                <Link href="/govt">
                  <Button variant="primary" size="sm" className="w-full">
                    Open Govt Cockpit
                  </Button>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await loginAs("govt_admin");
                      router.push("/govt");
                    } catch {
                      router.push("/auth/login?role=govt_admin");
                    }
                  }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-700 py-1"
                >
                  Quick Demo: State Admin
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Flow */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-subtle space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                The Civic Innovation Lifecycle
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                From ground-level citizen grievance to university engineering and CSR funding.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center mx-auto text-sm">
                  1
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">1. Citizen Reports</h4>
                <p className="text-xs text-slate-500">Photo evidence and GPS geotagging submitted via mobile PWA.</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mx-auto text-sm">
                  2
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">2. AI Triage & Match</h4>
                <p className="text-xs text-slate-500">Gemini 2.5 Flash clusters duplicates and routes to matching university lab.</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto text-sm">
                  3
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">3. HEI R&D Proposal</h4>
                <p className="text-xs text-slate-500">Faculty & students develop technical blueprint and field prototype.</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto text-sm">
                  4
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">4. CSR Funding & Fix</h4>
                <p className="text-xs text-slate-500">Industry funds the deployment on ground with verified photo proof.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
