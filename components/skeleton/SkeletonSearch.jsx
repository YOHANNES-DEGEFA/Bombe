import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonGrid } from "./SkeletonGrid";
import { joinClasses } from "./utils";

function SkeletonSearchComponent({
  showFilters = true,
  gridCount = 8,
  className = "",
}) {
  return (
    <div className={className} role="status" aria-busy="true" aria-label="Loading search">
      <span className="sr-only">Loading search results</span>

      <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
        <Skeleton rounded="md" className="h-12 w-full" />

        {showFilters && (
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Skeleton rounded="md" className="h-4 w-10" />
              <Skeleton rounded="md" className="h-10 w-14" />
              <Skeleton rounded="md" className="h-10 w-20" />
              <Skeleton rounded="md" className="h-10 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton rounded="md" className="h-4 w-10" />
              <Skeleton rounded="md" className="h-10 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton rounded="md" className="h-4 w-12" />
              <Skeleton rounded="md" className="h-10 w-36" />
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <Skeleton rounded="md" className="h-7 w-40 mb-6" />
        <SkeletonGrid count={gridCount} seed="search-grid" variant="search" />
      </div>
    </div>
  );
}

export const SkeletonSearch = memo(SkeletonSearchComponent);

function SkeletonBannerComponent({ className = "" }) {
  return (
    <Skeleton
      rounded="none"
      className={joinClasses("w-full h-[60vh] mt-16", className)}
      aria-label="Loading banner"
    />
  );
}

export const SkeletonBanner = memo(SkeletonBannerComponent);
