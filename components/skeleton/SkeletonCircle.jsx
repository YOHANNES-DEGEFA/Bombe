import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { joinClasses } from "./utils";

function SkeletonCircleComponent({ size = 40, className = "" }) {
  return (
    <Skeleton
      rounded="full"
      className={joinClasses("flex-shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}

export const SkeletonCircle = memo(SkeletonCircleComponent);
