"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Building2, Users, Briefcase, BarChart3, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role === "hei_reviewer") router.push("/hei");
      else if (user.role === "industry_partner") router.push("/industry");
      else if (user.role === "govt_admin") router.push("/govt");
      else router.push("/citizen");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: "citizen" | "hei_reviewer" | "industry_partner" | "govt_admin") => {
    setLoading(true);
    try {
      await loginAs(role);
      if (role === "hei_reviewer") router.push("/hei");
      else if (role === "industry_partner") router.push("/industry");
      else if (role === "govt_admin") router.push("/govt");
      else router.push("/citizen");
    } catch (err: any) {
      setError(err.message || "Failed demo login.");
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
          Sign In to Samadhan Setu
        </h1>
        <p className="text-xs text-slate-500">
          Access your stakeholder dashboard with role-based permissions.
        </p>
      </div>

      {/* 1-Click Fast Demo Login Selector */}
      <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-container uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-primary-container" />
          1-Click Demo Evaluation Profiles
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick("citizen")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-container text-left text-xs transition-all shadow-2xs"
          >
            <span className="font-bold text-slate-900 block">Citizen</span>
            <span className="text-[10px] text-slate-500">Ramesh Kumar</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick("hei_reviewer")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-container text-left text-xs transition-all shadow-2xs"
          >
            <span className="font-bold text-slate-900 block">HEI Faculty</span>
            <span className="text-[10px] text-slate-500">BIT Mesra Lead</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick("industry_partner")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-container text-left text-xs transition-all shadow-2xs"
          >
            <span className="font-bold text-slate-900 block">Industry CSR</span>
            <span className="text-[10px] text-slate-500">Tata Steel CSR</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick("govt_admin")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:border-primary-container text-left text-xs transition-all shadow-2xs"
          >
            <span className="font-bold text-slate-900 block">Govt Admin</span>
            <span className="text-[10px] text-slate-500">State Dept Admin</span>
          </button>
        </div>
      </div>

      {/* Manual Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@samadhansetu.jh.gov.in"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary-container hover:bg-blue-950 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link href="/auth/register" className="font-bold text-primary-container hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
