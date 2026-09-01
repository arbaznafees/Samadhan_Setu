"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/formatters";

export default function IndustryCommitmentsPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOffers()
      .then((data) => setOffers(data || []))
      .catch((err) => console.warn("Error fetching offers:", err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Funded Projects & CSR Disbursals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active grants, escrow tranche milestones, and university progress reports funded by {user?.organization || "Tata Steel Foundation"}.
          </p>
        </div>
        <Link href="/industry">
          <Button variant="primary" size="sm">
            Browse More Solutions
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Active Funding Commitments"
          description="You have not pledged funding to any university research proposals yet. Explore available solutions in the marketplace."
          actionLabel="Browse Solutions"
          actionHref="/industry"
        />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card
              key={offer.id}
              padding="md"
              hoverEffect
              className="border-slate-200 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#002147] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Grant #{offer.id}
                  </span>
                  <StatusBadge
                    status={offer.status || "committed"}
                    label={offer.status === "disbursed" ? "Tranche Released" : "Committed in Escrow"}
                    size="sm"
                  />
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    {offer.offer_type || "CSR Grant"}
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {formatINR(offer.funding_amount_inr)} Pledged
                </span>
              </div>

              {/* Proposal Info */}
              {offer.proposal && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {offer.proposal.solution_title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-[#002147]" />
                      {offer.proposal.hei?.institute_name || "BIT Mesra"}
                    </span>
                    <span>Lead PI: {offer.proposal.lead_faculty_name || "Dr. Verma"}</span>
                  </div>
                </div>
              )}

              {/* Mentorship & Notes */}
              {offer.mentorship_scope && (
                <p className="text-xs text-slate-600 italic">
                  Scope: "{offer.mentorship_scope}"
                </p>
              )}

              {/* Tranche Release Progress Bar */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Milestone Tranche 1: Prototype Fabrication</span>
                  <span className="font-bold text-emerald-600">Verified (100% Release Ready)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[60%]" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
