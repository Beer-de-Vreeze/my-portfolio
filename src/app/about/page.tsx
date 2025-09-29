'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProfileCard from "@/components/about/ProfileCard";
import Stack from "@/components/about/Stack";
import PersonStructuredData from "@/components/seo/PersonStructuredData";
import { useResponsiveSize } from "@/components/utils/useScrolling";
import { usePerformanceMonitor } from "@/components/performance/WebVitals";
import { usePerformance } from "@/hooks/usePerformance";
import { ResourcePreloader } from "@/lib/performanceUtils";
import styles from "@/styles/page.module.css";

export default function About() {
  const { isMobile, isDesktop } = useResponsiveSize();
  const { isLowMemory } = usePerformance();
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Enable performance monitoring
  usePerformanceMonitor();

  // Preload critical resources
  useEffect(() => {
    const preloader = ResourcePreloader.getInstance();
    
    // Preload critical images for about page
    preloader.preloadImages([
      '/images/Beer.webp',
      '/favicon/favicon-32x32.png'
    ]);
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

  // Optimize particle count based on performance and device type
  const particleCount = useMemo(() => {
    if (prefersReducedMotion || !isMounted) return 0;
    
    // Adaptive particle count based on device capability
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      
      // Check for performance constraints
      const hasPerformanceConstraints = isLowMemory() || prefersReducedMotion;
      
      // Mobile devices (phones) - very low particle count
      if (width < 768) {
        return hasPerformanceConstraints ? 8 : 15;
      }
      
      // Tablet devices - moderate particle count
      if (width < 1024) {
        return hasPerformanceConstraints ? 12 : 25;
      }
      
      // Desktop devices - full particle count
      return hasPerformanceConstraints ? 20 : 50;
    }
    return 50;
  }, [prefersReducedMotion, isMounted, isLowMemory]);

  // One-time setup to ensure scrolling is always enabled for about page
  useEffect(() => {
    if (isMounted) {
      // Always ensure scrolling is enabled for the about page - no overflow restrictions
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      
      return () => {
        // No cleanup needed since we're only removing restrictions
      };
    }
  }, [isMounted]); // Only depends on isMounted, not window size changes

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`} style={{ overflow: 'visible' }}>
      {/* Structured Data for SEO */}
      <PersonStructuredData 
        location="Beusichem, Netherlands"
      />
      
      {/* Animated background grid */}
      <div className={styles.backgroundGrid}></div>
      
      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust}></div>
      
      {/* Enhanced Space Starfield - Performance optimized */}
      <div className={`${styles.particleContainer} ${prefersReducedMotion ? styles.reducedMotion : ''}`} aria-hidden="true">
        {Array.from({ length: particleCount }, (_, i) => {
          // Create a more natural distribution with more tiny/small stars
          const weightedTypes = [
            'starTiny', 'starTiny', 'starTiny', 'starTiny', 'starTiny',
            'starWhite', 'starWhite', 'starWhite',
            'starSmall', 'starSmall', 'starSmall',
            'starCyan', 'starCyan',
            'starMedium', 'starMedium',
            'starLarge',
            'starXLarge'
          ];
          const starType = weightedTypes[i % weightedTypes.length];
          return (
            <div 
              key={i} 
              className={`${styles.particle} ${styles[starType]} ${styles[`particle${i + 1}`]}`}
              style={{ 
                willChange: prefersReducedMotion ? 'auto' : 'transform, opacity',
                contain: 'layout style paint'
              }}
            ></div>
          );
        })}
      </div>

      <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 lg:pb-24 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col" id="main-content">
        {/* Enhanced header section with animated title - smaller and more compact */}
        <header className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`} id="page-title">
              <span className={styles.titleCharacter}>A</span>
              <span className={styles.titleCharacter}>b</span>
              <span className={styles.titleCharacter}>o</span>
              <span className={styles.titleCharacter}>u</span>
              <span className={styles.titleCharacter}>t</span>
              <span className={styles.titleCharacter}>&nbsp;</span>
              <span className={styles.titleCharacter}>M</span>
              <span className={styles.titleCharacter}>e</span>
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`} aria-hidden="true"></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>
              Dive into my skills, journey, and {isMobile && <br />}
              what makes me tick as a creator
            </span>
          </h2>
          
          {/* Floating accent elements - decorative only */}
          <div className={styles.accentDots} aria-hidden="true">
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        </header>

        <section className="w-full max-w-6xl mx-auto px-0 flex-1 flex items-center" aria-label="About me content">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-12 relative w-full mb-8 sm:mb-0">
            <div className="lg:col-span-2 lg:h-full order-1 lg:order-1 w-full">
              <div className="h-full flex flex-col justify-between animate-profileSlideIn w-full">
                <ProfileCard />
              </div>
            </div>
            <div className="lg:col-span-2 lg:flex lg:flex-col lg:gap-4 order-2 lg:order-2 w-full">
              <Stack />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
