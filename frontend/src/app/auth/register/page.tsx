"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { JHARKHAND_DISTRICTS } from "@/components/GeoLocationPicker";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("citizen");
  const [district, setDistrict] = useState("Ranchi");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.register({
        full_name: fullName,
        email,
        password,
        phone,
        role,
        district,
        organization,
      });
      localStorage.setItem("samadhan_token", res.access_token);
      await refreshUser();

      if (role === "hei_reviewer") router.push("/hei");
      else if (role === "industry_partner") router.push("/industry");
      else if (role === "govt_admin") router.push("/govt");
      else router.push("/citizen");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary-container text-secondary-container flex items-center justify-center font-bold text-2xl mx-auto shadow-sm">
          सं
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Create an Account
        </h1>
        <p className="text-xs text-slate-500">
          Join the Samadhan Setu civic and academic collaboration network.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Stakeholder Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-primary-container font-medium"
            >
              <option value="citizen">Citizen (Grievance Submitter)</option>
              <option value="hei_reviewer">HEI Faculty / Reviewer (University)</option>
              <option value="industry_partner">Industry Partner / CSR Sponsor</option>
              <option value="govt_admin">Government Officer / Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar / Dr. A. Verma"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 ..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(role === "hei_reviewer" || role === "industry_partner" || role === "govt_admin") && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution / Organization Name *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. BIT Mesra / Tata Steel Foundation"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary-container hover:bg-blue-950 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-primary-container hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
