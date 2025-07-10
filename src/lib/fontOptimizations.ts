import { NextFontWithVariable } from 'next/dist/compiled/@next/font';

// Optimized font loading with preload and display swap
export const fontOptimizations = {
  preload: true,
  display: 'swap' as const,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
};

// Utility to generate font CSS with performance optimizations
export function generateOptimizedFontCSS(font: NextFontWithVariable, selector: string = 'html') {
  return `
    ${selector} {
      font-family: ${font.style.fontFamily};
      font-optical-sizing: auto;
      text-rendering: optimizeSpeed;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Reduce layout shift with font-display: swap */
    @font-face {
      font-display: swap;
    }
    
    /* Optimize for Core Web Vitals */
    * {
      font-synthesis: none;
    }
  `;
}

// Critical CSS for immediate font rendering
export const criticalFontCSS = `
  /* Immediate font rendering to reduce CLS */
  html {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  /* Optimize text rendering */
  body {
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Prevent invisible text during font swap */
  .font-loading {
    font-display: swap;
  }
`;
