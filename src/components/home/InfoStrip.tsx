'use client';

import { FileDown } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// UPDATE THIS when availability changes (also shown on the contact page).
const AVAILABILITY_TEXT = 'Available from 2025';

// UPDATE THIS when the headline stack changes.
const STACK_TEXT = 'TypeScript · Unity · C# · Next.js';

// UPDATE THIS when the positioning statement changes.
const POSITIONING_TEXT = 'I build game tools, AI systems, and the infrastructure connecting them.';

/** Green pulsing-dot availability pill — shared with the contact page. */
export function AvailabilityBadge() {
  return (
    <span className="inline-flex items-center gap-2 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-3 py-1 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
      {AVAILABILITY_TEXT}
    </span>
  );
}

/**
 * Recruiter-focused strip between the hero and the cards:
 * positioning statement, availability, stack, and CV download.
 *
 * Entrance is a plain CSS fadeInUp (Tailwind keyframes) rather than
 * Framer Motion so the home page doesn't pull the motion bundle in.
 */
export default function InfoStrip() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap ${
        prefersReducedMotion ? '' : 'opacity-0 animate-fadeInUp'
      }`}
      style={prefersReducedMotion ? undefined : { animationDelay: '1.8s' }}
    >
      <p className="text-sm text-gray-400">{POSITIONING_TEXT}</p>

      <div className="flex-1" aria-hidden="true" />

      <AvailabilityBadge />

      <span className="text-xs text-gray-500 whitespace-nowrap">{STACK_TEXT}</span>

      <a
        href="/downloads/Beer%20de%20Vreeze%20CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
      >
        <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
        Download CV
      </a>
    </div>
  );
}
