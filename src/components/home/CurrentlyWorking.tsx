'use client';

import { motion, useReducedMotion } from 'framer-motion';

// UPDATE THESE WHEN THINGS CHANGE
const CURRENT_WORK = [
  'Internship at ASAPCLOUD — Data & AI team',
  'MCP server development in TypeScript',
  'Finishing degree at GLU — graduating 2025',
];

/** One-line "Currently:" status strip below the InfoStrip on the home page. */
export default function CurrentlyWorking() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4 flex items-center gap-3"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 2.2 }}
    >
      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" aria-hidden="true" />
      <p className="min-w-0">
        <span className="text-xs text-gray-500 font-medium">Currently: </span>
        <span className="text-xs text-gray-400">{CURRENT_WORK.join(' · ')}</span>
      </p>
    </motion.div>
  );
}
