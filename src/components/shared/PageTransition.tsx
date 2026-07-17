// src/components/shared/PageTransition.tsx
import React from 'react';
import { motion, type Variants, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Class CSS opsional jika ingin menambahkan styling kustom pada wrapper */
  className?: string;
}

// ✨ Premium Fluid Curve (Emphasized Decelerate - Gabungan Vercel & Apple iOS)
const EASING_CURVE = [0.16, 1, 0.3, 1] as const;

/**
 * Varian Animasi Premium (Ultra-Smooth & Fluid)
 */
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,       // Pergeseran sedikit dinaikkan (10px) agar pergerakan kinetiknya terlihat anggun
    scale: 0.99, // 🔮 KUNCI: Efek mikro-skala menciptakan ilusi transisi lapis kedalaman yang halus
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35, // ⏱️ Sweet-spot baru (350ms) agar kurva akselerasi terlihat mengalir sempurna
      ease: EASING_CURVE,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,   // Mikro-skala mengecil halus saat halaman memudar keluar
    transition: {
      duration: 0.25,
      ease: EASING_CURVE,
    },
  },
};

/**
 * Varian Khusus Aksesibilitas (Fade Murni tanpa Pergeseran Fisik)
 */
const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.25 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
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
      style={{ willChange: 'transform, opacity' }} // Memaksa browser menyiapkan layer komposisi GPU
      className={`w-full transform-gpu ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
};