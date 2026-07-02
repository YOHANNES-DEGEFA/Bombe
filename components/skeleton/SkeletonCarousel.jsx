import React, { memo } from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonCard } from "./SkeletonCard";
import { getSkeletonWidth, joinClasses } from "./utils";

function SkeletonCarouselComponent({
  title = true,
  count = 8,
  seed = "carousel",
  className = "",
  cardClassName = "flex-shrink-0 w-36 md:w-44 lg:w-48",
}) {
  return (
    <section
      className={joinClasses("mb-10 md:mb-12 px-4 md:px-6 lg:px-8", className)}
      aria-hidden="true"
    >
      {title && (
        <div className="flex items-center gap-3 mb-4 px-4 md:px-0">
          <Skeleton rounded="md" className="h-6 w-6 md:h-7 md:w-7" />
          <Skeleton
            rounded="md"
            width={getSkeletonWidth(`${seed}-title`, 0, 38, 52)}
            className="h-6 md:h-7"
          />
        </div>
      )}

      <div className="flex overflow-x-hidden space-x-4 md:space-x-6 pb-4 pt-5 pl-4 md:pl-0">
        {Array.from({ length: count }, (_, index) => (
          <div key={`${seed}-card-${index}`} className={cardClassName}>
            <SkeletonCard seed={`${seed}-${index}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

export const SkeletonCarousel = memo(SkeletonCarouselComponent);
