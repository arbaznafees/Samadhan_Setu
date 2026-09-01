"use client";

import React from "react";
import { GovtSidebar, GovtHeader } from "@/components/layout/GovtNav";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function GovtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["govt_admin"]}>
      <div className="min-h-screen bg-surface-subtle flex flex-row">
        <GovtSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <GovtHeader />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
