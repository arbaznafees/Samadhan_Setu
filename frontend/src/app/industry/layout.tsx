"use client";

import React from "react";
import { IndustrySidebar, IndustryHeader } from "@/components/layout/IndustryNav";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["industry_partner"]}>
      <div className="min-h-screen bg-surface-subtle flex flex-row">
        <IndustrySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <IndustryHeader />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
