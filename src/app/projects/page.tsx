"use client";
import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useModal } from "@/context/ModalContext";
import { usePerformanceMonitor } from "@/components/performance/WebVitals";
import { usePerformance } from "@/hooks/usePerformance";
import { ResourcePreloader, MemoryManager } from "@/lib/performanceUtils";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";
import styles from "@/styles/page.module.css";
import { useResponsiveSize } from "@/components/utils/useScrolling";

// Dynamic imports for better code splitting and performance
const AudioPreviewer = React.lazy(() => import("@/components/projects/AudioPreviever"));
const BearlyStealthy = React.lazy(() => import("@/components/projects/Bearly Stealthy"));
const MLAgent = React.lazy(() => import("@/components/projects/MLAgent"));
const SketchinSpells = React.lazy(() => import("@/components/projects/Sketchin Spells"));
const Tetrtis = React.lazy(() => import("@/components/projects/Tetrtis"));
const Website = React.lazy(() => import("@/components/projects/Website"));
const LPCafe = React.lazy(() => import("@/components/projects/LPCafe"));
const ProjectsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
        <div className="text-gray-400">{i === 3 ? 'Loading projects... (Tip: ↑↑↓↓←→←→BA)' : 'Loading project...'}</div>
      </div>
    ))}
  </div>
);

// Projects content component that uses lazy loading
const ProjectsContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl animate-slideInUp">
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <LPCafe />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <AudioPreviewer />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <MLAgent />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <Website />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <BearlyStealthy />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <SketchinSpells />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <Tetrtis />
      </Suspense>
    </div>
  );
};

export default function Projects() {
  const { isMobile, isDesktop } = useResponsiveSize();
  const { isLowMemory } = usePerformance();
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { isModalOpen } = useModal();
  
  // Enable performance monitoring
  usePerformanceMonitor();

  // Preload critical resources for projects page
  useEffect(() => {
    const preloader = ResourcePreloader.getInstance();
    
    // Preload critical project images
    preloader.preloadImages([
      '/images/AudioPreviewer 1.webp',
      '/images/GLU.webp',
      '/images/CoverImageSound.webp'
    ]);

    // Monitor memory usage for projects page (image-heavy)
    const interval = setInterval(() => {
      MemoryManager.checkMemoryUsage();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle reduced motion preference
  const handleReducedMotionChange = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => mediaQuery.removeEventListener('change', handleReducedMotionChange);
  }, [handleReducedMotionChange]);

  // Optimize particle count for projects page with mobile/tablet considerations
  const particleCount = useMemo(() => {
    if (prefersReducedMotion || !isMounted) return 0;
    
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // Check for performance constraints
      const hasPerformanceConstraints = isLowMemory() || prefersReducedMotion;
      
      // Mobile devices (phones) - very low particle count due to heavy project content
      if (width < 768) {
        return hasPerformanceConstraints ? 5 : 12;
      }
      
      // Tablet devices - moderate particle count
      if (width < 1024) {
        return hasPerformanceConstraints ? 8 : 18;
      }
      
      // Desktop devices - reduced particle count for better performance with heavy content
      return hasPerformanceConstraints ? 15 : 35;
    }
    return 35;
  }, [prefersReducedMotion, isMounted, isLowMemory]);

  // One-time overflow control based on screen size - only runs once after mount
  useEffect(() => {
    if (isMounted) {
      const width = window.innerWidth;

      // Only disable scrolling on very large desktops (1440px+) where content fits
      if (width >= 1440) {
        document.documentElement.classList.add("no-scroll");
        document.body.classList.add("no-scroll");
      } else {
        // For all other devices, ensure scrolling is enabled
        document.documentElement.classList.remove("no-scroll");
        document.body.classList.remove("no-scroll");
      }

      // Cleanup function to restore scrolling when component unmounts
      return () => {
        document.documentElement.classList.remove("no-scroll");
        document.body.classList.remove("no-scroll");
      };
    }
  }, [isMounted]); // Only depends on isMounted, not window size changes

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`}>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid}></div>

      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust}></div>

      {/* Enhanced Space Starfield - Adaptive particle count */}
      <div className={styles.particleContainer}>
        {Array.from({ length: particleCount }, (_, i) => {
          // Create a more natural distribution with more tiny/small stars
          const weightedTypes = [
            "starTiny",
            "starTiny",
            "starTiny",
            "starTiny",
            "starTiny",
            "starWhite",
            "starWhite",
            "starWhite",
            "starSmall",
            "starSmall",
            "starSmall",
            "starCyan",
            "starCyan",
            "starMedium",
            "starMedium",
            "starLarge",
            "starXLarge",
          ];
          const starType = weightedTypes[i % weightedTypes.length];
          return (
            <div
              key={i}
              className={`${styles.particle} ${styles[starType]} ${styles[`particle${i + 1}`]}`}
            ></div>
          );
        })}
      </div>

      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
          isModalOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
      </div>

      <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col">
        {/* Enhanced header section with animated title */}
        <div className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              <span className={styles.titleCharacter}>M</span>
              <span className={styles.titleCharacter}>y</span>
              <span className={styles.titleCharacter}>&nbsp;</span>
              <span className={styles.titleCharacter}>P</span>
              <span className={styles.titleCharacter}>r</span>
              <span className={styles.titleCharacter}>o</span>
              <span className={styles.titleCharacter}>j</span>
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter}>c</span>
              <span className={styles.titleCharacter}>t</span>
              <span className={styles.titleCharacter}>s</span>
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>
              Explore my collection of {isMobile && <br />}
              <span>games, tools, and creative works</span>
            </span>
          </h2>
          
          {/* Floating accent elements */}
          <div className={styles.accentDots}>
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto px-0">
          <div className="w-full">
            <Suspense fallback={<ProjectsLoading />}>
              <ProjectsContent />
            </Suspense>
          </div>
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 w-full z-40 transition-all duration-500 ease-out ${
          isModalOpen ? "opacity-0 translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
      </div>
    </div>
  );
}
