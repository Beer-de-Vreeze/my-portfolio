import type React from 'react';

/**
 * Shared frosted-glass surface style for inline use where the `.glass`
 * utility class doesn't fit (e.g. inner card surfaces with a different
 * border radius). Values come from the design tokens in tokens.css so
 * there is a single source of truth.
 */
export const GLASS_SURFACE_STYLE: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
};
