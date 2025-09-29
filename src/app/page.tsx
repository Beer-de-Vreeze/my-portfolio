'use client'
import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import AboutCard from "../components/cards/AboutCard";
import ContactCard from "@/components/forms/ContactCardMenu";
import { PerformanceLoading } from "@/components/performance/PerformanceLoading";
import { useResponsiveSize } from "@/components/utils/useScrolling";
import { usePerformanceMonitor } from "@/components/performance/WebVitals";
import { usePerformance } from "@/hooks/usePerformance";
import { ResourcePreloader } from "@/lib/performanceUtils";
import styles from "@/styles/page.module.css";

// Lazy load heavy components with error boundaries
const ProjectCard = lazy(() => 
  import("../components/features/ProjectCardMenu").catch(err => {
    console.warn('Failed to load ProjectCard:', err);
    return { default: () => <div>Failed to load project card</div> };
  })
);

export default function Home() {
  const { isDesktop } = useResponsiveSize();
  const { shouldReduceMotion, isLowMemory } = usePerformance();
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Enable performance monitoring
  // usePerformanceMonitor();

  // Preload critical resources
  useEffect(() => {
    const preloader = ResourcePreloader.getInstance();
    
    // Preload critical images
    preloader.preloadImages([
      '/images/Beer.webp',
      '/favicon/favicon-32x32.png'
    ]);
  }, []);

  // Optimize card creation with memoization
  const cards = useMemo(() => [
    <AboutCard key="about" />,
    <Suspense key="project" fallback={<PerformanceLoading variant="card" size="lg" />}>
      <ProjectCard />
    </Suspense>,
    <ContactCard key="contact" />,
  ], []);

  // Handle hydration and reduced motion
  useEffect(() => {
    setIsMounted(true);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleReducedMotionChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => mediaQuery.removeEventListener('change', handleReducedMotionChange);
  }, []); // Empty dependency array to prevent infinite re-renders

  // One-time overflow control based on screen size - only runs once after mount
  useEffect(() => {
    if (isMounted) {
      const width = window.innerWidth;
      
      // Apply overflow control based on screen size, but only once
      if (width >= 1024 && width <= 1439) {
        // Laptops: disable scrolling
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
      } else if (width >= 1440) {
        // Large desktops: disable scrolling for main page
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
      } else {
        // Mobile/tablet: ensure scrolling is enabled
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

  // Calculate number of particles based on device performance and screen size
  // Memoize the particle count to avoid recalculating on every render
  const currentParticleCount = useMemo(() => {
    if (prefersReducedMotion || shouldReduceMotion()) return 0;
    if (typeof window === 'undefined') return 50;
    
    // Get screen width for device detection
    const width = window.innerWidth;
    
    // Check for performance constraints
    const hasPerformanceConstraints = isLowMemory() || prefersReducedMotion || shouldReduceMotion();
    
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
  }, [prefersReducedMotion, shouldReduceMotion, isLowMemory, isMounted]);

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <div className={`${styles.containerScrollable} ${styles.enhancedBackground} max-w-7xl mx-auto`}>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid}></div>
      
      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust}></div>
      
      {/* Enhanced Space Starfield - Performance-optimized background particles */}
      <div className={`${styles.particleContainer} ${prefersReducedMotion ? styles.reducedMotion : ''}`} aria-hidden="true">
        {Array.from({ length: currentParticleCount }, (_, i) => {
          // Create a more natural distribution with more tiny/small stars (same as other pages)
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

      <main className="relative z-10 w-full flex flex-col" id="main-content">
        <header className={`${styles.headerContainer} ${isDesktop ? styles.headerContainerDesktop : styles.headerContainerMobile} max-w-4xl mx-auto`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktop : styles.nameMobile} ${styles.animatedTitle}`} id="page-title">
              <span className={styles.titleCharacter}>B</span>
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter}>r</span>
              <span className={styles.titleCharacter}>&nbsp;</span>
              <span className={styles.titleCharacter}>d</span>
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter}>&nbsp;</span>
              <span className={styles.titleCharacter}>V</span>
              <span className={styles.titleCharacter}>r</span>
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter} data-easter-egg="↑↑↓↓←→←→BA" title="🎮">e</span>
              <span className={styles.titleCharacter}>z</span>
              <span className={styles.titleCharacter}>e</span>
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`} aria-hidden="true"></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktop : styles.titleMobile}`}>
            <span className={styles.subtitleText}>
              <span className="sr-only">Welcome to the portfolio of </span>
              Systems & Tools 
            </span>
            {!isDesktop && <br />}
            <span className={`gradient-text ${styles.subtitleGradient} ${prefersReducedMotion ? styles.staticGradient : ''}`}>Game Developer</span>
            <span className="sr-only"> specializing in Unity, C#, and AI technologies</span>
          </h2>
          
          {/* Floating accent elements - only on desktop and if motion is allowed - decorative only */}
          {isDesktop && !prefersReducedMotion && (
            <div className={styles.accentDots} aria-hidden="true">
              <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
              <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
              <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
            </div>
          )}
        </header>

        <section className={`${styles.cardsSection} max-w-5xl mx-auto w-full`} aria-label="Portfolio sections">
          <h2 className="sr-only">Explore my work</h2>
          <div className={`${styles.cardsContainer} ${isDesktop ? styles.cardsContainerDesktop : styles.cardsContainerMobile}`} role="group" aria-label="Portfolio navigation cards">
            {cards.map((card, index) => (
              <div 
                key={index} 
                className={`${styles.cardWrapper} ${!prefersReducedMotion ? styles.cardHover : ''} ${!prefersReducedMotion ? styles[`cardDelay${index}`] : ''}`}
                style={{ 
                  animationDelay: !prefersReducedMotion ? `${index * 150}ms` : '0ms',
                  contain: 'layout style paint'
                }}
                role="listitem"
              >
                {card}
              </div>
            ))}
          </div>
          
          {/* Hidden Konami Code Easter Egg Hint - only show on desktop - decorative */}
          {isDesktop && (
            <div className={styles.konamiHint} aria-hidden="true">
              <span className="sr-only">Developer easter egg: </span>Secret Code: ↑↑↓↓←→←→BA
            </div>
          )}
        </section>
      </main>
    </div>
  );
}