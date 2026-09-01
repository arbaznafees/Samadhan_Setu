"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { JHARKHAND_DISTRICTS } from "@/components/GeoLocationPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PublicNavbar, PublicFooter } from "@/components/layout/PublicNavbar";

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
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <PublicNavbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#002147] text-[#FED65B] flex items-center justify-center font-bold text-2xl mx-auto shadow-sm">
            सं
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500">
            Join the Samadhan Setu civic research and CSR funding network.
          </p>
        </div>

        <Card padding="md" className="space-y-4">
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
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FED65B] font-medium"
              >
                <option value="citizen">Citizen (Grievance Submitter)</option>
                <option value="hei_reviewer">HEI Faculty / Reviewer (University Lab)</option>
                <option value="industry_partner">Industry Partner / CSR Sponsor</option>
                <option value="govt_admin">Government Officer / Administrator</option>
              </select>
            </div>

            <Input
              label="Full Name *"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar / Dr. A. Verma"
            />

            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
            />

            <Input
              label="Password *"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 ..."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FED65B]"
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
              <Input
                label="Institution / Company Name *"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. BIT Mesra / Tata Steel Foundation"
              />
            )}

            <Button
              type="submit"
              variant="accent"
              isLoading={loading}
              className="w-full mt-2"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-[#002147] hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
