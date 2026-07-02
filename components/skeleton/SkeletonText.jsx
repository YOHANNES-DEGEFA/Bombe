import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { getSkeletonWidth, joinClasses } from "./utils";

function SkeletonTextComponent({
  lines = 1,
  seed = "text",
  className = "",
  lineClassName = "",
  lastLineWidth,
}) {
  return (
    <div className={joinClasses("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => {
        const isLast = index === lines - 1;
        const width = isLast && lastLineWidth != null
          ? lastLineWidth
          : getSkeletonWidth(seed, index, 58, isLast ? 82 : 95);

        return (
          <Skeleton
            key={`${seed}-${index}`}
            rounded="md"
            width={width}
            className={joinClasses("h-3.5 md:h-4", lineClassName)}
          />
        );
      })}
    </div>
  );
}

export const SkeletonText = memo(SkeletonTextComponent);
