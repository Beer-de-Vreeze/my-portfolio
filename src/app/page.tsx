'use client'

import { useState, useEffect } from 'react';
import AboutCard from "../components/AboutCard";
import ProjectCard from "../components/ProjectCardMenu";
import ContactCard from "@/components/ContactCardMenu";
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

export default function Home() {
  const { width } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cards = [
    <AboutCard key="about" />,
    <ProjectCard key="project" />,
    <ContactCard key="contact" />,
  ];
  // Responsive breakpoints
  const isXSmall = width !== undefined && width < 480;
  const isSmall = width !== undefined && width >= 480 && width < 640;
  const isMedium = width !== undefined && width >= 640 && width < 768;
  const isLarge = width !== undefined && width >= 768 && width < 1024;
  // These variables are declared but not used, keeping them for future use
  // const isXLarge = width !== undefined && width >= 1024 && width < 1280;
  // const isXXLarge = width !== undefined && width >= 1280 && width < 1536;


  // Determine layout based on screen size
  const isMobile = isXSmall || isSmall || isMedium || isLarge;
  const isDesktop = !isMobile;

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <div className={`${isDesktop ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col ${isDesktop ? styles.container : styles.containerScrollable} ${styles.enhancedBackground}`}>
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

      <main className={`flex-1 ${isDesktop ? 'overflow-y-auto' : ''} px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col`}>
        <div className={`${styles.headerContainer} ${isDesktop ? styles.headerContainerDesktop : styles.headerContainerMobile}`}>
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
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter}>z</span>
              <span className={styles.titleCharacter}>e</span>
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktop : styles.titleMobile}`}>
            <span className={styles.subtitleText}>Systems & Tools </span>
            {width !== undefined && width < 900 && <br />}
            <span className={`gradient-text ${styles.subtitleGradient}`}>Game Developer</span>
          </h2>
          
          {/* Floating accent elements */}
          <div className={styles.accentDots}>
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        </div>

        <div className={`${styles.cardsSection}`}>
          <div className={`${styles.cardsContainer} ${isDesktop ? styles.cardsContainerDesktop : styles.cardsContainerMobile}`}>
            {cards.map((card, index) => (
              <div 
                key={index} 
                className={`${styles.cardWrapper} ${styles.cardHover} ${styles[`cardDelay${index}`]}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}