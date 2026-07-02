import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { joinClasses } from "./utils";

function SkeletonButtonComponent({
  size = "md",
  className = "",
  width,
  rounded = "md",
}) {
  const sizeClasses = {
    sm: "h-8 w-24",
    md: "h-10 w-32",
    lg: "h-11 w-40",
    pill: "h-10 md:h-11 w-36 md:w-40",
  };

  return (
    <Skeleton
      rounded={rounded === "pill" ? "full" : rounded}
      className={joinClasses(sizeClasses[size] || sizeClasses.md, className)}
      width={width}
    />
  );
}

export const SkeletonButton = memo(SkeletonButtonComponent);
