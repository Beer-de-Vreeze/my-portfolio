"use client";
import { useState, useEffect, Suspense } from "react";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";
import styles from "@/styles/page.module.css";
import { useResponsiveSize } from "@/components/utils/useScrolling";
import AudioPreviever from "@/components/projects/AudioPreviever";
import BearlyStealthy from "@/components/projects/Bearly Stealthy";
import MLAgent from "@/components/projects/MLAgent";
import SketchinSpells from "@/components/projects/Sketchin Spells";
import Tetrtis from "@/components/projects/Tetrtis";
import Website from "@/components/projects/Website";
import LPCafe from "@/components/projects/LPCafe";

// Loading component for the projects grid
const ProjectsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
        <div className="text-gray-400">Loading project...</div>
      </div>
    ))}
  </div>
);

// Projects content component that uses useSearchParams
const ProjectsContent = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl animate-slideInUp">
    <AudioPreviever />
    <LPCafe />
    <MLAgent />
    <Website />
    <BearlyStealthy />
    <SketchinSpells />
    <Tetrtis />
  </div>
);

export default function Projects() {
  const { isMobile, isDesktop } = useResponsiveSize();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // One-time overflow control based on screen size - only runs once after mount
  useEffect(() => {
    if (isMounted) {
      const width = window.innerWidth;
      
      // Only disable scrolling on very large desktops (1440px+) where content fits
      if (width >= 1440) {
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
      } else {
        // For all other devices, ensure scrolling is enabled
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
      }
      
      // Cleanup function to restore scrolling when component unmounts
      return () => {
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
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

      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
          isAnyModalOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
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
              <ProjectsContent onModalStateChange={handleModalStateChange} />
            </Suspense>
          </div>
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 w-full z-40 transition-all duration-500 ease-out ${
          isAnyModalOpen ? "opacity-0 translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
      </div>
    </div>
  );
}
