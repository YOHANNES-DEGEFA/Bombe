import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Slideshow from "../components/Slideshow";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonAuthPage } from "../components/skeleton";
import { useAuth } from "../hooks/useAuth";

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

  // Framer Motion variants for the auth form container
  const formContainerVariants = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };


  return (
    // Main container covering screen
    <div className="relative h-screen w-screen bg-primary overflow-hidden font-poppins">
      <Head>
        {/* Keep your existing Head tags here */}
        <title>Welcome to Bombe</title>
        {/* ... other meta tags ... */}
        <meta name="robots" content="noindex, nofollow" /> {/* Usually don't index login/signup */}
      </Head>

      {/* Background Slideshow - positioned absolutely behind everything */}
      <div className="absolute inset-0 z-0 opacity-30 md:opacity-40 blur-[2px]"> {/* Adjust opacity and blur */}
        <Slideshow />
      </div>
      {/* Overlay gradient to darken slideshow further */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary via-primary/80 to-primary"></div>

      {/* Centered Content Area */}
      <div className="relative z-20 flex items-center justify-center h-full p-4">
            {/* Animated container for switching forms */}
           <AnimatePresence mode="wait">
             <motion.div
                 key={isSignUp ? 'signup' : 'signin'} // Key change triggers animation
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
      </div>
    </div>
  );
}