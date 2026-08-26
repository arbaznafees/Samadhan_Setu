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
  Cpu,
  Database,
  Search,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
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
      router.push(`/citizen?track=${encodeURIComponent(trackInput.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-container via-[#001b3d] to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fed65b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800 text-secondary-container text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by AI Triage & Institutional R&D
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight max-w-4xl mx-auto">
            Bridging Civic Challenges with <br className="hidden sm:inline" />
            <span className="text-secondary-container">Academic Innovation & CSR Funding</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Samadhan Setu connects Jharkhand citizens directly with top state universities
            (BIT Mesra, IIT ISM, NIT Jsr, BAU) and industrial CSR partners to formulate and fund permanent solutions.
          </p>

          {/* Quick Track Input */}
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
                className="px-5 py-2.5 rounded-full bg-secondary-container hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                Track Status
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Live Telemetry Summary */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 border-t border-blue-900/60">
              <div className="bg-blue-950/40 backdrop-blur rounded-xl p-3 border border-blue-900/50">
                <div className="text-xl sm:text-2xl font-bold text-white font-heading">
                  {stats.total_reports}
                </div>
                <div className="text-[11px] text-slate-400">Reported Grievances</div>
              </div>
              <div className="bg-blue-950/40 backdrop-blur rounded-xl p-3 border border-blue-900/50">
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-heading">
                  {stats.resolution_rate_percentage}%
                </div>
                <div className="text-[11px] text-slate-400">Resolution Rate</div>
              </div>
              <div className="bg-blue-950/40 backdrop-blur rounded-xl p-3 border border-blue-900/50">
                <div className="text-xl sm:text-2xl font-bold text-secondary-container font-heading">
                  {stats.active_projects}
                </div>
                <div className="text-[11px] text-slate-400">HEI R&D Projects</div>
              </div>
              <div className="bg-blue-950/40 backdrop-blur rounded-xl p-3 border border-blue-900/50">
                <div className="text-xl sm:text-2xl font-bold text-amber-300 font-heading">
                  ₹{(stats.total_csr_funding_inr / 100000).toFixed(1)}L
                </div>
                <div className="text-[11px] text-slate-400">CSR Pledged</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4 Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Dedicated Stakeholder Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Choose your portal to report civic issues, formulate institutional research proposals, pledge CSR funds, or monitor state analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Portal 1: Citizen */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary-container flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-container transition-colors">
                  Citizen PWA
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Report grievances with photo evidence and automatic GPS geotagging. Track resolution milestones in real time.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/citizen"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-blue-950 transition-colors"
              >
                Open Citizen Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Portal 2: HEI */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  HEI Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Higher Education Institutions review assigned problems, form multidisciplinary faculty-student teams, and submit solutions.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/hei"
                onClick={() => loginAs("hei_reviewer")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-950 transition-colors"
              >
                Access HEI Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Portal 3: Industry */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  Industry & CSR
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Corporate partners browse HEI-approved solutions, pledge CSR grants, offer technical mentorship, and track ESG impact.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/industry"
                onClick={() => loginAs("industry_partner")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-amber-900 transition-colors"
              >
                Browse Solutions & Fund
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Portal 4: Govt Dashboard */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  Govt Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Real aggregate data across 24 Jharkhand districts, AI triage audit logs, duplicate detection inspectors, and manual HEI overrides.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/govt"
                onClick={() => loginAs("govt_admin")}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-950 transition-colors"
              >
                Open Govt Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Resolution Architecture */}
      <section className="bg-white py-14 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              End-to-End Resolution Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              How civic grievances transform into funded institutional engineering solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Citizen Geotagged Report</h4>
              <p className="text-xs text-slate-500">
                Citizen submits grievance with photos/video and auto GPS coordinates. Instant tracking number issued.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Gemini AI & Vector Dedup</h4>
              <p className="text-xs text-slate-500">
                AI classifies domain, generates 768-dim embeddings, flags duplicates via pgvector, and scores HEI specializations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">HEI Team & R&D Proposal</h4>
              <p className="text-xs text-slate-500">
                Assigned university faculty forms interdisciplinary team and submits technical action plan with milestones and budget.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white text-xs font-bold flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">CSR Funding & Deployment</h4>
              <p className="text-xs text-slate-500">
                Industry partners browse solutions, commit CSR grants, and oversee field implementation and community handoff.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
