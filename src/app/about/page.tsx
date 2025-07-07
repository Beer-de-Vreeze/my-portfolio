'use client';

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/about/ProfileCard";
import Stack from "@/components/about/Stack";
import styles from "@/styles/page.module.css";

// Custom hook for window size with proper SSR handling
function useWindowSize() {
  // Initialize with undefined to handle SSR
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

export default function About() {
  const { width } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Responsive breakpoints
  const isXSmall = width !== undefined && width < 480;
  const isSmall = width !== undefined && width >= 480 && width < 640;
  const isMedium = width !== undefined && width >= 640 && width < 768;
  const isLarge = width !== undefined && width >= 768 && width < 1024;

  // Determine layout based on screen size
  const isMobile = isXSmall || isSmall || isMedium || isLarge;
  const isDesktop = !isMobile;

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`} style={{ minHeight: width !== undefined && width < 768 ? 'auto' : '100vh' }}>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid}></div>
      
      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust}></div>
      
      {/* Enhanced Space Starfield - 50 stars */}
      <div className={styles.particleContainer}>
        {Array.from({ length: 50 }, (_, i) => {
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
            ></div>
          );
        })}
      </div>

      <Navbar />
      
      <main className={`flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 lg:pb-24 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col ${isMobile ? 'min-h-0' : ''}`}>
        {/* Enhanced header section with animated title - smaller and more compact */}
        <div className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              <span className={styles.titleCharacter}>A</span>
              <span className={styles.titleCharacter}>b</span>
              <span className={styles.titleCharacter}>o</span>
              <span className={styles.titleCharacter}>u</span>
              <span className={styles.titleCharacter}>t</span>
              <span className={styles.titleCharacter}>&nbsp;</span>
              <span className={styles.titleCharacter}>M</span>
              <span className={styles.titleCharacter}>e</span>
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>
              Dive into my skills, journey, and {width !== undefined && width < 640 && <br />}
              what makes me tick as a creator
            </span>
          </h2>
          
          {/* Floating accent elements */}
          <div className={styles.accentDots}>
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        </div>

        <div className={`w-full max-w-6xl mx-auto px-0 flex-1 flex items-center ${isMobile ? 'items-start pt-4' : ''}`}>
          <div className={`flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-12 relative w-full mb-8 sm:mb-0 ${isMobile ? 'min-h-0' : ''}`}>
            <div className="lg:col-span-2 lg:h-full order-1 lg:order-1 w-full">
              <div className="h-full flex flex-col justify-between animate-profileSlideIn w-full">
                <ProfileCard />
              </div>
            </div>
            <div className="lg:col-span-2 lg:flex lg:flex-col lg:gap-4 order-2 lg:order-2 w-full">
              <Stack />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
