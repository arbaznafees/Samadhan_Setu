"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  DollarSign,
  Clock,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/formatters";

export default function HeiProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProposals()
      .then((data) => setProposals(data || []))
      .catch((err) => console.warn("Error loading proposals:", err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Institutional Solution Proposals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Technical blueprints submitted to the state marketplace for industry CSR co-funding.
          </p>
        </div>
        <Link href="/hei">
          <Button variant="primary" size="sm">
            Draft New Proposal
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No Proposals Submitted Yet"
          description="Your department has not submitted any technical proposals yet. Select an assigned problem from the inbox to draft your first blueprint."
          actionLabel="View Assigned Problems"
          actionHref="/hei"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((prop) => (
            <Card
              key={prop.id}
              padding="md"
              hoverEffect
              className="border-slate-200 space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Proposal #{prop.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {prop.solution_title || "Technical Solution Blueprint"}
                  </h3>
                </div>
                <StatusBadge
                  status={prop.funding_status || "submitted"}
                  label={prop.funding_status === "funded" ? "CSR Funded" : "Seeking CSR Sponsor"}
                  size="sm"
                />
              </div>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {prop.solution_description || prop.methodology || "Technical methodology submitted for review."}
              </p>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Budget Est.</span>
                  <span className="font-bold text-[#002147]">
                    {formatINR(prop.estimated_budget_inr)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                  <span className="font-semibold text-slate-800">
                    {prop.estimated_duration_months || 4} Months
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Lead PI</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {prop.lead_faculty_name || "Faculty PI"}
                  </span>
                </div>
              </div>

              {prop.offers && prop.offers.length > 0 && (
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span>Sponsored by: <strong>{prop.offers[0]?.company_name || "CSR Partner"}</strong></span>
                  <span className="font-bold">{formatINR(prop.offers[0]?.offered_amount_inr)} Committed</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
