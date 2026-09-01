"use client";

import React, { useState } from "react";
import { Users, GraduationCap, Award, Plus, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function HeiTeamPage() {
  const { user } = useAuth();

  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Dr. Alok Verma",
      role: "Principal Investigator & Professor",
      dept: "Environmental Science & Engg",
      email: "alok.verma@bitmesra.ac.in",
      activeProjects: 3,
    },
    {
      id: 2,
      name: "Dr. R. K. Singh",
      role: "Associate Professor",
      dept: "Civil & Water Resource Engg",
      email: "rksingh@bitmesra.ac.in",
      activeProjects: 2,
    },
    {
      id: 3,
      name: "Pooja Kumari",
      role: "Senior Research Fellow (SRF)",
      dept: "Water Quality Testing Lab",
      email: "pooja.srf@bitmesra.ac.in",
      activeProjects: 2,
    },
    {
      id: 4,
      name: "Amit Soren",
      role: "Junior Research Fellow (JRF)",
      dept: "Geospatial Sensor Networks",
      email: "amit.jrf@bitmesra.ac.in",
      activeProjects: 1,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            Faculty & Research Team Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered investigators, PhD fellows, and student researchers at {user?.organization || "BIT Mesra"}.
          </p>
        </div>
        <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Add Researcher
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) => (
          <Card key={m.id} padding="md" hoverEffect className="border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#002147] text-[#FED65B] flex items-center justify-center font-bold text-sm">
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-[#002147] px-2 py-0.5 rounded-full border border-blue-200">
                {m.activeProjects} Active Tasks
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{m.dept}</span>
              <a href={`mailto:${m.email}`} className="text-[#002147] hover:underline flex items-center gap-1 font-medium">
                <Mail className="w-3 h-3" /> Email
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
