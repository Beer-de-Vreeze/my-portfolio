'use client';

import { useState, useEffect } from 'react';

/**
 * Converts plain URLs, www-domains and email addresses in a string into
 * clickable `<a>` HTML tags.  Safe to use with `dangerouslySetInnerHTML`
 * because it only wraps already-present textual links.
 */
export const makeLinksClickable = (text: string): string => {
  const urlPatterns = [
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /(?<![/\w])(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  ];

  let processedText = text;

  processedText = processedText.replace(urlPatterns[0], (match) => {
    return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  processedText = processedText.replace(urlPatterns[1], (match) => {
    return `<a href="mailto:${match}">${match}</a>`;
  });

  processedText = processedText.replace(urlPatterns[2], (match) => {
    return `<a href="https://${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  return processedText;
};

/** Returns `true` on mobile devices / narrow viewports (≤ 768 px). */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      const userAgent =
        navigator.userAgent ||
        navigator.vendor ||
        (window as Window & { opera?: string }).opera ||
        '';
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth <= 768);
    };

    checkMobile();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
