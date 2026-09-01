"use client";

import React from "react";
import { HeiSidebar, HeiHeader } from "@/components/layout/HeiNav";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function HeiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["hei_reviewer"]}>
      <div className="min-h-screen bg-surface-subtle flex flex-row">
        <HeiSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <HeiHeader />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
