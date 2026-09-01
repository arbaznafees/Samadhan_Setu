"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  Filter,
  DollarSign,
  Handshake,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { FundingOfferModal } from "@/components/FundingOfferModal";
import { JHARKHAND_DISTRICTS } from "@/components/GeoLocationPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/formatters";

const DOMAIN_OPTIONS = [
  "All",
  "Water & Sanitation",
  "Agriculture & Irrigation",
  "Roads & Infrastructure",
  "Healthcare",
  "Education & Skilling",
  "Environment & Forest",
  "Electricity & Energy",
  "Rural Livelihood"
];

export default function IndustrySolutionsMarketplace() {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedProposalForOffer, setSelectedProposalForOffer] = useState<any | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const data = await api.getSolutions({
        domain: selectedDomain === "All" ? undefined : selectedDomain,
        district: selectedDistrict === "All" ? undefined : selectedDistrict,
        search: searchQuery || undefined,
      });
      setSolutions(data || []);
    } catch (err) {
      console.warn("Could not fetch solutions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, [selectedDomain, selectedDistrict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSolutions();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#001733] text-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FED65B] text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Corporate Social Responsibility (CSR) Marketplace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Browse University Innovation Proposals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Sponsor vetted technical blueprints addressing grassroots civic challenges with measurable ESG metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 text-center min-w-[110px]">
            <div className="text-2xl font-bold text-[#FED65B] font-heading">
              {solutions.length}
            </div>
            <div className="text-[11px] text-slate-400">Ready Proposals</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by technology or problem..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus-ring"
            >
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus-ring"
            >
              <option value="All">All Districts</option>
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Available Solution Blueprints ({solutions.length})
          </h2>
          <span className="text-xs text-slate-500">
            100% Tax Deductible under Section 135 (Schedule VII)
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : solutions.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No Matching Solutions Found"
            description="No university proposals match your currently selected filters. Try broadening your domain or district criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solutions.map((item) => (
              <Card
                key={item.id}
                hoverEffect
                padding="md"
                className="border-slate-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Proposal #{item.id}
                      </span>
                      <StatusBadge
                        status={item.funding_status || "submitted"}
                        label={item.funding_status === "funded" ? "Funded" : "Seeking CSR Co-Funding"}
                        size="sm"
                      />
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#002147]" />
                      {item.hei?.institute_name || "BIT Mesra"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-heading">
                      {item.solution_title || "Technical Solution Blueprint"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {item.solution_description || item.methodology}
                    </p>
                  </div>

                  {/* Target Problem Box */}
                  {item.report && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Solves Civic Problem:
                      </span>
                      <p className="font-medium text-slate-800 line-clamp-1 mt-0.5">
                        {item.report.title}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {item.report.district} • {item.report.domain}
                      </span>
                    </div>
                  )}

                  {/* Budget & Timeline Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 block font-medium">Requested Grant</span>
                      <span className="text-base font-bold text-[#002147]">
                        {formatINR(item.estimated_budget_inr)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Delivery Timeline</span>
                      <span className="text-base font-bold text-slate-900">
                        {item.estimated_duration_months || 4} Months
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sponsor Button */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Lead: {item.lead_faculty_name || "Faculty PI"}
                  </span>
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<Handshake className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSelectedProposalForOffer(item);
                      setIsOfferModalOpen(true);
                    }}
                  >
                    Pledge CSR Co-Funding
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Funding Offer Modal */}
      {selectedProposalForOffer && (
        <FundingOfferModal
          proposal={selectedProposalForOffer}
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedProposalForOffer(null);
          }}
          onSuccess={() => {
            fetchSolutions();
          }}
        />
      )}
    </div>
  );
}
