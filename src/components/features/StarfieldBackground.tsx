'use client';

import { useMemo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
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

// [top%, left%] for each of the 50 particles — matches the former
// .particle1–.particle50 CSS classes exactly so the visual output is identical.
const PARTICLE_POSITIONS: [number, number][] = [
  [15, 8], [25, 85], [45, 15], [70, 75], [10, 60],
  [80, 25], [35, 92], [65, 5], [20, 40], [55, 55],
  [90, 45], [5, 20], [75, 10], [40, 70], [85, 80],
  [30, 35], [60, 90], [12, 75], [95, 15], [50, 3],
  [8, 45], [33, 88], [77, 52], [18, 12], [63, 78],
  [41, 25], [87, 67], [26, 58], [72, 8], [14, 82],
  [58, 38], [92, 73], [37, 18], [81, 93], [23, 48],
  [67, 13], [11, 63], [54, 83], [96, 28], [42, 6],
  [78, 48], [17, 73], [61, 23], [84, 88], [29, 53],
  [74, 18], [6, 38], [48, 78], [89, 43], [35, 8],
];

// [twinkle seconds, float seconds] per particle — also lifted from the old CSS.
const PARTICLE_DURATIONS: [number, number][] = [
  [4, 8], [3, 10], [5, 12], [3.5, 9], [4.5, 11],
  [2.8, 7], [3.2, 9.5], [4.8, 8.5], [3.7, 10.5], [5.2, 7.8],
  [2.9, 12.5], [4.1, 9.2], [3.6, 11.8], [5.5, 8.8], [2.7, 10.2],
  [4.3, 9.7], [3.4, 8.1], [5.1, 11.3], [3.8, 9.4], [4.6, 10.7],
  [2.5, 8.9], [5.3, 12.1], [3.1, 7.6], [4.9, 11.7], [2.3, 9.8],
  [5.7, 8.3], [3.9, 10.9], [4.2, 7.4], [2.8, 12.8], [5.4, 9.1],
  [3.3, 11.2], [4.7, 8.7], [2.6, 10.4], [5.8, 9.6], [3.5, 8.2],
  [4.4, 11.9], [2.9, 7.8], [5.2, 12.3], [3.7, 9.5], [4.8, 10.8],
  [2.4, 8.6], [5.6, 11.4], [3.2, 9.7], [4.5, 7.9], [2.7, 12.6],
  [5.9, 10.1], [3.4, 8.4], [4.1, 11.8], [2.2, 9.3], [5.5, 12.7],
];

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
  const prefersReducedMotion = usePrefersReducedMotion();

  const count = useMemo(
    () => getParticleCount(prefersReducedMotion, density),
    [prefersReducedMotion, density],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const starType = WEIGHTED_TYPES[i % WEIGHTED_TYPES.length];
        const [top, left] = PARTICLE_POSITIONS[i % PARTICLE_POSITIONS.length];
        const [twinkle, float] = PARTICLE_DURATIONS[i % PARTICLE_DURATIONS.length];
        return (
          <div
            key={i}
            className={`${styles.particle} ${styles[starType]} ${styles[`particleAnim${(i % 6) + 1}`]}`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              '--twinkle-duration': `${twinkle}s`,
              '--float-duration': `${float}s`,
            } as React.CSSProperties}
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
