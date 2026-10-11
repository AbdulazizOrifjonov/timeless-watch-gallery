"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ProductCardSkeleton({
  variant = "compact",
}: {
  variant?: "compact" | "full";
}) {
  if (variant === "full") {
    return (
      <div className="relative flex flex-row items-center gap-4 sm:gap-6 rounded-2xl border border-navy-100/80 bg-white p-3 sm:p-4 shadow-sm animate-pulse">
        {/* Watch Image Skeleton */}
        <div className="relative h-40 w-40 md:h-48 md:w-48 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-navy-100/80 via-navy-50/60 to-navy-100/80 flex items-center justify-center">
          {/* Subtle watch outline icon */}
          <div className="h-16 w-16 rounded-full border-2 border-navy-200/50 flex items-center justify-center opacity-40">
            <div className="h-2 w-2 rounded-full bg-navy-300" />
          </div>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>

        {/* Content Details Skeleton */}
        <div className="flex flex-1 flex-col justify-between py-1 space-y-3">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-navy-100" />
            <div className="h-5 w-3/4 rounded-md bg-navy-100" />
            <div className="h-3.5 w-1/2 rounded-md bg-navy-100/70" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3.5 w-24 rounded-full bg-amber-100/80" />
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-navy-50">
            <div className="space-y-1">
              <div className="h-6 w-28 rounded-md bg-navy-200/80" />
              <div className="h-3.5 w-16 rounded-md bg-navy-100/60" />
            </div>
            <div className="h-10 w-32 rounded-xl bg-navy-200" />
          </div>
        </div>
      </div>
    );
  }

  // Compact (Grid) Skeleton
  return (
    <div className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-navy-100/70 bg-white p-2 sm:p-3 shadow-xs animate-pulse">
      {/* Watch Image Skeleton */}
      <div className="relative mb-[3px] sm:mb-2.5 aspect-[4/5] w-full overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-navy-100/80 via-navy-50/60 to-navy-100/80 flex items-center justify-center">
        {/* Subtle watch silhouette */}
        <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full border-2 border-navy-200/40 flex items-center justify-center opacity-30">
          <div className="h-2.5 w-2.5 rounded-full bg-navy-300" />
        </div>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        
        {/* Fake tag */}
        <div className="absolute left-1.5 bottom-1.5 sm:left-2 sm:bottom-2 h-4 w-14 rounded bg-white/70" />
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col justify-between pt-1 space-y-2">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded-full bg-navy-100" />
          <div className="h-3.5 w-full rounded-md bg-navy-100" />
          <div className="h-3.5 w-4/5 rounded-md bg-navy-100/70" />
        </div>

        {/* Price & Action */}
        <div className="mt-2 space-y-2 pt-1 border-t border-navy-50">
          <div className="flex items-baseline justify-between">
            <div className="h-4.5 sm:h-5 w-24 rounded-md bg-navy-200/80" />
            <div className="h-3 w-10 rounded-md bg-navy-100/60" />
          </div>
          <div className="h-8 sm:h-9 w-full rounded-lg sm:rounded-xl bg-navy-100" />
        </div>
      </div>
    </div>
  );
}
