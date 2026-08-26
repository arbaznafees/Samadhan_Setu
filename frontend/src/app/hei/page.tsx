"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/StatusBadge";
import { ProposalModal } from "@/components/ProposalModal";
import { DuplicateBanner } from "@/components/DuplicateBanner";

export default function HEIPortalPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assigned" | "proposals">("assigned");

  // Selected report for proposal creation
  const [selectedReportForProposal, setSelectedReportForProposal] = useState<any | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repData, propData] = await Promise.all([
        api.getAssignedReports(),
        api.getProposals(),
      ]);
      setReports(repData);
      setProposals(propData);
    } catch (err) {
      console.warn("Could not fetch HEI data:", err);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEI Banner */}
      <div className="bg-gradient-to-r from-primary-container via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-secondary-container text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            Higher Education Institution (HEI) Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            {user?.organization || "Birla Institute of Technology (BIT) Mesra"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Assigned state problem statements matched by AI to your registered institutional specializations and research capacity.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="bg-blue-950/60 backdrop-blur rounded-2xl p-4 border border-blue-800 text-center min-w-[120px]">
            <div className="text-2xl font-bold text-secondary-container font-heading">
              {reports.length}
            </div>
            <div className="text-[11px] text-slate-400">Assigned Tasks</div>
          </div>
          <div className="bg-blue-950/60 backdrop-blur rounded-2xl p-4 border border-blue-800 text-center min-w-[120px]">
            <div className="text-2xl font-bold text-emerald-400 font-heading">
              {proposals.length}
            </div>
            <div className="text-[11px] text-slate-400">Proposals Filed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "assigned"
                ? "border-primary-container text-primary-container"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Assigned Grievances ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "proposals"
                ? "border-primary-container text-primary-container"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Formulated Proposals ({proposals.length})
          </button>
        </div>

        <button
          onClick={fetchData}
          className="text-xs font-semibold text-primary-container hover:underline pb-3"
        >
          Refresh Data
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading assigned reports from database...
        </div>
      ) : activeTab === "assigned" ? (
        /* Assigned Reports List */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              No problem statements currently assigned to this institution.
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                        #{r.tracking_number}
                      </span>
                      <StatusBadge status={r.status} />
                      <PriorityBadge priority={r.priority} />
                      <AISimulatedBadge isSimulated={r.is_ai_simulated} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        Domain: {r.domain}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                      {r.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {r.district}
                      {r.address ? ` • ${r.address}` : ""} • Logged on {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReportForProposal(r);
                        setIsProposalModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-secondary-container hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Form Team & Submit Proposal
                    </button>
                  </div>
                </div>

                {/* Duplicate Banner */}
                {r.is_duplicate && (
                  <DuplicateBanner
                    reportId={r.id}
                    duplicateOfId={r.duplicate_of_id}
                    similarity={r.duplicate_similarity}
                  />
                )}

                {/* Description & AI Triage Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider">Citizen Problem Report:</h4>
                    <p className="text-slate-600 leading-relaxed">{r.description}</p>
                    {r.media_urls?.length > 0 && (
                      <div className="pt-2 flex gap-2 flex-wrap">
                        {r.media_urls.map((url: string, idx: number) => (
                          <a key={idx} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt="Evidence" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Match Reasons & Score */}
                  <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        AI Matching Engine
                      </span>
                      <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                        {r.hei_match_score || 95}% Match
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {r.hei_match_reasons?.map((reason: string, i: number) => (
                        <p key={i} className="text-[11px] text-indigo-900 leading-tight">
                          • {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Proposals filed under this report */}
                {r.proposals?.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Active Institutional Action Plan:
                    </h5>
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-emerald-950">{r.proposals[0].solution_title}</p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          PI: {r.proposals[0].lead_faculty_name} • Budget: ₹{r.proposals[0].estimated_budget_inr?.toLocaleString("en-IN")} • Status: <strong>{r.proposals[0].status}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={r.status}
                          onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="Proposal_Submitted">Proposal Submitted</option>
                          <option value="In_Progress">In R&D / Field Work</option>
                          <option value="Resolved">Resolved / Handed Over</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Formulated Proposals View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              No proposals submitted yet.
            </div>
          ) : (
            proposals.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                      Proposal #{p.id}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {p.solution_title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3">
                    {p.solution_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <p>
                    <strong>Lead Faculty:</strong> {p.lead_faculty_name} ({p.lead_faculty_email})
                  </p>
                  <p>
                    <strong>Estimated Budget:</strong> ₹{p.estimated_budget_inr?.toLocaleString("en-IN")} ({p.estimated_duration_months} Months)
                  </p>
                  {p.team_members?.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      Team: {p.team_members.map((m: any) => `${m.name} (${m.role})`).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
