'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import ProfileCard from "@/components/about/ProfileCard";
import Stack from "@/components/about/Stack";
import { useResponsiveSize } from "@/hooks/useScrolling";
import { usePageSetup } from "@/hooks/usePageSetup";
import styles from "@/styles/page.module.css";

const StarfieldBackground = dynamic(() => import('@/components/features/StarfieldBackground'), { ssr: false });

export default function About() {
  const { isMobile, isDesktop } = useResponsiveSize();
  usePageSetup({ scrollMode: 'always-on' });

  return (
    <div className={`min-h-screen flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`} style={{ overflow: 'visible' }}>
      <StarfieldBackground />

      <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 lg:pb-24 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col">
        {/* Enhanced header section with animated title - smaller and more compact */}
        <div className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              About Me
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>
              Dive into my skills, journey, and {isMobile && <br />}
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

        <div className="w-full max-w-6xl mx-auto px-0 flex-1 flex items-center">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-12 relative w-full mb-8 sm:mb-0">
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
    </div>
  );
}
