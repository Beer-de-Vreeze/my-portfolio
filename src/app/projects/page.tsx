"use client";
import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";
import styles from "@/styles/page.module.css";
import AudioPreviever from "@/components/projects/AudioPreviever";
import BearlyStealthy from "@/components/projects/Bearly Stealthy";
import MLAgent from "@/components/projects/MLAgent";
import SketchinSpells from "@/components/projects/Sketchin Spells";
import Tetrtis from "@/components/projects/Tetrtis";
import Website from "@/components/projects/Website";
import LPCafe from "@/components/projects/LPCafe";

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
const ProjectsContent = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl animate-slideInUp">
    <AudioPreviever onModalStateChange={onModalStateChange} />
    <LPCafe onModalStateChange={onModalStateChange} />
    <MLAgent onModalStateChange={onModalStateChange} />
    <Website onModalStateChange={onModalStateChange} />
    <BearlyStealthy onModalStateChange={onModalStateChange} />
    <SketchinSpells onModalStateChange={onModalStateChange} />
    <Tetrtis onModalStateChange={onModalStateChange} />
  </div>
);

export default function Projects() {
  const { width } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

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

  // Handle modal state changes from the ProjectCard component
  const handleModalStateChange = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return (
      <div className={`min-h-screen flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`} style={{ overscrollBehavior: 'none' }}>
        {/* Animated background grid */}
        <div className={styles.backgroundGrid}></div>
        
        {/* Cosmic dust layer */}
        <div className={styles.cosmicDust}></div>
        
        {/* Enhanced Space Starfield - 50 stars */}
        <div className={styles.particleContainer}>
          {Array.from({ length: 50 }, (_, i) => (
            <div 
              key={i} 
              className={`${styles.particle} ${styles.starTiny} ${styles[`particle${i + 1}`]}`}
            ></div>
          ))}
        </div>

        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </div>

        <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col">
          {/* Enhanced header section with animated title */}
          <div className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
            <div className={styles.titleWrapper}>
              <h1 className={`${styles.name} ${styles.nameDesktop} ${styles.animatedTitle}`}>
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
              <div className={styles.titleUnderline}></div>
            </div>
            <h2 className={`${styles.subtitle} ${styles.titleDesktop}`}>
              <span className={styles.subtitleText}>Loading...</span>
            </h2>
          </div>

          <div className="w-full max-w-6xl mx-auto px-0 flex-1 flex items-center justify-center">
            <ProjectsLoading />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`} style={{ overscrollBehavior: 'none' }}>
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
        <Navbar />
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
              Explore my collection of {width !== undefined && width < 640 && <br />}
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
        <Footer />
      </div>
    </div>
  );
}
