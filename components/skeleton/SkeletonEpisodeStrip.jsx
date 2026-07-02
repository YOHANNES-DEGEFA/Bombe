import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonText } from "./SkeletonText";
import { joinClasses } from "./utils";

function SkeletonEpisodeStripComponent({ count = 6, className = "" }) {
  return (
    <div
      className={joinClasses("flex gap-3 md:gap-4 overflow-hidden episode-strip", className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={`episode-${index}`} className="flex-shrink-0 w-40 md:w-48">
          <Skeleton rounded="md" className="aspect-video w-full mb-2" />
          <SkeletonText seed={`episode-${index}`} lines={2} lineClassName="h-3" />
        </div>
      ))}
    </div>
  );
}

export const SkeletonEpisodeStrip = memo(SkeletonEpisodeStripComponent);

function SkeletonRoomCard({ seed = "room" }) {
  return (
    <div className="bg-secondary rounded-lg p-4 border border-secondary-light h-full flex flex-col justify-between min-h-[140px]">
      <div className="space-y-3">
        <Skeleton rounded="md" width={72} className="h-5" seed={`${seed}-title`} />
        <SkeletonText seed={`${seed}-desc`} lines={2} lineClassName="h-3" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-secondary-light">
        <Skeleton rounded="md" className="h-4 w-20" />
        <Skeleton rounded="md" className="h-4 w-16" />
      </div>
    </div>
  );
}

function SkeletonRoomGridComponent({ count = 6, className = "" }) {
  return (
    <div
      className={joinClasses(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonRoomCard key={`room-${index}`} seed={`room-${index}`} />
      ))}
    </div>
  );
}

export const SkeletonRoomGrid = memo(SkeletonRoomGridComponent);

function SkeletonSlideshowComponent({ className = "" }) {
  return (
    <div
      className={joinClasses("w-full h-full columns-2 md:columns-3 gap-4 md:gap-6", className)}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <Skeleton
          key={`slide-${index}`}
          rounded="md"
          className="break-inside-avoid-column mb-4 md:mb-6 aspect-[2/3] w-full"
        />
      ))}
    </div>
  );
}

export const SkeletonSlideshow = memo(SkeletonSlideshowComponent);
