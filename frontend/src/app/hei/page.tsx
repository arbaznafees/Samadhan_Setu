"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  FileText,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/ui/Badge";
import { ProposalModal } from "@/components/ProposalModal";
import { DuplicateBanner } from "@/components/DuplicateBanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HEIAssignedProblemsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected report for proposal modal
  const [selectedReportForProposal, setSelectedReportForProposal] = useState<any | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const repData = await api.getAssignedReports();
      setReports(repData || []);
    } catch (err) {
      console.warn("Could not fetch HEI reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      await api.updateReportStatus(reportId, newStatus);
      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#001733] text-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FED65B] text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>AI Institutional Problem Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Assigned Problem Statements Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Civic grievances routed to {user?.organization || "BIT Mesra"} based on research domain and lab capabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 text-center min-w-[110px]">
            <div className="text-2xl font-bold text-[#FED65B] font-heading">
              {reports.length}
            </div>
            <div className="text-[11px] text-slate-400">Assigned Tasks</div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Open Problem Statements ({reports.length})
          </h2>
          <span className="text-xs text-slate-500">
            SLA Standard: Submit technical proposal within 14 business days
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Assigned Problems Pending"
            description="Your institution currently has no unaddressed problem statements. As new citizen grievances are triaged by AI, they will automatically appear in this inbox."
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                hoverEffect
                padding="md"
                className="border-slate-200 transition-all"
              >
                {report.is_duplicate && (
                  <DuplicateBanner
                    reportId={report.id}
                    duplicateOfId={report.duplicate_of_id}
                    similarity={report.duplicate_similarity}
                  />
                )}

                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#002147] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {report.tracking_number}
                      </span>
                      <StatusBadge status={report.status} size="sm" />
                      {report.priority && <PriorityBadge priority={report.priority} size="sm" />}
                      <AISimulatedBadge text="AI Match 94%" />
                    </div>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {report.district || "Ranchi"} • {report.domain || "Water Tech"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 font-heading">
                      {report.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* Action Controls & Proposal Trigger */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Update Research Phase:</span>
                      <select
                        value={report.status}
                        onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                        className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white focus-ring font-medium"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">Research In-Progress</option>
                        <option value="prototype_ready">Prototype Ready</option>
                        <option value="resolved">Resolved & Field Verified</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedReportForProposal(report);
                          setIsProposalModalOpen(true);
                        }}
                      >
                        Draft Technical Proposal
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Submission Modal */}
      {selectedReportForProposal && (
        <ProposalModal
          report={selectedReportForProposal}
          isOpen={isProposalModalOpen}
          onClose={() => {
            setIsProposalModalOpen(false);
            setSelectedReportForProposal(null);
          }}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
