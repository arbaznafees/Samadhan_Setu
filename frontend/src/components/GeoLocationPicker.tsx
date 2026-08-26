"use client";

import React, { useState } from "react";
import { MapPin, Navigation, CheckCircle } from "lucide-react";

export const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "East Singhbhum", "Bokaro", "Hazaribagh", "Deoghar",
  "Giridih", "Ramgarh", "Palamu", "West Singhbhum", "Dumka", "Godda",
  "Gumla", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga",
  "Pakur", "Sahebganj", "Seraikela Kharsawan", "Simdega", "Chatra", "Garhwa"
];

interface GeoLocationPickerProps {
  district: string;
  setDistrict: (d: string) => void;
  latitude: number | null;
  longitude: number | null;
  setCoordinates: (lat: number, lng: number) => void;
  address: string;
  setAddress: (a: string) => void;
}

export function GeoLocationPicker({
  district,
  setDistrict,
  latitude,
  longitude,
  setCoordinates,
  address,
  setAddress,
}: GeoLocationPickerProps) {
  const [detecting, setDetecting] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);

  const handleAutoGeolocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
        setGeoSuccess(true);
        setTimeout(() => setGeoSuccess(false), 3000);
      },
      (err) => {
        console.warn("Geo error:", err);
        // Fallback default coordinates for Ranchi
        setCoordinates(23.3441, 85.3096);
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-container" />
          Location & Geotagging
        </label>
        <button
          type="button"
          onClick={handleAutoGeolocate}
          disabled={detecting}
          className="text-xs font-semibold text-primary-container hover:text-blue-900 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          {detecting ? "Locating..." : geoSuccess ? "GPS Captured!" : "Auto-Capture GPS"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            District *
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-primary-container"
          >
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            GPS Coordinates (Lat / Lng)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              placeholder="Lat"
              value={latitude || ""}
              onChange={(e) =>
                setCoordinates(parseFloat(e.target.value) || 0, longitude || 0)
              }
              className="w-1/2 px-2.5 py-2 text-xs rounded-lg border border-slate-300"
            />
            <input
              type="number"
              step="any"
              placeholder="Lng"
              value={longitude || ""}
              onChange={(e) =>
                setCoordinates(latitude || 0, parseFloat(e.target.value) || 0)
              }
              className="w-1/2 px-2.5 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Village / Ward / Street Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Village Chakla, Near Primary School, Ormanjhi Block"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-container"
        />
      </div>
    </div>
  );
}
