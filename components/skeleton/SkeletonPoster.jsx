import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { joinClasses } from "./utils";

function SkeletonPosterComponent({ className = "", aspectRatio = "aspect-[2/3]" }) {
  return (
    <Skeleton
      rounded="lg"
      className={joinClasses("w-full", aspectRatio, className)}
    />
  );
}

export const SkeletonPoster = memo(SkeletonPosterComponent);
