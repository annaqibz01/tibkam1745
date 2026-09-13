// src/components/shared/PageTransition.tsx
import React from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const FAST_EASE = [0.2, 0, 0, 1] as const;

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.12,
      ease: FAST_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: {
      duration: 0.08,
      ease: FAST_EASE,
    },
  },
};

const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.08 },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const activeVariants = shouldReduceMotion ? reducedMotionVariants : pageVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={activeVariants}
      className={`w-full min-h-full ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};