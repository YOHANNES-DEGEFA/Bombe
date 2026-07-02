import React, { memo } from "react";
import { SkeletonCard } from "./SkeletonCard";
import { joinClasses } from "./utils";

const GRID_PRESETS = {
  default:
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6",
  search:
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
  rooms:
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
};

function SkeletonGridComponent({
  count = 12,
  seed = "grid",
  variant = "default",
  className = "",
  gridClassName,
}) {
  return (
    <div
      className={joinClasses(gridClassName || GRID_PRESETS[variant] || GRID_PRESETS.default, className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={`${seed}-${index}`} seed={`${seed}-${index}`} />
      ))}
    </div>
  );
}

export const SkeletonGrid = memo(SkeletonGridComponent);
