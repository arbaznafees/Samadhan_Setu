"use client";

import React, { useState, useEffect } from "react";
import { X, Shuffle, Building2 } from "lucide-react";
import { api } from "@/lib/api";

interface HEIOverrideModalProps {
  report: {
    id: number;
    tracking_number: string;
    title: string;
    domain: string;
    assigned_hei_id?: number | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HEIOverrideModal({ report, isOpen, onClose, onSuccess }: HEIOverrideModalProps) {
  const [heis, setHeis] = useState<any[]>([]);
  const [selectedHeiId, setSelectedHeiId] = useState<string>("");
  const [reason, setReason] = useState("Administrative reallocation based on regional lab availability");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      api.getInstitutes().then((data) => {
        setHeis(data);
        if (data.length > 0) {
          setSelectedHeiId(String(report.assigned_hei_id || data[0].id));
        }
      });
    }
  }, [isOpen, report]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.overrideHEI(report.id, {
        hei_id: parseInt(selectedHeiId),
        reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reassign HEI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-primary-container px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-secondary-container" />
            <h2 className="text-base font-bold">Override Institutional Routing</h2>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">Report #{report.tracking_number}</p>
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{report.title}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target Higher Education Institution (HEI) *
            </label>
            <select
              value={selectedHeiId}
              onChange={(e) => setSelectedHeiId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-primary-container"
            >
              {heis.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.institute_name} ({h.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Administrative Justification *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container"
              placeholder="State rationale for overriding automatic rules engine..."
            />
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-bold text-slate-950 bg-secondary-container hover:bg-amber-400 rounded-lg shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? "Reassigning..." : "Confirm Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
