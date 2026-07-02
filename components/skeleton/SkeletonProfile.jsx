import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonAvatar } from "./SkeletonAvatar";
import { SkeletonButton } from "./SkeletonButton";
import { joinClasses } from "./utils";

function SkeletonStatsCard() {
  return (
    <div className="bg-secondary-light p-4 rounded-lg border border-secondary text-center">
      <Skeleton
        rounded="md"
        width={72}
        className="h-3 mx-auto mb-2"
      />
      <Skeleton rounded="md" width={48} className="h-6 md:h-7 mx-auto" />
    </div>
  );
}

function SkeletonProfileComponent({ className = "" }) {
  return (
    <div
      className={joinClasses(
        "bg-secondary p-6 md:p-8 rounded-xl w-full max-w-3xl border border-secondary-light flex flex-col items-center",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <span className="sr-only">Loading profile</span>
      <Skeleton rounded="md" width={28} className="h-8 mb-6" />
      <SkeletonAvatar size={96} seed="profile" />

      <div className="w-full max-w-xs mt-6 space-y-3">
        <SkeletonButton size="md" className="w-full" rounded="lg" />
      </div>

      <div className="w-full border-t border-secondary-light pt-6 mt-6">
        <Skeleton rounded="md" width={36} className="h-5 mx-auto mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 w-full">
          {Array.from({ length: 7 }, (_, index) => (
            <SkeletonStatsCard key={`stat-${index}`} />
          ))}
        </div>
      </div>

      <SkeletonButton size="md" className="mt-8 w-40" rounded="lg" />
    </div>
  );
}

export const SkeletonProfile = memo(SkeletonProfileComponent);
