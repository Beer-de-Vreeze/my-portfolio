'use client'

import { useState, useEffect } from 'react';
import AboutCard from "../components/AboutCard";
import ProjectCard from "../components/ProjectCardMenu";
import ContactCard from "@/components/ContactCardMenu";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";

// Custom hook for window size with proper SSR handling
function useWindowSize() {
  // Initialize with undefined to handle SSR
  const [windowSize, setWindowSize] = useState({
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
  const router = useRouter();
  const { width } = useWindowSize();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
  };

  const cards = [
    <div key="about" onClick={() => handleNavigation('/about')} className="card-hover">
      <AboutCard />
    </div>,
    <div key="project" onClick={() => handleNavigation('/projects')} className="card-hover">
      <ProjectCard />
    </div>,
    <div key="contact" onClick={() => handleNavigation('/contact')} className="card-hover">
      <ContactCard />
    </div>,
  ];

  // Responsive breakpoints
  const isXSmall = width < 480;
  const isSmall = width >= 480 && width < 640;
  const isMedium = width >= 640 && width < 768;
  const isLarge = width >= 768 && width < 1024;
  const isXLarge = width >= 1024 && width < 1280;
  const isXXLarge = width >= 1280 && width < 1536;


  // Determine layout based on screen size
  const isMobile = isXSmall || isSmall || isMedium || isLarge;
  const isDesktop = !isMobile;

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  return (
    <main className={`${styles.container}`}>
      <div className={`${styles.headerContainer} ${isDesktop ? styles.headerContainerDesktop : styles.headerContainerMobile}`}>
        <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktop : styles.nameMobile}`}>
          Beer de Vreeze
        </h1>
        <h2 className={`${styles.title} ${isDesktop ? styles.titleDesktop : styles.titleMobile}`}>
          <span className="text-white">Dutch-based </span>
          {width < 900 && <br />}
          <span className="gradient-text" style={{ marginTop: '0.5rem' }}>Game Developer</span>
        </h2>
      </div>

      <div className={`${styles.cardsContainer} ${isDesktop ? styles.cardsContainerDesktop : styles.cardsContainerMobile}`}>
        {cards}
      </div>
    </main>
  );
}