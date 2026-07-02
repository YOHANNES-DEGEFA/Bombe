import React, { memo } from "react";
import { SkeletonCircle } from "./SkeletonCircle";
import { SkeletonText } from "./SkeletonText";
import { getSkeletonWidth, joinClasses } from "./utils";

function SkeletonAvatarComponent({
  size = 96,
  showText = true,
  seed = "avatar",
  className = "",
}) {
  return (
    <div
      className={joinClasses("flex flex-col items-center", className)}
      aria-hidden="true"
    >
      <SkeletonCircle size={size} className="mb-4 border-4 border-secondary-light" />
      {showText && (
        <div className="w-full max-w-xs space-y-3">
          <SkeletonText seed={`${seed}-name`} lines={1} lineClassName="h-5 md:h-6 mx-auto" />
          <SkeletonText
            seed={`${seed}-email`}
            lines={1}
            lineClassName="h-3.5 mx-auto"
            lastLineWidth={getSkeletonWidth(`${seed}-email`, 0, 45, 65)}
          />
        </div>
      )}
    </div>
  );
}

export const SkeletonAvatar = memo(SkeletonAvatarComponent);
