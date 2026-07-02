import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonCircle } from "./SkeletonCircle";
import { getSkeletonWidth, joinClasses } from "./utils";

function SkeletonListItem({ seed = "list-item", showActions = true }) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-lg mb-3 bg-secondary border border-secondary-light">
      <div className="flex items-center overflow-hidden mr-3 min-w-0">
        <SkeletonCircle size={40} className="mr-3 border-2 border-secondary-light" />
        <Skeleton
          rounded="md"
          width={getSkeletonWidth(`${seed}-name`, 0, 42, 68)}
          className="h-4 md:h-5"
        />
      </div>

      {showActions && (
        <div className="flex-shrink-0 flex items-center gap-2">
          <Skeleton rounded="md" className="h-8 w-20 md:w-24" />
          <Skeleton rounded="md" className="h-8 w-20 md:w-24 hidden sm:block" />
        </div>
      )}
    </div>
  );
}

function SkeletonListComponent({
  count = 5,
  seed = "list",
  className = "",
  showActions = true,
}) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonListItem
          key={`${seed}-${index}`}
          seed={`${seed}-${index}`}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

export const SkeletonList = memo(SkeletonListComponent);
