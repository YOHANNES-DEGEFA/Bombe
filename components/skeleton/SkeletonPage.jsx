import React, { memo } from "react";
import NavBar from "../NavBar";
import Footer from "../Footer";
import { Skeleton } from "./Skeleton";
import { SkeletonCarousel } from "./SkeletonCarousel";
import { SkeletonCircle } from "./SkeletonCircle";
import { SkeletonGrid } from "./SkeletonGrid";
import { SkeletonHero } from "./SkeletonHero";
import { SkeletonList } from "./SkeletonList";
import { SkeletonPoster } from "./SkeletonPoster";
import { SkeletonProfile } from "./SkeletonProfile";
import { SkeletonRoomGrid, SkeletonEpisodeStrip } from "./SkeletonEpisodeStrip";
import { SkeletonSearch } from "./SkeletonSearch";
import { SkeletonText } from "./SkeletonText";
import { joinClasses } from "./utils";

function SkeletonPageShell({
  children,
  showNav = false,
  showFooter = false,
  className = "",
  mainClassName = "",
}) {
  return (
    <div
      className={joinClasses(
        "min-h-screen bg-primary text-textprimary flex flex-col font-poppins",
        className
      )}
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading page content</span>
      {showNav && <NavBar />}
      <div className={joinClasses("flex-grow", mainClassName)}>{children}</div>
      {showFooter && <Footer />}
    </div>
  );
}

function SkeletonHomePageComponent() {
  return (
    <SkeletonPageShell>
      <SkeletonHero seed="home-hero" withMarginTop={false} className="-mt-16" />
      <main className="md:py-10">
        <SkeletonCarousel seed="trending-movies" count={8} />
        <SkeletonCarousel seed="rated-movies" count={8} />
        <SkeletonHero seed="tv-hero" withMarginTop={false} className="h-[50vh] mb-10" />
        <SkeletonCarousel seed="trending-shows" count={8} />
        <SkeletonCarousel seed="rated-shows" count={8} />
      </main>
    </SkeletonPageShell>
  );
}

function SkeletonCardGridPageComponent({
  titleWidth = 40,
  withTabs = false,
  tabCount = 2,
  gridCount = 12,
}) {
  return (
    <SkeletonPageShell className="mt-16" mainClassName="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
        <Skeleton rounded="md" width={titleWidth} className="h-9 md:h-10" />

        {withTabs && (
          <div className="flex gap-6 border-b border-secondary-light pb-3">
            {Array.from({ length: tabCount }, (_, index) => (
              <Skeleton key={`tab-${index}`} rounded="md" className="h-5 w-28" />
            ))}
          </div>
        )}

        <SkeletonGrid count={gridCount} seed="page-grid" />
      </div>
    </SkeletonPageShell>
  );
}

function SkeletonProfilePageComponent() {
  return (
    <SkeletonPageShell className="mt-16 items-center p-4 md:p-6">
      <SkeletonProfile />
    </SkeletonPageShell>
  );
}

function SkeletonBuddiesPageComponent() {
  return (
    <SkeletonPageShell className="mt-16" mainClassName="p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Skeleton rounded="md" width={32} className="h-9" />
        <div className="flex gap-4 border-b border-secondary-light pb-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={`buddy-tab-${index}`} rounded="md" className="h-5 w-24" />
          ))}
        </div>
        <Skeleton rounded="md" className="h-11 w-full max-w-md" />
        <SkeletonList count={5} seed="buddies" />
      </div>
    </SkeletonPageShell>
  );
}

function SkeletonRoomsPageComponent() {
  return (
    <SkeletonPageShell className="mt-16" mainClassName="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Skeleton rounded="md" width={48} className="h-8 md:h-9" />
        <Skeleton rounded="lg" className="h-10 w-36" />
      </div>
      <SkeletonRoomGrid count={6} />
    </SkeletonPageShell>
  );
}

function SkeletonSearchPageComponent() {
  return (
    <SkeletonPageShell className="mt-20" mainClassName="flex-1 p-6">
      <SkeletonSearch />
    </SkeletonPageShell>
  );
}

function SkeletonAuthPageComponent() {
  return (
    <div className="min-h-screen w-full flex bg-primary" role="status" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="hidden lg:block w-1/2 h-screen overflow-hidden p-4">
        <div className="columns-2 md:columns-3 gap-4 h-full">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton
              key={`auth-slide-${index}`}
              rounded="md"
              className="break-inside-avoid-column mb-4 aspect-[2/3] w-full"
            />
          ))}
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <Skeleton rounded="md" width={55} className="h-8 mx-auto" />
          <Skeleton rounded="lg" className="h-12 w-full" />
          <Skeleton rounded="lg" className="h-12 w-full" />
          <Skeleton rounded="lg" className="h-11 w-full" />
          <Skeleton rounded="md" width={60} className="h-4 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export const SkeletonPage = memo(SkeletonPageShell);
export const SkeletonHomePage = memo(SkeletonHomePageComponent);
export const SkeletonCardGridPage = memo(SkeletonCardGridPageComponent);
export const SkeletonProfilePage = memo(SkeletonProfilePageComponent);
export const SkeletonBuddiesPage = memo(SkeletonBuddiesPageComponent);
export const SkeletonRoomsPage = memo(SkeletonRoomsPageComponent);
export const SkeletonSearchPage = memo(SkeletonSearchPageComponent);
export const SkeletonAuthPage = memo(SkeletonAuthPageComponent);

function SkeletonDetailPageComponent() {
  return (
    <SkeletonPageShell className="mt-16">
      <SkeletonHero seed="detail-hero" withMarginTop={false} />
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-3">
          <Skeleton rounded="lg" className="h-11 w-36" />
          <Skeleton rounded="lg" className="h-11 w-32" />
          <Skeleton rounded="lg" className="h-11 w-28" />
        </div>
        <Skeleton rounded="md" width={88} className="h-6" />
        <SkeletonText seed="detail-overview" lines={4} />
        <div>
          <Skeleton rounded="md" width={28} className="h-6 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={`cast-${index}`} className="flex-shrink-0 w-24 text-center space-y-2">
                <SkeletonCircle size={72} className="mx-auto" />
                <Skeleton rounded="md" width={80} className="h-3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </SkeletonPageShell>
  );
}

function SkeletonWatchTvPageComponent() {
  return (
    <SkeletonPageShell className="mt-16">
      <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <SkeletonPoster className="w-full lg:w-64 flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <Skeleton rounded="md" width={72} className="h-8 md:h-10" />
            <SkeletonText seed="show-meta" lines={2} />
            <SkeletonText seed="show-overview" lines={4} />
          </div>
        </div>
        <div>
          <Skeleton rounded="md" width={32} className="h-6 mb-4" />
          <SkeletonEpisodeStrip count={6} />
        </div>
      </main>
    </SkeletonPageShell>
  );
}

export const SkeletonDetailPage = memo(SkeletonDetailPageComponent);
export const SkeletonWatchTvPage = memo(SkeletonWatchTvPageComponent);
