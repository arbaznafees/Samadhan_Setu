"use client";

import React, { useState, useEffect } from "react";
import {
  GitMerge,
  AlertTriangle,
  Shuffle,
  CheckCircle2,
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { HEIOverrideModal } from "@/components/HEIOverrideModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function GovtTriagePage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // HEI Override Modal
  const [overrideReport, setOverrideReport] = useState<any | null>(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.getAllGovtReports();
      setReports(data || []);
    } catch (err) {
      console.warn("Error fetching triage reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const duplicateReports = reports.filter((r) => r.is_duplicate === true);
  const unassignedReports = reports.filter((r) => !r.assigned_hei_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            AI Triage & Deduplication Clusters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            pgvector semantic clustering and institutional reassignment console.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchReports}>
          Re-run Cluster Analysis
        </Button>
      </div>

      {/* Duplicate Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
              Vector Duplicate Clusters
            </span>
            <div className="text-2xl font-bold text-rose-950 font-heading mt-1">
              {duplicateReports.length} Flagged
            </div>
            <p className="text-xs text-rose-800 mt-0.5">
              Identified with &gt;85% cosine similarity.
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
        </div>

        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
              Pending Allocation
            </span>
            <div className="text-2xl font-bold text-indigo-950 font-heading mt-1">
              {unassignedReports.length} Items
            </div>
            <p className="text-xs text-indigo-800 mt-0.5">
              Awaiting automatic or manual HEI assignment.
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-indigo-600 shrink-0" />
        </div>
      </div>

      {/* Duplicate Reports List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-heading">
          Semantic Duplicate Clusters ({duplicateReports.length})
        </h2>

        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : duplicateReports.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Zero Duplicate Clusters Detected"
            description="All incoming grievances in the database are currently unique with no high-confidence semantic overlaps."
          />
        ) : (
          <div className="space-y-4">
            {duplicateReports.map((report) => (
              <Card
                key={report.id}
                padding="md"
                className="border-rose-200 bg-white shadow-subtle space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#002147] bg-slate-100 px-2 py-0.5 rounded">
                      {report.tracking_number}
                    </span>
                    <StatusBadge status="duplicate" label="Duplicate Flagged" size="sm" />
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      {report.duplicate_similarity ? `${(report.duplicate_similarity * 100).toFixed(1)}% Sim` : "High Overlap"}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {report.district} • {report.domain}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{report.description}</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                  <span>
                    Linked Primary Case: <strong>Report #{report.duplicate_of_id || report.id - 1}</strong>
                  </span>
                  <span className="text-[11px] font-semibold">Consolidated into Single Research Task</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Assigned: {report.assigned_hei?.institute_name || "Auto-Cluster"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Shuffle className="w-3 h-3 text-[#002147]" />}
                    onClick={() => {
                      setOverrideReport(report);
                      setIsOverrideOpen(true);
                    }}
                  >
                    Reassign University
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
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
            fetchReports();
          }}
        />
      )}
    </div>
  );
}
