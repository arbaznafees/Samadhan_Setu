"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/StatusBadge";
import { DuplicateBanner } from "@/components/DuplicateBanner";

function CitizenPortalContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") || "";

  const [reports, setReports] = useState<any[]>([]);
  const [trackedReport, setTrackedReport] = useState<any | null>(null);
  const [trackingNumber, setTrackingNumber] = useState(initialTrack);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [loadingReports, setLoadingReports] = useState(true);

  // Load citizen reports
  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const data = await api.getCitizenReports();
      setReports(data);
    } catch (err) {
      console.warn("Could not fetch reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  // Handle tracking param on mount
  useEffect(() => {
    if (initialTrack) {
      handleTrack(initialTrack);
    }
  }, [initialTrack]);

  const handleTrack = async (numToTrack: string) => {
    if (!numToTrack.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const data = await api.trackReport(numToTrack);
      setTrackedReport(data);
    } catch (err: any) {
      setSearchError(err.message || "Grievance tracking number not found.");
      setTrackedReport(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-primary-container text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 text-secondary-container text-xs font-semibold">
            <span>Citizen Grievance & Solution Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Citizen Public Service Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit civic grievances with geotagging and photo evidence. Every report is triaged with AI and matched to a state university R&D team for permanent resolution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto z-10">
          <Link
            href="/citizen/report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary-container hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Report New Civic Issue
          </Link>
        </div>
      </div>

      {/* Real-time Tracking Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary-container" />
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Track Grievance Status & Timeline
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack(trackingNumber);
          }}
          className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl"
        >
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter Tracking ID (e.g. JH-2026-4192)"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent uppercase font-mono"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary-container hover:bg-blue-950 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {searchLoading ? "Searching..." : "Track"}
          </button>
        </form>

        {searchError && (
          <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {searchError}
          </div>
        )}

        {/* Tracked Report Detail & Timeline Card */}
        {trackedReport && (
          <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-5 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                    #{trackedReport.tracking_number}
                  </span>
                  <StatusBadge status={trackedReport.status} />
                  <PriorityBadge priority={trackedReport.priority} />
                  <AISimulatedBadge isSimulated={trackedReport.is_ai_simulated} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{trackedReport.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {trackedReport.district}
                  {trackedReport.address ? ` • ${trackedReport.address}` : ""}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <span>Submitted: {new Date(trackedReport.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Duplicate Notice if triggered */}
            {trackedReport.is_duplicate && (
              <DuplicateBanner
                reportId={trackedReport.id}
                duplicateOfId={trackedReport.duplicate_of_id}
                similarity={trackedReport.duplicate_similarity}
              />
            )}

            {/* Description & AI Triage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-700 uppercase tracking-wider">Citizen Problem Description:</h4>
                <p className="text-slate-600 leading-relaxed">{trackedReport.description}</p>
                {trackedReport.media_urls?.length > 0 && (
                  <div className="pt-2">
                    <h5 className="font-medium text-slate-500 mb-1">Uploaded Evidence:</h5>
                    <div className="flex gap-2 flex-wrap">
                      {trackedReport.media_urls.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt="Evidence" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
                <h4 className="font-semibold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  Assigned HEI & Institutional Solution:
                </h4>
                {trackedReport.assigned_hei ? (
                  <div className="space-y-2">
                    <p className="font-bold text-slate-900 text-sm">
                      {trackedReport.assigned_hei.institute_name} ({trackedReport.assigned_hei.district})
                    </p>
                    <p className="text-slate-600 text-xs">
                      Match Confidence Score: <strong>{trackedReport.hei_match_score || 95}%</strong>
                    </p>
                    {trackedReport.proposals?.length > 0 ? (
                      <div className="mt-2 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Action Proposal Active
                        </span>
                        <p className="font-semibold text-slate-900 text-xs mt-1">
                          {trackedReport.proposals[0].solution_title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {trackedReport.proposals[0].solution_description}
                        </p>
                        <p className="text-[11px] font-semibold text-primary-container pt-1">
                          Estimated Budget: ₹{trackedReport.proposals[0].estimated_budget_inr?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Faculty team is currently formulating the technical proposal and field study.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    AI triage in progress. Institutional assignment will appear shortly.
                  </p>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Resolution Milestones
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  1. Grievance Logged
                </div>
                <div className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                  trackedReport.status !== "Submitted"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${trackedReport.status !== "Submitted" ? "text-emerald-600" : "text-slate-400"}`} />
                  2. AI Triaged
                </div>
                <div className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                  ["Proposal_Submitted", "Industry_Offered", "In_Progress", "Resolved"].includes(trackedReport.status)
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${["Proposal_Submitted", "Industry_Offered", "In_Progress", "Resolved"].includes(trackedReport.status) ? "text-emerald-600" : "text-slate-400"}`} />
                  3. HEI Solution
                </div>
                <div className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                  ["Industry_Offered", "In_Progress", "Resolved"].includes(trackedReport.status)
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${["Industry_Offered", "In_Progress", "Resolved"].includes(trackedReport.status) ? "text-emerald-600" : "text-slate-400"}`} />
                  4. CSR / Deployed
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent / Public Reports Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {user?.role === "citizen" ? "My Reported Grievances" : "Recent Public Grievances in Jharkhand"}
            </h2>
            <p className="text-xs text-slate-500">
              Live reports actively being processed by the institutional network.
            </p>
          </div>
          <button
            onClick={fetchReports}
            className="text-xs font-semibold text-primary-container hover:underline"
          >
            Refresh Feed
          </button>
        </div>

        {loadingReports ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading grievance records from database...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
            <p className="text-sm font-semibold">No grievances found in database.</p>
            <Link
              href="/citizen/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" /> Report the First Issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setTrackedReport(r);
                  setTrackingNumber(r.tracking_number);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle hover:shadow-card cursor-pointer transition-all flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      #{r.tracking_number}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-container transition-colors line-clamp-2">
                    {r.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">{r.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {r.district}
                  </span>
                  <AISimulatedBadge isSimulated={r.is_ai_simulated} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CitizenPortalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading citizen dashboard...</div>}>
      <CitizenPortalContent />
    </Suspense>
  );
}

