"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Send, CheckCircle2, Building2, Users } from "lucide-react";
import { api } from "@/lib/api";

interface ProposalModalProps {
  report: {
    id: number;
    tracking_number: string;
    title: string;
    domain: string;
    district: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProposalModal({ report, isOpen, onClose, onSuccess }: ProposalModalProps) {
  const [leadFaculty, setLeadFaculty] = useState("Dr. Alok Verma");
  const [leadEmail, setLeadEmail] = useState("rnd@bitmesra.ac.in");
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const [methodology, setMethodology] = useState("");
  const [budget, setBudget] = useState("350000");
  const [durationMonths, setDurationMonths] = useState("4");
  const [deliverables, setDeliverables] = useState("");
  
  const [teamMembers, setTeamMembers] = useState([
    { name: "Dr. Alok Verma", role: "Principal Investigator", dept: "Environmental Engg" },
    { name: "Pooja Kumari", role: "M.Tech Research Fellow", dept: "Water Tech" }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", role: "Researcher", dept: "" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    (updated[index] as any)[field] = value;
    setTeamMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.submitProposal({
        report_id: report.id,
        lead_faculty_name: leadFaculty,
        lead_faculty_email: leadEmail,
        team_members: teamMembers.filter((m) => m.name.trim() !== ""),
        solution_title: solutionTitle,
        solution_description: solutionDescription,
        methodology,
        estimated_budget_inr: parseFloat(budget) || 0,
        estimated_duration_months: parseInt(durationMonths) || 6,
        deliverables,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-primary-container px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary-container" />
              <h2 className="text-lg font-bold">Submit Institutional R&D Proposal</h2>
            </div>
            <p className="text-xs text-on-primary-container mt-0.5">
              Grievance #{report.tracking_number} • {report.domain} ({report.district})
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Problem Statement:
            </h4>
            <p className="text-sm font-medium text-slate-900">{report.title}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Faculty / PI Name *
              </label>
              <input
                type="text"
                required
                value={leadFaculty}
                onChange={(e) => setLeadFaculty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                placeholder="Dr. Full Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Contact Email *
              </label>
              <input
                type="email"
                required
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                placeholder="faculty@institute.ac.in"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary-container" />
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Interdisciplinary Team Members
                </label>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="text-xs font-semibold text-primary-container hover:text-blue-900 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            <div className="space-y-2">
              {teamMembers.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => updateTeamMember(idx, "name", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Co-PI, Student)"
                    value={m.role}
                    onChange={(e) => updateTeamMember(idx, "role", e.target.value)}
                    className="w-36 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={m.dept}
                    onChange={(e) => updateTeamMember(idx, "dept", e.target.value)}
                    className="w-32 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Solution details */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solution & Technical Proposal Title *
              </label>
              <input
                type="text"
                required
                value={solutionTitle}
                onChange={(e) => setSolutionTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                placeholder="e.g. Low-Cost Bio-Adsorbent Community Water Filtration Skid"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Solution Description & Approach *
              </label>
              <textarea
                rows={3}
                required
                value={solutionDescription}
                onChange={(e) => setSolutionDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                placeholder="Explain the proposed institutional intervention, engineering specs, and community impact..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated R&D Budget (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                  placeholder="350000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Timeline (Months) *
                </label>
                <input
                  type="number"
                  required
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                  placeholder="4"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Deliverables & Milestones
              </label>
              <input
                type="text"
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                placeholder="e.g. 1 Working Pilot, Water Safety Certificate, Jal Sahiya Training Workshop"
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
              <Send className="w-4 h-4" />
              {loading ? "Submitting Proposal..." : "Submit Proposal to Portal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
