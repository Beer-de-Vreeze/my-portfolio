'use client';

import { useEffect, useState } from 'react';

/**
 * Types out `text` one character at a time, once, with no loop.
 *
 * @param text  The full string to reveal.
 * @param speed Milliseconds per character (default 35).
 * @param delay Milliseconds before typing starts (default 800).
 * @returns The currently visible portion of `text`.
 *
 * Callers that need to respect prefers-reduced-motion should ignore the
 * returned value and render the full text directly when motion is reduced.
 */
export function useTypewriter(text: string, speed: number = 35, delay: number = 800): string {
  const [visibleCount, setVisibleCount] = useState(0);

  // Restart from zero when the inputs change. Adjusting state during render
  // (instead of in the effect) avoids painting a stale frame of the old text.
  const [prev, setPrev] = useState({ text, speed, delay });
  if (prev.text !== text || prev.speed !== speed || prev.delay !== delay) {
    setPrev({ text, speed, delay });
    setVisibleCount(0);
  }

  useEffect(() => {
    let count = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      count += 1;
      setVisibleCount(count);
      if (count < text.length) {
        timeout = setTimeout(tick, speed);
      }
    };

    timeout = setTimeout(tick, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return text.slice(0, visibleCount);
}
