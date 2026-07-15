// src/components/shared/PageTransition.tsx
import React from 'react';
import { motion, type Variants, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Class CSS opsional jika ingin menambahkan styling kustom pada wrapper */
  className?: string;
}

// ✨ Easing Curve Khas Vercel / Apple iOS (Emphasized Decelerate)
const EASING_CURVE = [0.16, 1, 0.3, 1] as const;

/**
 * Varian Animasi Standar (Mulus & Responsif)
 */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6, // Pergeseran sangat tipis (6px) agar tidak menyebabkan disorientasi visual
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2, // Durasi 200ms (sweet spot untuk pergeseran antarmuka)
      ease: EASING_CURVE,
    },
  },
  exit: {
    opacity: 0,
    y: -4, // Pergeseran keluar sangat halus jika dibungkus AnimatePresence
    transition: {
      duration: 0.15,
      ease: EASING_CURVE,
    },
  },
};

/**
 * Varian Khusus Aksesibilitas (Tanpa Pergeseran Y untuk Pengguna "Reduce Motion")
 */
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
  // Detector Preferensi Sistem OS (Aksesibilitas "Reduce Motion")
  const shouldReduceMotion = useReducedMotion();
  const activeVariants = shouldReduceMotion ? reducedMotionVariants : pageVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={activeVariants}
      style={{ willChange: 'transform, opacity' }} // ✨ Memaksa browser menyiapkan layer komposisi GPU
      className={`w-full transform-gpu ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};