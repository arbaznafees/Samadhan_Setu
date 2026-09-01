"use client";

import React from "react";
import { CitizenHeader, CitizenBottomNav } from "@/components/layout/CitizenNav";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["citizen"]}>
      <div className="min-h-screen bg-surface-subtle flex flex-col">
        <CitizenHeader />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
          {children}
        </main>
        <CitizenBottomNav />
      </div>
    </AuthGuard>
  );
}
