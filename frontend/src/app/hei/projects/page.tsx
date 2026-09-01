"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Clock,
  CheckCircle2,
  FlaskConical,
  Wrench,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function HeiProjectsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssignedReports()
      .then((data) => setReports(data || []))
      .catch((err) => console.warn("Error fetching projects:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const stages = [
    { key: "assigned", title: "Intake & Literature Review", color: "border-sky-300" },
    { key: "in_progress", title: "Laboratory & Field Prototyping", color: "border-amber-300" },
    { key: "prototype_ready", title: "Prototype Ready for CSR", color: "border-indigo-300" },
    { key: "resolved", title: "Deployed & Ground Verified", color: "border-emerald-300" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Active University R&D Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Structured Kanban lifecycle of civic challenge solutions currently under academic investigation.
          </p>
        </div>
        <Link href="/hei">
          <Button variant="secondary" size="sm">
            View Assigned Inbox
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {stages.map((stage) => {
            const stageReports = reports.filter((r) => {
              if (stage.key === "assigned") {
                return r.status === "assigned" || !r.status || r.status === "submitted";
              }
              return r.status === stage.key;
            });

            return (
              <div
                key={stage.key}
                className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {stage.title}
                  </h3>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700">
                    {stageReports.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[250px]">
                  {stageReports.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-3">
                      <span className="text-[11px] text-slate-400">No active items</span>
                    </div>
                  ) : (
                    stageReports.map((item) => (
                      <Card
                        key={item.id}
                        padding="sm"
                        hoverEffect
                        className="bg-white border-slate-200 shadow-subtle space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-[#002147]">
                            {item.tracking_number}
                          </span>
                          <StatusBadge status={item.status} size="sm" />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>{item.district || "Ranchi"}</span>
                          <span className="font-medium text-slate-700">{item.domain || "Tech"}</span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
