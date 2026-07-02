import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonPoster } from "./SkeletonPoster";
import { SkeletonText } from "./SkeletonText";
import { getSkeletonWidth, joinClasses } from "./utils";

function SkeletonCardComponent({ seed = "card", className = "", showOverlay = true }) {
  return (
    <div
      className={joinClasses(
        "relative w-full rounded-lg overflow-hidden border border-secondary/50",
        className
      )}
      aria-hidden="true"
    >
      <SkeletonPoster />

      <Skeleton
        rounded="full"
        className="absolute top-2 right-2 h-7 w-7"
      />

      {showOverlay && (
        <div className="absolute bottom-0 left-0 w-full p-3 pt-6 bg-gradient-to-t from-secondary via-secondary/80 to-transparent">
          <SkeletonText
            seed={`${seed}-title`}
            lines={1}
            lineClassName="h-4 md:h-[18px] mb-1.5"
            lastLineWidth={getSkeletonWidth(`${seed}-title`, 0, 68, 88)}
          />
          <div className="flex items-center gap-2">
            <Skeleton rounded="md" className="h-3 w-10" />
            <Skeleton
              rounded="md"
              width={getSkeletonWidth(`${seed}-genre`, 1, 42, 62)}
              className="h-3"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const SkeletonCard = memo(SkeletonCardComponent);
