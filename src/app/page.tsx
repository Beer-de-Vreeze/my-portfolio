'use client'
import { useState, useEffect } from 'react';
import AboutCard from "../components/AboutCard";
import ProjectCard from "../components/ProjectCardMenu";
import ContactCard from "@/components/ContactCardMenu";
import { useResponsiveSize } from "@/components/utils/useScrolling";
import styles from "@/styles/page.module.css";

export default function Home() {
  const { isDesktop } = useResponsiveSize();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
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
    <ProjectCard key="project" />,
    <ContactCard key="contact" />,
  ];

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <main className={`${styles.container} ${styles.enhancedBackground}`}>
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
          <span className={`gradient-text ${styles.subtitleGradient}`}>Game Developer</span>
        </h2>
        
        {/* Floating accent elements */}
        <div className={styles.accentDots}>
          <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
          <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
          <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
        </div>
      </div>

      <div className={`${styles.cardsSection} max-w-5xl mx-auto w-full`}>
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
        
        {/* Hidden Konami Code Easter Egg Hint */}
        <div className={styles.konamiHint}>
          Secret Code: ↑↑↓↓←→←→BA
        </div>
      </div>
    </main>
  );
}