"use client";

import React, { useState } from "react";
import { X, Handshake, CheckCircle2, DollarSign, Briefcase } from "lucide-react";
import { api } from "@/lib/api";

interface FundingOfferModalProps {
  proposal: {
    id: number;
    solution_title: string;
    estimated_budget_inr: number;
    hei: {
      institute_name: string;
    };
    report: {
      title: string;
      domain: string;
      district: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FundingOfferModal({ proposal, isOpen, onClose, onSuccess }: FundingOfferModalProps) {
  const [offerType, setOfferType] = useState("CSR_Grant");
  const [fundingAmount, setFundingAmount] = useState(proposal.estimated_budget_inr.toString());
  const [mentorshipScope, setMentorshipScope] = useState(
    "Technical mentorship and field engineering guidance for structural skid mounting and village pipeline integration."
  );
  const [message, setMessage] = useState(
    "We are pleased to sponsor this R&D initiative under our Corporate Social Responsibility mandate."
  );
  const [contactPerson, setContactPerson] = useState("Ananya Sen (CSR Lead)");
  const [contactEmail, setContactEmail] = useState("csr@tatasteel.com");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.submitIndustryOffer({
        proposal_id: proposal.id,
        offer_type: offerType,
        funding_amount_inr: parseFloat(fundingAmount) || 0,
        mentorship_scope: mentorshipScope,
        message: message,
        contact_person: contactPerson,
        contact_email: contactEmail,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-primary-container px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-secondary-container" />
              <h2 className="text-lg font-bold">Submit Industry & CSR Partnership Offer</h2>
            </div>
            <p className="text-xs text-on-primary-container mt-0.5">
              Proposal #{proposal.id} • {proposal.hei.institute_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Selected Solution Proposal:
            </h4>
            <p className="text-sm font-bold text-slate-900">{proposal.solution_title}</p>
            <p className="text-xs text-slate-600 mt-1">
              Estimated R&D Budget: <strong className="text-primary-container">₹{proposal.estimated_budget_inr.toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Partnership / Offer Type *
              </label>
              <select
                value={offerType}
                onChange={(e) => setOfferType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-primary-container focus:border-transparent"
              >
                <option value="CSR_Grant">CSR Grant (Full / Co-Funding)</option>
                <option value="Direct_Funding">Corporate R&D Sponsorship</option>
                <option value="Mentorship">Technical Mentorship & Incubation</option>
                <option value="Equipment_Support">Equipment & Pilot Infrastructure</option>
                <option value="Joint_R&D">Joint Commercialization & R&D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pledged Funding Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                placeholder="350000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mentorship & Technical Scope (Optional)
            </label>
            <textarea
              rows={2}
              value={mentorshipScope}
              onChange={(e) => setMentorshipScope(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
              placeholder="Describe access to corporate labs, domain experts, fabrication skids..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message to Institutional Faculty Team
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
              placeholder="Commitment details or specific conditions..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry Representative Name *
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-slate-950 bg-secondary-container hover:bg-amber-400 rounded-lg shadow-sm hover:shadow transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              {loading ? "Pledging..." : "Confirm & Pledge Support"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
