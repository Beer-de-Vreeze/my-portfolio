"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { usePageSetup } from "@/hooks/usePageSetup";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";
import styles from "@/styles/page.module.css";
import { useResponsiveSize } from "@/hooks/useScrolling";

const StarfieldBackground = dynamic(() => import('@/components/features/StarfieldBackground'), { ssr: false });

// Dynamic imports for better code splitting and performance
const BunqVoice = React.lazy(() => import("@/components/projects/bunq-voice"));
const AudioPreviewer = React.lazy(() => import("@/components/projects/audio-previewer"));
const BearlyStealthy = React.lazy(() => import("@/components/projects/bearly-stealthy"));
const MLAgent = React.lazy(() => import("@/components/projects/MLAgent"));
const SketchinSpells = React.lazy(() => import("@/components/projects/sketchin-spells"));
const Tetris = React.lazy(() => import("@/components/projects/tetris"));
const Website = React.lazy(() => import("@/components/projects/Website"));
const LPCafe = React.lazy(() => import("@/components/projects/LPCafe"));

const GRID_CLASSES = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-7 px-1 md:px-0 max-w-6xl";

// Glassmorphism skeleton matching the card surface style
const ProjectSkeleton = () => (
  <div className="w-full h-64 rounded-2xl border border-white/[0.08] backdrop-blur-sm animate-pulse"
    style={{ background: 'var(--glass-bg)' }}
  />
);

const ProjectsLoading = () => (
  <div className={GRID_CLASSES}>
    {[...Array(8)].map((_, i) => (
      <ProjectSkeleton key={i} />
    ))}
  </div>
);

const PROJECT_COMPONENTS = [
  { key: 'bunq-voice', Component: BunqVoice },
  { key: 'audio-previewer', Component: AudioPreviewer },
  { key: 'lp-cafe', Component: LPCafe },
  { key: 'ml-agent', Component: MLAgent },
  { key: 'website', Component: Website },
  { key: 'bearly-stealthy', Component: BearlyStealthy },
  { key: 'sketchin-spells', Component: SketchinSpells },
  { key: 'tetris', Component: Tetris },
] as const;

// Projects content component that uses lazy loading
const ProjectsContent = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
  if (prefersReducedMotion) {
    return (
      <div className={GRID_CLASSES}>
        {PROJECT_COMPONENTS.map(({ key, Component }) => (
          <Suspense key={key} fallback={<ProjectSkeleton />}>
            <Component />
          </Suspense>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={GRID_CLASSES}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {PROJECT_COMPONENTS.map(({ key, Component }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.07 }}
        >
          <Suspense fallback={<ProjectSkeleton />}>
            <Component />
          </Suspense>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function Projects() {
  const { isDesktop } = useResponsiveSize();
  const { prefersReducedMotion } = usePageSetup({ scrollMode: 'subpage' });

  return (
    <div className={`flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`}>
      <StarfieldBackground density={0.7} />

      <main className="flex-1 pt-16 pb-20 sm:pb-16 md:pb-20 px-2 sm:px-4 md:px-6 text-white relative z-10 w-full flex flex-col">
        {/* Compact page header */}
        <div className={`${styles.headerContainer} ${styles.headerContainerSmall}`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              Projects
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>

          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>
              A selection of games, tools, and experiments — click any card to go deeper.
            </span>
          </h2>
        </div>

        <div className="w-full max-w-6xl mx-auto px-0">
          <div className="w-full">
            <Suspense fallback={<ProjectsLoading />}>
              <ProjectsContent prefersReducedMotion={prefersReducedMotion} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
