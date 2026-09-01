"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function CitizenFeedPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.getCitizenReports();
      setReports(data || []);
    } catch (err) {
      console.warn("Could not fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const domains = [
    "All",
    "Water & Sanitation",
    "Agriculture & Irrigation",
    "Roads & Infrastructure",
    "Healthcare",
    "Education & Skilling",
    "Environment & Forest",
    "Electricity & Energy",
  ];

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain =
      selectedDomain === "All" || r.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#002147] text-white rounded-2xl p-5 sm:p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FED65B] text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>AI Geotagged Grievance Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading">
            Welcome, {user?.full_name || "Citizen"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit local civic issues and track university engineering milestones in real time.
          </p>
        </div>

        <Link href="/citizen/report" className="shrink-0 w-full sm:w-auto z-10">
          <Button variant="accent" size="md" className="w-full sm:w-auto" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-72">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword or ID..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus-ring font-medium"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4" id="reports">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            My Reported Grievances ({filteredReports.length})
          </h2>
          <button
            onClick={fetchReports}
            className="text-xs font-semibold text-[#002147] hover:underline"
          >
            Refresh Feed
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredReports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Grievances Found"
            description="You haven't submitted any reports matching this filter yet. Submit a new civic issue to connect with state university researchers."
            actionLabel="File First Grievance"
            actionHref="/citizen/report"
          />
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                hoverEffect
                padding="md"
                className="border-slate-200 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Status & Tracking ID */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#002147] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {report.tracking_number}
                      </span>
                      <StatusBadge status={report.status} size="sm" />
                      {report.priority && (
                        <PriorityBadge priority={report.priority} size="sm" />
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 font-heading">
                      {report.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* Location & Assigned HEI Strip */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {report.district || "Ranchi"}, Jharkhand
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#002147]" />
                      {report.assigned_hei?.institute_name || "Matching University Lab..."}
                    </span>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-500">
                      Domain: <span className="text-slate-800 font-semibold">{report.domain || "Civic"}</span>
                    </div>

                    <Link
                      href={`/track?id=${encodeURIComponent(report.tracking_number)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#002147] hover:text-[#0A3161] hover:underline"
                    >
                      Track Milestones
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
