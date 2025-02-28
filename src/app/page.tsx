'use client'

import { useState, useEffect } from 'react';
import AboutCard from "../components/AboutCard";
import ProjectCard from "../components/ProjectCardMenu";
import ContactCard from "@/components/ContactCardMenu";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 1024, // Default to desktop size for server rendering
    height: 768,
  });

  useEffect(() => {
    // Mark as hydrated
    setHydrated(true);
    
    // Set actual window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    // Handle window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path: string) => {
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

  // Calculate dynamic font size based on window width (only apply after hydration)
  const nameSize = hydrated ? 
                   (windowSize.width < 640 ? '2.5rem' : 
                   windowSize.width < 768 ? '3.5rem' : 
                   windowSize.width < 1024 ? '4.75rem' : '6rem')
                   : '6rem'; // Default for server rendering
  
  const titleSize = hydrated ?
                    (windowSize.width < 640 ? '1.25rem' :
                    windowSize.width < 768 ? '1.6rem' :
                    windowSize.width < 1024 ? '2.2rem' : '2.65rem')
                    : '2.65rem'; // Default for server rendering
                    
  // Set breakpoint for mobile/desktop view
  const mobileView = hydrated && windowSize.width < 1300;

  // For SSR, these are the defaults
  const desktopView = !hydrated || !mobileView;

  return (
    <main className={styles.container}>
      <div className={`${styles.headerContainer} ${desktopView ? styles.headerContainerDesktop : ''}`}>
        <h1 className={`${styles.name} ${desktopView ? styles.nameDesktop : styles.nameMobile}`}
            style={{ fontSize: nameSize }}>
          Beer de Vreeze
        </h1>
        <h2 className={`${styles.title} ${desktopView ? styles.titleDesktop : styles.titleMobile}`}
            style={{ fontSize: titleSize }}>
          <span className="text-white">Netherlands-based</span>
          {/* During SSR or when desktop, use a space. After hydration on mobile, use a <br> */}
          {hydrated && windowSize.width < 900 ? <br /> : ' '}
          <span className="gradient-text">
            Game Developer
          </span>
        </h2>
      </div>

      {/* Desktop View */}
      <div className={!mobileView ? `${styles.cardsContainer} ${styles.cardsContainerDesktop}` : "hidden"}>
        {cards}
      </div>

      {/* Mobile View */}
      <div className={mobileView ? `${styles.cardsContainer} ${styles.cardsContainerMobile}` : "hidden"}>
        {cards}
      </div>
    </main>
  );
}