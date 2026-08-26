"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Sparkles,
  FileText,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { GeoLocationPicker } from "@/components/GeoLocationPicker";
import { MediaUpload } from "@/components/MediaUpload";

const DOMAINS = [
  "Water & Sanitation",
  "Agriculture & Irrigation",
  "Roads & Infrastructure",
  "Healthcare",
  "Education & Skilling",
  "Environment & Forest",
  "Electricity & Energy",
  "Rural Livelihood",
  "Other"
];

export default function ReportIssuePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [category, setCategory] = useState("Public Grievance");
  const [citizenName, setCitizenName] = useState(user?.full_name || "");
  const [citizenPhone, setCitizenPhone] = useState(user?.phone || "");

  // Location state
  const [district, setDistrict] = useState("Ranchi");
  const [latitude, setLatitude] = useState<number | null>(23.3441);
  const [longitude, setLongitude] = useState<number | null>(85.3096);
  const [address, setAddress] = useState("");

  // Media state
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both the issue title and detailed description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.submitReport({
        title,
        description,
        domain,
        category,
        citizen_name: citizenName || (user?.full_name ?? "Citizen"),
        citizen_phone: citizenPhone || (user?.phone ?? ""),
        district,
        latitude,
        longitude,
        address,
        media_urls: mediaUrls,
      });

      setSubmittedReport(result);
    } catch (err: any) {
      setError(err.message || "Failed to submit grievance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/citizen"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Citizen Home
      </Link>

      {/* Success View */}
      {submittedReport ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-card text-center space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Grievance Successfully Registered!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Your issue has been logged into the Jharkhand State Repository. The AI Triage & Dedup engine is analyzing the problem and matching it with an institutional faculty lead.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-sm mx-auto space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Official Tracking ID
            </span>
            <div className="text-2xl font-mono font-bold text-primary-container">
              {submittedReport.tracking_number}
            </div>
            <p className="text-[11px] text-slate-400">
              Please save this ID to track research updates & field visits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={`/citizen?track=${submittedReport.tracking_number}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-blue-950 transition-colors shadow-sm"
            >
              Track Grievance Timeline
            </Link>
            <button
              onClick={() => {
                setSubmittedReport(null);
                setTitle("");
                setDescription("");
                setMediaUrls([]);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* Report Form Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary-container text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Automated AI Classification & Institutional Routing
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Report a Civic Grievance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Provide specific information regarding drinking water, crop issues, roads, electricity, or healthcare in your area.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Grievance Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Issue Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Severe Fluoride Contamination in Ormanjhi Block Handpumps"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Detailed Description (English / Hindi / Regional text) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what is happening, how many households are affected, symptoms/damage observed, and previous local attempts to fix..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Primary Domain / Sector
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary-container"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Category Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Water Contamination, Crop Wilt"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Location & Geotagging */}
            <GeoLocationPicker
              district={district}
              setDistrict={setDistrict}
              latitude={latitude}
              longitude={longitude}
              setCoordinates={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              address={address}
              setAddress={setAddress}
            />

            {/* Step 3: Photo / Video Evidence */}
            <MediaUpload mediaUrls={mediaUrls} setMediaUrls={setMediaUrls} />

            {/* Step 4: Citizen Contact Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Citizen Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Phone Number (+91 ...)"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/citizen"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-secondary-container hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? "Registering & Triaging Issue..." : "Submit Grievance to Portal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
