"use client";

import React from "react";
import { Award, FileText, Download, CheckCircle2, TrendingUp, Users, Droplets, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function IndustryImpactPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            CSR Impact & ESG Audited Scorecard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time beneficiary telemetry and MCA Section 135 compliance documentation for {user?.organization || "Tata Steel Foundation"}.
          </p>
        </div>
        <Button variant="accent" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          Download Form CSR-1 Certificate
        </Button>
      </div>

      {/* Impact Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002147] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Beneficiary Citizens</span>
              <div className="text-2xl font-bold text-slate-900 font-heading">18,450+</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Across 14 panchayats in Ranchi and East Singhbhum.
          </p>
        </Card>

        <Card padding="md" className="border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Clean Water Filtered</span>
              <div className="text-2xl font-bold text-slate-900 font-heading">1.2M Liters/Mo</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Deploying BIT Mesra low-cost ceramic adsorption filters.
          </p>
        </Card>

        <Card padding="md" className="border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-semibold">ESG Rating Score</span>
              <div className="text-2xl font-bold text-emerald-600 font-heading">96.4 / 100</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Compliant with SEBI Business Responsibility & Sustainability Reporting (BRSR).
          </p>
        </Card>
      </div>

      {/* Audit Certificate Card */}
      <Card padding="lg" className="border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                State CSR Utilization Audit
              </h3>
              <p className="text-xs text-slate-500">Certified by Department of Higher & Technical Education</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Audit Passed (100%)
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          All capital disbursements routed through the Samadhan Setu Jharkhand escrow gateway are linked to cryptographic photo evidence and university PI verification milestones, ensuring complete zero-leakage compliance with the Companies Act 2013.
        </p>
      </Card>
    </div>
  );
}
