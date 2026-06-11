'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and hydration, true afterwards.
 *
 * Hydration-safe replacement for the `useState` + `useEffect(setMounted)`
 * pattern: React renders the server snapshot (false) while hydrating, then
 * re-renders with the client snapshot (true) without an extra effect pass.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
