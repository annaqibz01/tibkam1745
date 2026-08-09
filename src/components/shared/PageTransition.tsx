// src/components/shared/PageTransition.tsx
import React from 'react';
import { motion, type Variants, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// ⚡ Fast Decelerate Curve (Native Desktop & App Feel)
const FAST_EASE = [0.25, 1, 0.5, 1] as const;

/**
 * Varian Transisi Ringan (Pure Opacity + Light Y-Shift)
 * Menghapus properti `scale` & memotong durasi ke 180ms agar GPU tidak melakukan
 * re-rasterization pada elemen glassmorphism/tabel besar saat navigasi.
 */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6, // Pergeseran mikro 6px
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18, // ⏱️ Entry responsif (180ms)
      ease: FAST_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12, // ⏱️ Exit instan (120ms) agar halaman lama langsung lepas
      ease: FAST_EASE,
    },
  },
};

const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
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