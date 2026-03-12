'use client';

import { useMemo, useEffect, useState } from 'react';
import styles from '@/styles/page.module.css';

interface StarfieldBackgroundProps {
  /** Multiply particle count by this factor (0–1). Default 1. */
  density?: number;
}

// Weighted star-type distribution — same as before but centralised once.
const WEIGHTED_TYPES = [
  'starTiny', 'starTiny', 'starTiny', 'starTiny', 'starTiny',
  'starWhite', 'starWhite', 'starWhite',
  'starSmall', 'starSmall', 'starSmall',
  'starCyan', 'starCyan',
  'starMedium', 'starMedium',
  'starLarge',
  'starXLarge',
] as const;

function getParticleCount(prefersReducedMotion: boolean, density: number): number {
  if (prefersReducedMotion) return 0;
  if (typeof window === 'undefined') return 0;
  const w = window.innerWidth;
  const low = typeof navigator !== 'undefined' && ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) < 4;
  let base: number;
  if (w < 768) base = low ? 8 : 15;
  else if (w < 1024) base = low ? 12 : 25;
  else base = low ? 20 : 50;
  return Math.round(base * density);
}

/**
 * Decorative starfield + background grid + nebula layers.
 * Intentionally skips SSR (imported with `dynamic({ ssr: false })`) so it
 * never contributes to server HTML and never causes hydration mismatches.
 */
export default function StarfieldBackground({ density = 1 }: StarfieldBackgroundProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const count = useMemo(
    () => getParticleCount(prefersReducedMotion, density),
    [prefersReducedMotion, density],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const starType = WEIGHTED_TYPES[i % WEIGHTED_TYPES.length];
        return (
          <div
            key={i}
            className={`${styles.particle} ${styles[starType]} ${styles[`particle${i + 1}`]}`}
            aria-hidden="true"
          />
        );
      }),
    [count],
  );

  return (
    <>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid} aria-hidden="true" />

      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust} aria-hidden="true" />

      {/* Star particles */}
      <div
        className={`${styles.particleContainer} ${prefersReducedMotion ? styles.reducedMotion : ''}`}
        aria-hidden="true"
      >
        {particles}
      </div>
    </>
  );
}
