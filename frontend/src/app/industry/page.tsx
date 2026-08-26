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
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge, AISimulatedBadge } from "@/components/StatusBadge";
import { FundingOfferModal } from "@/components/FundingOfferModal";
import { JHARKHAND_DISTRICTS } from "@/components/GeoLocationPicker";

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

export default function IndustryPortalPage() {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [selectedProposalForOffer, setSelectedProposalForOffer] = useState<any | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const data = await api.getSolutions({
        domain: selectedDomain,
        district: selectedDistrict,
        search: searchQuery,
      });
      setSolutions(data);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Industry Banner */}
      <div className="bg-gradient-to-r from-[#735c00] via-[#574500] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 text-secondary-fixed text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            Corporate Social Responsibility (CSR) & Industry Co-Innovation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            {user?.organization || "Tata Steel Foundation / Industry Portal"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Browse high-impact, university-vetted technical solutions addressing real community challenges in Jharkhand. Sponsor R&D with measurable ESG and grassroots impact.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="bg-black/40 backdrop-blur rounded-2xl p-4 border border-amber-500/30 text-center min-w-[120px]">
            <div className="text-2xl font-bold text-secondary-fixed font-heading">
              {solutions.length}
            </div>
            <div className="text-[11px] text-slate-300">Ready Proposals</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search solutions, keywords, HEIs..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Domain:</span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="All">All 24 Districts</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchSolutions}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Solutions Catalog */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading problem-solution pairs from database...
          </div>
        ) : solutions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No active proposals match the chosen filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {item.report.domain}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={item.status} />
                      <AISimulatedBadge isSimulated={item.report.is_ai_simulated} />
                    </div>
                  </div>

                  {/* Solution Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary-container transition-colors font-heading">
                    {item.solution_title}
                  </h3>

                  {/* HEI Info */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary-container" />
                      <div>
                        <p className="font-bold text-slate-900">{item.hei.institute_name}</p>
                        <p className="text-[11px] text-slate-500">Lead Faculty: {item.lead_faculty_name}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      AISHE: {item.hei.aishe_code}
                    </span>
                  </div>

                  {/* Grievance Summary */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                      Target Grassroots Issue:
                    </p>
                    <p className="font-medium text-slate-900 line-clamp-1">{item.report.title}</p>
                    <p className="text-slate-500 line-clamp-2">{item.solution_description}</p>
                  </div>

                  {/* Deliverables */}
                  {item.deliverables && (
                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
                      <strong>Deliverables:</strong> {item.deliverables}
                    </div>
                  )}
                </div>

                {/* Footer specs & Pledge action */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Required R&D Grant</span>
                      <strong className="text-sm text-slate-900 font-heading">
                        ₹{item.estimated_budget_inr.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Project Duration</span>
                      <strong className="text-sm text-slate-700">
                        {item.estimated_duration_months} Months
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Location</span>
                      <strong className="text-sm text-slate-700">
                        {item.report.district}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProposalForOffer(item);
                      setIsOfferModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-secondary-container hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Handshake className="w-4 h-4" />
                    Pledge CSR Grant / Mentorship Offer
                  </button>
                </div>
              </div>
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
