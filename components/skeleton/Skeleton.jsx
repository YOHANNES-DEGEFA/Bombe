import React, { memo } from "react";
import { joinClasses } from "./utils";

const ROUNDED = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

function SkeletonComponent({
  className = "",
  rounded = "md",
  shimmer = true,
  style,
  width,
  height,
  as: Component = "div",
  ...props
}) {
  const dimensionStyle = {
    ...(width != null
      ? { width: typeof width === "number" ? `${width}%` : width }
      : {}),
    ...(height != null
      ? { height: typeof height === "number" ? `${height}px` : height }
      : {}),
  };

  return (
    <Component
      className={joinClasses(
        "skeleton",
        shimmer ? "skeleton-shimmer" : "skeleton-static",
        ROUNDED[rounded] || ROUNDED.md,
        className
      )}
      style={{ ...dimensionStyle, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

export const Skeleton = memo(SkeletonComponent);
