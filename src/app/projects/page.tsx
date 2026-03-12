"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePageSetup } from "@/hooks/usePageSetup";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";
import styles from "@/styles/page.module.css";
import { useResponsiveSize } from "@/hooks/useScrolling";

const StarfieldBackground = dynamic(() => import('@/components/features/StarfieldBackground'), { ssr: false });

// Dynamic imports for better code splitting and performance
const AudioPreviewer = React.lazy(() => import("@/components/projects/audio-previewer"));
const BearlyStealthy = React.lazy(() => import("@/components/projects/bearly-stealthy"));
const MLAgent = React.lazy(() => import("@/components/projects/MLAgent"));
const SketchinSpells = React.lazy(() => import("@/components/projects/sketchin-spells"));
const Tetris = React.lazy(() => import("@/components/projects/tetris"));
const Website = React.lazy(() => import("@/components/projects/Website"));
const LPCafe = React.lazy(() => import("@/components/projects/LPCafe"));
const ProjectsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
        <div className="text-gray-400">{i === 3 ? 'Loading projects... (Tip: ↑↑↓↓←→←→BA)' : 'Loading project...'}</div>
      </div>
    ))}
  </div>
);

// Projects content component that uses lazy loading
const ProjectsContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl animate-slideInUp">
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <AudioPreviewer />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <LPCafe />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <MLAgent />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <Website />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <BearlyStealthy />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <SketchinSpells />
      </Suspense>
      <Suspense fallback={<div className="w-full h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>}>
        <Tetris />
      </Suspense>
    </div>
  );
};

export default function Projects() {
  const { isMobile, isDesktop } = useResponsiveSize();
  usePageSetup({ scrollMode: 'subpage' });

  return (
    <div className={`flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`}>
      <StarfieldBackground density={0.7} />


      <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col">
        {/* Enhanced header section with animated title */}
        <div className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              My Projects
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
              <ProjectsContent />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
