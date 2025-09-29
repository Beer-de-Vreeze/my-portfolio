"use client";
import React, { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { useModal } from "@/context/ModalContext";
import { usePerformanceMonitor } from "@/components/performance/WebVitals";
import { usePerformance } from "@/hooks/usePerformance";
import { ResourcePreloader, MemoryManager } from "@/lib/performanceUtils";
import ProjectStructuredData from "@/components/seo/ProjectStructuredData";
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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl" role="status" aria-label="Loading projects">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse flex items-center justify-center backdrop-blur-sm border border-gray-700/50" role="progressbar" aria-label={`Loading project ${i + 1}`}>
        <div className="text-gray-400" aria-live="polite">
          {i === 3 ? 'Loading projects... (Tip: ↑↑↓↓←→←→BA)' : 'Loading project...'}
        </div>
      </div>
    ))}
  </div>
);

// Projects content component that uses lazy loading
const ProjectsContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl animate-slideInUp" role="list" aria-label="My projects">
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <AudioPreviewer />
        </div>
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <LPCafe />
        </div>
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <MLAgent />
        </div>
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <Website />
        </div>
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <BearlyStealthy />
        </div>
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <SketchinSpells />
        </div>
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse" role="status" aria-label="Loading project"></div>}>
        <div role="listitem">
          <Tetrtis />
        </div>
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

  // Project data for structured data
  const projectsData = useMemo(() => [
    {
      name: "Audio Previewer",
      description: "Unity tool for real-time audio preview and processing with advanced sound manipulation capabilities.",
      image: "/images/AudioPreviewer 1.webp",
      dateCreated: "2023-06-01",
      programmingLanguage: ["C#", "Unity"],
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, Mac, Linux"
    },
    {
      name: "LP Cafe",
      description: "Interactive dialogue system and character AI for narrative-driven gaming experiences.",
      image: "/images/LPCafe Images/Cafe.webp", 
      dateCreated: "2023-08-15",
      programmingLanguage: ["C#", "Unity"],
      applicationCategory: "GameApplication"
    },
    {
      name: "ML Agent",
      description: "Machine learning-powered AI agent system for intelligent game character behavior and decision making.",
      image: "/images/AI Images/Title.webp",
      dateCreated: "2023-10-20",
      programmingLanguage: ["C#", "Python"],
      applicationCategory: "GameApplication"
    },
    {
      name: "Portfolio Website",
      description: "Modern, responsive portfolio website built with Next.js, featuring advanced performance optimizations and accessibility.",
      image: "/images/Website Images/Web1.webp",
      url: "https://beerdevreeze.com",
      dateCreated: "2024-01-10",
      programmingLanguage: ["TypeScript", "React", "Next.js"],
      applicationCategory: "WebApplication"
    },
    {
      name: "Bearly Stealthy",
      description: "Stealth-based puzzle game featuring dynamic AI behavior and environmental interaction systems.",
      image: "/images/Bearly Stealth Images/Bear.webp",
      dateCreated: "2023-04-12",
      programmingLanguage: ["C#", "Unity"],
      applicationCategory: "GameApplication"
    },
    {
      name: "Sketchin Spells",
      description: "Creative spell-crafting game with intuitive drawing mechanics and magical particle systems.", 
      image: "/images/Sketchin Spells Images/SketchinSpellsImage.webp",
      dateCreated: "2023-07-08",
      programmingLanguage: ["C#", "Unity"],
      applicationCategory: "GameApplication"
    },
    {
      name: "Tetrtis",
      description: "Modern take on the classic puzzle game with enhanced visuals and smooth gameplay mechanics.",
      image: "/images/Tetris Images/Tetris.webp",
      dateCreated: "2023-02-28",
      programmingLanguage: ["C#", "Unity"],
      applicationCategory: "GameApplication"
    }
  ], []);

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
      {/* Structured Data for SEO */}
      <ProjectStructuredData projects={projectsData} />
      
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

      <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col" id="main-content">
        {/* Enhanced header section with animated title */}
        <header className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`} id="page-title">
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
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`} aria-hidden="true"></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>
              Explore my collection of {isMobile && <br />}
              <span>games, tools, and creative works</span>
            </span>
          </h2>
          
          {/* Floating accent elements - decorative only */}
          <div className={styles.accentDots} aria-hidden="true">
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        </header>

        <section className="w-full max-w-6xl mx-auto px-0" aria-label="Project gallery">
          <div className="w-full">
            <Suspense fallback={<ProjectsLoading />}>
              <ProjectsContent />
            </Suspense>
          </div>
        </section>
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
