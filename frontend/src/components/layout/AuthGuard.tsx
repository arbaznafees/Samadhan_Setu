"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, UserProfile } from "@/lib/auth-context";
import { ShieldAlert, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AuthGuardProps {
  allowedRoles?: Array<UserProfile["role"]>;
  children: React.ReactNode;
  fallbackToDemo?: boolean;
}

export function AuthGuard({
  allowedRoles,
  children,
  fallbackToDemo = true,
}: AuthGuardProps) {
  const { user, isLoading, loginAs } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Strictly gate demo role-switching to development or explicit NEXT_PUBLIC_DEMO_MODE=true
  const isDemoMode =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    if (isLoading) return;

    if (!allowedRoles || allowedRoles.length === 0) {
      setAuthorized(true);
      return;
    }

    if (!user) {
      // Not logged in
      setAuthorized(false);
      return;
    }

    if (allowedRoles.includes(user.role)) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, [user, isLoading, allowedRoles]);

  if (isLoading || authorized === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#002147] border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-slate-500">Verifying session permissions...</p>
      </div>
    );
  }

  if (!authorized) {
    const requiredRole = allowedRoles?.[0] || "citizen";
    const roleLabels: Record<string, string> = {
      citizen: "Citizen Portal",
      hei_reviewer: "HEI Faculty & Research Portal",
      industry_partner: "Industry & CSR Sponsor Portal",
      govt_admin: "Government Administration Dashboard",
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {user ? "Role Switch Required" : "Sign In Required"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {user
                ? `Your current active session (${user.role.replace("_", " ")}) does not have permission to view the ${roleLabels[requiredRole]}.`
                : `Please sign in to access the ${roleLabels[requiredRole]}.`}
            </p>
          </div>

          {/* Quick Demo Switcher / Direct Access Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Button
              variant="accent"
              className="w-full"
              onClick={async () => {
                try {
                  await loginAs(requiredRole as any);
                  setAuthorized(true);
                } catch {
                  router.push(`/auth/login?role=${requiredRole}`);
                }
              }}
            >
              Sign In as {roleLabels[requiredRole]?.split(" ")[0]}
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/auth/login?role=${requiredRole}`)}
            >
              <LogIn className="w-3.5 h-3.5" />
              Manual Credentials
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
            >
              Public Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
