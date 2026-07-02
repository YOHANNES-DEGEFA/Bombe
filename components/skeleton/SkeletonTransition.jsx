import React, { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

function SkeletonTransitionComponent({
  isLoading,
  skeleton,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="status"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="sr-only">Loading content</span>
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const SkeletonTransition = memo(SkeletonTransitionComponent);
