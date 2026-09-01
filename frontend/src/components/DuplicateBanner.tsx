"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Copy, ArrowUpRight } from "lucide-react";

interface DuplicateBannerProps {
  reportId: number;
  duplicateOfId?: number | null;
  similarity?: number | null;
}

export function DuplicateBanner({ reportId, duplicateOfId, similarity }: DuplicateBannerProps) {
  if (!duplicateOfId && !similarity) return null;

  const pct = similarity ? (similarity * 100).toFixed(1) : "85+";

  return (
    <div className="rounded-lg bg-amber-50 border-l-4 border-amber-500 p-3.5 mb-4 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-xs sm:text-sm text-amber-800">
            <strong className="font-semibold">Vector Deduplication Alert:</strong> This grievance has a{" "}
            <span className="font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">{pct}% semantic similarity</span>{" "}
            to an existing open report via pgvector cosine distance.
          </p>
          {duplicateOfId && (
            <p className="mt-2 md:mt-0 md:ml-4 flex-shrink-0">
              <Link
                href={`/citizen?trackId=${duplicateOfId}`}
                className="inline-flex items-center text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2"
              >
                View Primary Report #{duplicateOfId} <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
