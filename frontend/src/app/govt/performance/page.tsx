"use client";

import React from "react";
import { BarChart3, CheckCircle2, AlertTriangle, TrendingUp, Building2, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";

export default function GovtPerformancePage() {
  const { user } = useAuth();

  const heiPerformanceData = [
    {
      institute: "Birla Institute of Technology (BIT) Mesra",
      district: "Ranchi",
      assigned: 14,
      proposals: 12,
      resolved: 9,
      avgResolutionDays: 18,
      slaCompliance: "94.2%",
    },
    {
      institute: "Indian Institute of Technology (ISM) Dhanbad",
      district: "Dhanbad",
      assigned: 11,
      proposals: 10,
      resolved: 8,
      avgResolutionDays: 22,
      slaCompliance: "91.0%",
    },
    {
      institute: "National Institute of Technology (NIT) Jamshedpur",
      district: "East Singhbhum",
      assigned: 9,
      proposals: 8,
      resolved: 6,
      avgResolutionDays: 24,
      slaCompliance: "88.5%",
    },
    {
      institute: "Birsa Agricultural University (BAU) Kanke",
      district: "Ranchi",
      assigned: 8,
      proposals: 7,
      resolved: 5,
      avgResolutionDays: 28,
      slaCompliance: "85.0%",
    },
  ];

  const columns = [
    {
      header: "University / HEI",
      key: "institute",
      render: (item: any) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900">{item.institute}</p>
          <span className="text-[11px] text-slate-500">{item.district} District</span>
        </div>
      ),
    },
    {
      header: "Assigned",
      key: "assigned",
      render: (item: any) => (
        <span className="font-semibold text-slate-800">{item.assigned}</span>
      ),
    },
    {
      header: "Proposals",
      key: "proposals",
      render: (item: any) => (
        <span className="font-semibold text-indigo-700">{item.proposals}</span>
      ),
    },
    {
      header: "Resolved",
      key: "resolved",
      render: (item: any) => (
        <span className="font-bold text-emerald-600">{item.resolved}</span>
      ),
    },
    {
      header: "Avg Speed",
      key: "avgResolutionDays",
      render: (item: any) => (
        <span className="text-xs text-slate-600">{item.avgResolutionDays} Days</span>
      ),
    },
    {
      header: "SLA Compliance",
      key: "slaCompliance",
      render: (item: any) => (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {item.slaCompliance}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Institutional & Departmental SLA Scorecards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Turnaround metrics, resolution velocity, and proposal conversion across state universities.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 font-heading">
          State University Performance Ranking
        </h2>
        <Table columns={columns} data={heiPerformanceData} />
      </div>
    </div>
  );
}
