import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonButton } from "./SkeletonButton";
import { SkeletonText } from "./SkeletonText";
import { getSkeletonWidth, joinClasses } from "./utils";

function SkeletonHeroBackdrop({ className = "" }) {
  return (
    <Skeleton
      rounded="none"
      className={joinClasses("absolute inset-0", className)}
    />
  );
}

function SkeletonHeroContent({ className = "", seed = "hero" }) {
  return (
    <div
      className={joinClasses("max-w-lg md:max-w-xl space-y-3 md:space-y-4", className)}
      aria-hidden="true"
    >
      <Skeleton
        rounded="md"
        width={getSkeletonWidth(`${seed}-title`, 0, 68, 82)}
        className="h-8 md:h-10 lg:h-12"
      />

      <div className="flex flex-wrap gap-2">
        <Skeleton rounded="full" className="h-5 md:h-6 w-16 md:w-20" />
        <Skeleton rounded="full" className="h-5 md:h-6 w-20 md:w-24" />
        <Skeleton rounded="full" className="h-5 md:h-6 w-14 md:w-16" />
      </div>

      <SkeletonText
        seed={`${seed}-overview`}
        lines={3}
        lineClassName="h-3.5 md:h-4"
        lastLineWidth={getSkeletonWidth(`${seed}-overview`, 2, 52, 72)}
      />

      <SkeletonButton size="pill" rounded="pill" />
    </div>
  );
}

function SkeletonHeroComponent({
  variant = "full",
  className = "",
  seed = "hero",
  withMarginTop = true,
}) {
  if (variant === "content") {
    return <SkeletonHeroContent className={className} seed={seed} />;
  }

  return (
    <div
      className={joinClasses(
        "relative w-full h-[75vh] overflow-hidden bg-primary",
        withMarginTop && "mt-16",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading featured content"
    >
      <span className="sr-only">Loading featured content</span>
      <SkeletonHeroBackdrop />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-transparent to-transparent opacity-80" />

      <div className="relative z-10 h-full flex flex-col justify-end items-start px-6 pt-6 pb-20 md:px-10 md:pt-10 md:pb-24 lg:px-20 lg:pt-12 lg:pb-28">
        <SkeletonHeroContent seed={seed} />
      </div>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={`dot-${index}`}
            rounded="full"
            className={index === 0 ? "h-2.5 w-2.5 md:h-3 md:w-3" : "h-2 w-2 md:h-2.5 md:w-2.5"}
          />
        ))}
      </div>
    </div>
  );
}

export const SkeletonHero = memo(SkeletonHeroComponent);
