'use client'
import { useState, useEffect, lazy, Suspense } from 'react';
import AboutCard from "../components/AboutCard";
import ContactCard from "@/components/ContactCardMenu";
import { PerformanceLoading } from "@/components/PerformanceLoading";
import { useResponsiveSize } from "@/components/utils/useScrolling";
import styles from "@/styles/page.module.css";

// Lazy load heavy components
const ProjectCard = lazy(() => import("../components/ProjectCardMenu"));

export default function Home() {
  const { isDesktop, isMobile } = useResponsiveSize();
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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

  const cards = [
    <AboutCard key="about" />,
    <Suspense key="project" fallback={<PerformanceLoading variant="card" size="lg" />}>
      <ProjectCard />
    </Suspense>,
    <ContactCard key="contact" />,
  ];

  // Calculate number of particles based on device performance
  const getParticleCount = () => {
    if (prefersReducedMotion) return 0;
    if (isMobile) return 20; // Reduced for mobile
    if (!isDesktop) return 30; // Medium for tablets
    return 50; // Full for desktop
  };

  const particleCount = getParticleCount();

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <main className={`${styles.container} ${isDesktop ? styles.containerDesktop : styles.containerMobile} max-w-7xl mx-auto`}>
      {/* Performance-optimized background particles */}
      <div className={`${styles.backgroundParticles} ${prefersReducedMotion ? styles.reducedMotion : ''}`} aria-hidden="true">
        {Array.from({ length: particleCount }, (_, i) => {
          const starType = i % 3 === 0 ? 'star' : i % 3 === 1 ? 'dot' : 'twinkle';
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

      <div className={`${styles.headerContainer} ${isDesktop ? styles.headerContainerDesktop : styles.headerContainerMobile} max-w-4xl mx-auto`}>
        <div className={styles.titleWrapper}>
          <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktop : styles.nameMobile} ${styles.animatedTitle}`}>
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
          <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
        </div>
        
        <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktop : styles.titleMobile}`}>
          <span className={styles.subtitleText}>Systems & Tools </span>
          {!isDesktop && <br />}
          <span className={`gradient-text ${styles.subtitleGradient} ${prefersReducedMotion ? styles.staticGradient : ''}`}>Game Developer</span>
        </h2>
        
        {/* Floating accent elements - only on desktop and if motion is allowed */}
        {isDesktop && !prefersReducedMotion && (
          <div className={styles.accentDots}>
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        )}
      </div>

      <div className={`${styles.cardsSection} max-w-5xl mx-auto w-full`}>
        <div className={`${styles.cardsContainer} ${isDesktop ? styles.cardsContainerDesktop : styles.cardsContainerMobile}`}>
          {cards.map((card, index) => (
            <div 
              key={index} 
              className={`${styles.cardWrapper} ${!prefersReducedMotion ? styles.cardHover : ''} ${!prefersReducedMotion ? styles[`cardDelay${index}`] : ''}`}
              style={{ 
                animationDelay: !prefersReducedMotion ? `${index * 150}ms` : '0ms',
                contain: 'layout style paint'
              }}
            >
              {card}
            </div>
          ))}
        </div>
        
        {/* Hidden Konami Code Easter Egg Hint - only show on desktop */}
        {isDesktop && (
          <div className={styles.konamiHint}>
            Secret Code: ↑↑↓↓←→←→BA
          </div>
        )}
      </div>
    </main>
  );
}