"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogIn,
  Building2,
  Users,
  Briefcase,
  BarChart3,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Check,
  Copy,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";

const DEMO_PROFILES = [
  {
    role: "citizen" as const,
    title: "Citizen",
    name: "Ramesh Kumar",
    email: "citizen@samadhansetu.jh.gov.in",
    target: "/citizen",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    role: "hei_reviewer" as const,
    title: "HEI Faculty",
    name: "BIT Mesra Lead",
    email: "bit.mesra@samadhansetu.jh.gov.in",
    target: "/hei",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    role: "industry_partner" as const,
    title: "Industry CSR",
    name: "Tata Steel CSR",
    email: "csr@tatasteel.com",
    target: "/industry",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    role: "govt_admin" as const,
    title: "Govt Admin",
    name: "State Admin",
    email: "admin@jharkhand.gov.in",
    target: "/govt",
    badge: "bg-slate-100 text-slate-800 border-slate-200",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const navigateToRole = (role: string) => {
    let target = "/citizen";
    if (role === "hei_reviewer") target = "/hei";
    else if (role === "industry_partner") target = "/industry";
    else if (role === "govt_admin") target = "/govt";

    router.push(target);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (window.location.pathname.includes("/auth/login")) {
          window.location.href = target;
        }
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email.trim(), password);
      navigateToRole(user.role);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (profile: (typeof DEMO_PROFILES)[0]) => {
    setLoading(true);
    setActiveRole(profile.role);
    setError("");
    setEmail(profile.email);
    setPassword("password123");

    try {
      const user = await login(profile.email, "password123");
      navigateToRole(user?.role || profile.role);
    } catch (err: any) {
      setError(err.message || `Failed to sign in as ${profile.title}. Please check server connectivity.`);
    } finally {
      setLoading(false);
      setActiveRole(null);
    }
  };

  const handleAutofill = (profile: (typeof DEMO_PROFILES)[0]) => {
    setEmail(profile.email);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <PublicNavbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-bold text-2xl mx-auto shadow-sm">
            सं
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Sign In to Samadhan Setu
          </h1>
          <p className="text-xs text-slate-500">
            Access your dedicated stakeholder workspace with role-based security.
          </p>
        </div>

        {/* 1-Click Fast Demo Login Profiles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#002147] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FED65B]" />
              1-Click Demo Evaluation Profiles
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Click to Login Instantly</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_PROFILES.map((profile) => {
              const isSelected = activeRole === profile.role;
              return (
                <button
                  key={profile.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoClick(profile)}
                  className={`p-3 rounded-xl border text-left transition-all focus-ring relative group ${
                    isSelected
                      ? "bg-slate-100 border-[#002147] ring-2 ring-[#002147]"
                      : "bg-slate-50 border-slate-200 hover:border-[#002147] hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900 text-xs">{profile.title}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${profile.badge}`}>
                      1-Click
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block truncate">{profile.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate mt-0.5">
                    {profile.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Credentials Form */}
        <Card padding="md" className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 font-heading">
              Or Sign In with Email & Password
            </h2>
            <p className="text-[11px] text-slate-500">
              Standard credentials: password for all demo accounts is <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#002147] font-bold">password123</code>
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. csr@tatasteel.com or admin@jharkhand.gov.in"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Credential Copy Bar */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick Autofill Credentials:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {DEMO_PROFILES.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleAutofill(p)}
                  className="p-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-left flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="font-medium truncate">{p.title}:</span>
                  <span className="text-[10px] text-[#002147] font-bold underline shrink-0 ml-1">Fill</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-bold text-[#002147] hover:underline">
              Register Here
            </Link>
          </div>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
