import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Slideshow from "../components/Slideshow";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonAuthPage } from "../components/skeleton";
import { useAuth } from "../hooks/useAuth";
import { SeoHead } from "../components/SeoHead";
import { buildBrandJsonLd } from "../lib/seo";

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/home");
    }
  }, [authLoading, user, router]);

  if (authLoading || user) {
    return <SkeletonAuthPage />;
  }

  const formContainerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="relative h-screen w-screen bg-primary overflow-hidden font-poppins">
      <SeoHead
        title="Bombe — Stream Movies & TV Shows"
        description="Bombe is your home for streaming movies and TV shows. Discover trending titles, build your watchlist, and watch with friends."
        canonicalPath="/"
        keywords="Bombe, Bombe movies, Bombe TV, Bombe streaming, watch movies online"
        jsonLd={buildBrandJsonLd()}
      />

      <Link
        href="/home"
        className="absolute top-6 left-6 z-30 text-2xl font-bold text-textprimary hover:text-accent transition-colors tracking-tight"
        aria-label="Bombe home"
      >
        Bom<span className="text-accent">be</span>
      </Link>

      <h1 className="sr-only">Bombe — Stream Movies and TV Shows Online</h1>

      <div className="absolute inset-0 z-0 opacity-30 md:opacity-40 blur-[2px]">
        <Slideshow />
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary via-primary/80 to-primary" />

      <div className="relative z-20 flex flex-col items-center justify-center h-full p-4 gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            variants={formContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md bg-secondary/80 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-secondary-light"
          >
            {isSignUp ? (
              <SignUp setIsSignUp={setIsSignUp} />
            ) : (
              <SignIn setIsSignUp={setIsSignUp} />
            )}
          </motion.div>
        </AnimatePresence>

        <a
          href="https://yohannes-degefa.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-textsecondary/70 hover:text-accent transition-colors tracking-wide"
        >
          Learn more about the developer
        </a>
      </div>
    </div>
  );
}
