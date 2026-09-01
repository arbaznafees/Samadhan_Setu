"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/ui/Badge";
import { Timeline, TimelineStep } from "@/components/ui/Timeline";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [trackingNumber, setTrackingNumber] = useState(initialId);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.trackReport(queryToSearch.trim());
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Grievance reference ID not found. Please check and try again.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(trackingNumber);
  };

  const getTimelineSteps = (rep: any): TimelineStep[] => {
    const isAssigned = rep.status !== "submitted";
    const isInProgress = rep.status === "in_progress" || rep.status === "prototype_ready" || rep.status === "resolved";
    const isResolved = rep.status === "resolved";

    return [
      {
        title: "Grievance Logged",
        description: "Submitted with GPS geotag and photo evidence.",
        date: rep.created_at ? new Date(rep.created_at).toLocaleDateString() : undefined,
        status: "completed",
      },
      {
        title: "AI Triage & Classification",
        description: `Domain: ${rep.domain || "Civic Infrastructure"} • Priority: ${rep.priority || "Medium"}`,
        status: isAssigned ? "completed" : "current",
      },
      {
        title: "HEI Academic Allocation",
        description: rep.assigned_hei
          ? `Allocated to ${rep.assigned_hei.institute_name} (${rep.assigned_hei.district})`
          : "Matching with specialized university lab...",
        status: isAssigned ? (isInProgress ? "completed" : "current") : "upcoming",
      },
      {
        title: "Research & Prototype Solution",
        description: rep.proposals && rep.proposals.length > 0
          ? `Proposal Filed: ${rep.proposals[0].title}`
          : "Under academic review and field testing.",
        status: isInProgress ? (isResolved ? "completed" : "current") : "upcoming",
      },
      {
        title: "On-Ground Resolution & Verification",
        description: isResolved ? "Resolved and verified by civic authorities." : "Pending field deployment.",
        status: isResolved ? "completed" : "upcoming",
      },
    ];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Grievance Resolution Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Enter your unique tracking reference number (e.g. <span className="font-mono text-slate-700">JH-2026-4192</span>) for real-time institutional progress telemetry.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto pt-4 flex gap-2">
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter Tracking ID (e.g. JH-2026-4192)"
            leftIcon={<Search className="w-4 h-4" />}
            className="text-sm"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="shrink-0"
          >
            Track Status
          </Button>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Result */}
      {report && (
        <div className="space-y-6">
          <Card padding="lg" className="border-slate-300 shadow-card">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#002147] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {report.tracking_number}
                  </span>
                  <StatusBadge status={report.status} />
                  {report.priority && <PriorityBadge priority={report.priority} />}
                  {report.is_duplicate && (
                    <StatusBadge status="duplicate" label="AI Grouped Duplicate" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-heading pt-2">
                  {report.title}
                </h2>
              </div>

              {report.created_at && (
                <div className="text-right text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Filed: {new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Description & Location */}
            <div className="py-6 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {report.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 block font-medium">Domain & Category</span>
                  <span className="font-bold text-slate-900">{report.domain || "Civic Infrastructure"}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 block font-medium">Location</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {report.district || "Ranchi"}, Jharkhand
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 block font-medium">Assigned University</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#002147]" />
                    {report.assigned_hei?.institute_name || "Assigned via AI Triage"}
                  </span>
                </div>
              </div>

              {/* Photo Proofs if any */}
              {report.media_urls && report.media_urls.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Grievance Photo Evidence
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {report.media_urls.map((url: string, i: number) => (
                      <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Stepper Timeline */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
                Resolution Milestone Stepper
              </h3>
              <Timeline steps={getTimelineSteps(report)} orientation="vertical" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function PublicTrackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <PublicNavbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading tracker...</div>}>
          <TrackingContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
