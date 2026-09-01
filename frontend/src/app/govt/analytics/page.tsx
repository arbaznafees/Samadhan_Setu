"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Layers, Globe, Filter, Building2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { JHARKHAND_DISTRICTS } from "@/components/GeoLocationPicker";

export default function GovtAnalyticsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("All");

  useEffect(() => {
    api.getAllGovtReports()
      .then((data) => setReports(data || []))
      .catch((err) => console.warn("Error fetching analytics:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const districtCounts = JHARKHAND_DISTRICTS.map((district) => {
    const count = reports.filter((r) => r.district === district).length;
    return { district, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Geospatial Telemetry & GIS Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            PostGIS spatial distribution of civic grievances and university lab coverage across 24 districts.
          </p>
        </div>
      </div>

      {/* Map Simulation Container */}
      <Card padding="none" className="overflow-hidden border-slate-200 bg-white">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#002147]" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Jharkhand Geospatial Coordinate Grid
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            CRS: EPSG:4326 (WGS 84)
          </span>
        </div>

        <div className="p-6 bg-gradient-to-br from-slate-900 via-[#001733] to-[#0A3161] text-white min-h-[280px] flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FED65B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          
          <div className="relative z-10 space-y-3 max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FED65B] flex items-center justify-center mx-auto border border-white/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-heading">
              Interactive PostGIS Coordinate Layers Active
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every citizen grievance contains exact decimal coordinates automatically mapped to district jurisdiction polygons and university catchment areas.
            </p>
          </div>
        </div>
      </Card>

      {/* District Volume Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 font-heading">
          District-wise Grievance Volume Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {districtCounts.map((d) => (
            <div
              key={d.district}
              className={`p-3 rounded-xl border text-xs transition-all ${
                d.count > 0
                  ? "bg-white border-slate-200 shadow-subtle"
                  : "bg-slate-50/60 border-slate-200/60 text-slate-400"
              }`}
            >
              <span className="font-semibold text-slate-800 block truncate">{d.district}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400">Reports:</span>
                <span className={`font-bold font-mono ${d.count > 0 ? "text-[#002147]" : "text-slate-400"}`}>
                  {d.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
