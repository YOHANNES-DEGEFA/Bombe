import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { joinClasses } from "./utils";

function SkeletonNavigationComponent({ className = "" }) {
  return (
    <div
      className={joinClasses(
        "fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-8 flex items-center justify-between bg-primary/80 backdrop-blur-md border-b border-secondary-light/30",
        className
      )}
      aria-hidden="true"
    >
      <Skeleton rounded="md" className="h-7 w-24" />
      <div className="hidden md:flex items-center gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={`nav-${index}`} rounded="md" className="h-4 w-16" />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Skeleton rounded="full" className="h-9 w-9" />
        <Skeleton rounded="full" className="h-9 w-9 md:hidden" />
      </div>
    </div>
  );
}

export const SkeletonNavigation = memo(SkeletonNavigationComponent);

function SkeletonTableRow({ seed = "row" }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-secondary-light">
      <Skeleton rounded="md" className="h-4 w-8" />
      <Skeleton rounded="md" className="h-4 flex-1 max-w-[200px]" seed={`${seed}-col1`} />
      <Skeleton rounded="md" className="h-4 w-24 hidden sm:block" />
      <Skeleton rounded="md" className="h-4 w-16 hidden md:block" />
    </div>
  );
}

function SkeletonTableComponent({ rows = 6, className = "" }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonTableRow key={`row-${index}`} seed={`row-${index}`} />
      ))}
    </div>
  );
}

export const SkeletonTable = memo(SkeletonTableComponent);
