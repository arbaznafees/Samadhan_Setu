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
import { DuplicateBanner } from "@/components/DuplicateBanner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

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
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/citizen"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Reports
      </Link>

      {/* Success State */}
      {submittedReport ? (
        <Card padding="lg" className="border-emerald-200 bg-white shadow-card space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Grievance Successfully Registered!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your report has been received, geotagged, and automatically queued for AI classification and university R&D matching.
            </p>
          </div>

          {/* AI Duplicate Alert if triggered */}
          {submittedReport.is_duplicate && (
            <DuplicateBanner
              reportId={submittedReport.id}
              duplicateOfId={submittedReport.duplicate_of_id}
              similarity={submittedReport.duplicate_similarity}
            />
          )}

          {/* Summary Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs text-slate-500 font-medium">Tracking Reference Number</span>
              <span className="font-mono text-sm font-extrabold text-[#002147] bg-white px-2.5 py-1 rounded border border-slate-300">
                {submittedReport.tracking_number}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block">AI Triage Domain</span>
                <span className="font-semibold text-slate-900">{submittedReport.domain || domain}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned University</span>
                <span className="font-semibold text-slate-900">
                  {submittedReport.assigned_hei?.institute_name || "BIT Mesra (Auto-Matched)"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={`/track?id=${encodeURIComponent(submittedReport.tracking_number)}`}
              className="w-full sm:w-1/2"
            >
              <Button variant="primary" size="md" className="w-full">
                Track Live Progress
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="md"
              className="w-full sm:w-1/2"
              onClick={() => {
                setSubmittedReport(null);
                setTitle("");
                setDescription("");
                setMediaUrls([]);
              }}
            >
              Submit Another Report
            </Button>
          </div>
        </Card>
      ) : (
        /* Submission Form */
        <Card padding="lg" className="border-slate-200 shadow-card">
          <div className="pb-6 border-b border-slate-100 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#002147] text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-[#0A3161]" />
              AI-Assisted Citizen Grievance Intake
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Report a Civic or Infrastructure Challenge
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Provide specific details. Photos and GPS coordinates enable universities to conduct field research and prototype solutions.
            </p>
          </div>

          {error && (
            <div className="p-3 my-4 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            {/* Title & Domain */}
            <div className="space-y-4">
              <Input
                label="Issue Title / Summary *"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Arsenic contamination in community borewell, Namkum"
                helperText="Summarize the civic problem clearly in 10-15 words."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Problem Domain *
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus-ring font-medium"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Water Quality / Public Grievance"
                />
              </div>

              <Textarea
                label="Detailed Description & Community Impact *"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how long the issue has persisted, how many households are affected, and what temporary measures (if any) have failed..."
              />
            </div>

            {/* GPS Geolocation */}
            <div className="pt-2 border-t border-slate-100">
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
            </div>

            {/* Media Upload */}
            <div className="pt-2 border-t border-slate-100">
              <MediaUpload
                mediaUrls={mediaUrls}
                setMediaUrls={setMediaUrls}
              />
            </div>

            {/* Citizen Details */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Full Name (Optional)"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="Ramesh Kumar"
              />
              <Input
                label="Contact Phone (Optional for SMS updates)"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link href="/citizen">
                <Button variant="ghost" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={loading}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Civic Grievance
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
