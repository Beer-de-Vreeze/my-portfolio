'use client';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// UPDATE THESE WHEN THINGS CHANGE
const CURRENT_WORK = [
  'Internship at ASAPCLOUD — Data & AI team',
  'MCP server development in TypeScript',
  'Finishing degree at GLU — graduating 2025',
];

/**
 * One-line "Currently:" status strip below the InfoStrip on the home page.
 * Entrance is a plain CSS fadeInUp (Tailwind keyframes) rather than
 * Framer Motion so the home page doesn't pull the motion bundle in.
 */
export default function CurrentlyWorking() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 flex items-center gap-3 ${
        prefersReducedMotion ? '' : 'opacity-0 animate-fadeInUp'
      }`}
      style={prefersReducedMotion ? undefined : { animationDelay: '2.2s' }}
    >
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" aria-hidden="true" />
      <p className="min-w-0">
        <span className="text-xs text-gray-500 font-medium">Currently: </span>
        <span className="text-xs text-gray-400">{CURRENT_WORK.join(' · ')}</span>
      </p>
    </div>
  );
}
