"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Shuffle,
  ShieldAlert,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/ui/Badge";
import { DuplicateBanner } from "@/components/DuplicateBanner";
import { HEIOverrideModal } from "@/components/HEIOverrideModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { JHARKHAND_DISTRICTS } from "@/components/GeoLocationPicker";
import { formatINR } from "@/lib/formatters";

export default function GovtStateOverviewPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // HEI Override Modal State
  const [overrideReport, setOverrideReport] = useState<any | null>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [anData, repData] = await Promise.all([
        api.getGovtAnalytics(),
        api.getAllGovtReports(),
      ]);
      setAnalytics(anData);
      setAllReports(repData || []);
    } catch (err) {
      console.warn("Could not load government analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredReports = allReports.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.citizen_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain =
      selectedDomain === "All" || r.domain === selectedDomain;

    const matchesDistrict =
      selectedDistrict === "All" || r.district === selectedDistrict;

    return matchesSearch && matchesDomain && matchesDistrict;
  });

  const tableColumns = [
    {
      header: "Track ID",
      key: "tracking_number",
      render: (item: any) => (
        <span className="font-mono font-bold text-[#002147] bg-slate-100 px-2 py-0.5 rounded text-xs">
          {item.tracking_number}
        </span>
      ),
    },
    {
      header: "Issue Title & Domain",
      key: "title",
      render: (item: any) => (
        <div className="space-y-0.5 max-w-xs">
          <p className="font-semibold text-slate-900 truncate">{item.title}</p>
          <span className="text-[11px] text-slate-500">{item.domain || "Infrastructure"}</span>
        </div>
      ),
    },
    {
      header: "Location",
      key: "district",
      render: (item: any) => (
        <span className="text-xs text-slate-700 font-medium">
          {item.district || "Ranchi"}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={item.status} size="sm" />
          {item.is_duplicate && (
            <StatusBadge status="duplicate" label="AI Grouped" size="sm" />
          )}
        </div>
      ),
    },
    {
      header: "Assigned HEI",
      key: "hei",
      render: (item: any) => (
        <span className="text-xs text-slate-800 font-medium">
          {item.assigned_hei?.institute_name || "AI Matching..."}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (item: any) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          leftIcon={<Shuffle className="w-3 h-3 text-[#002147]" />}
          onClick={() => {
            setOverrideReport(item);
            setIsOverrideOpen(true);
          }}
        >
          Reassign HEI
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#001733] text-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FED65B] text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statewide Real-Time Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Government Command & Operations Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time live telemetry aggregated from PostgreSQL with PostGIS and pgvector.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchData}
          className="shrink-0"
        >
          Refresh Aggregations
        </Button>
      </div>

      {/* KPI Metric Strip */}
      {analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md" className="border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Grievances
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#002147] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-2">
              {analytics.total_reports}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {analytics.resolved_reports} Resolved on Ground
            </p>
          </Card>

          <Card padding="md" className="border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resolution Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-heading mt-2">
              {analytics.resolution_rate_percentage}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statewide Target: 85%
            </p>
          </Card>

          <Card padding="md" className="border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                HEI R&D Projects
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#002147] font-heading mt-2">
              {analytics.active_projects}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across 5 State Universities
            </p>
          </Card>

          <Card padding="md" className="border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                CSR Capital Pledged
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-2">
              {formatINR(analytics.total_csr_funding_inr)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Industry Matching Enabled
            </p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports or tracking ID..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus-ring"
            >
              <option value="All">All 24 Districts</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dense Data Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Statewide Grievances Telemetry Grid ({filteredReports.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click "Reassign HEI" to manually override AI allocation
          </span>
        </div>

        <Table
          columns={tableColumns}
          data={filteredReports}
          isLoading={loading}
          emptyText="No state grievances found matching criteria."
        />
      </div>

      {/* HEI Override Modal */}
      {overrideReport && (
        <HEIOverrideModal
          report={overrideReport}
          isOpen={isOverrideOpen}
          onClose={() => {
            setIsOverrideOpen(false);
            setOverrideReport(null);
          }}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
