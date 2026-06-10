'use client'
import { lazy, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import AboutCard from "../components/cards/AboutCard";
import ContactCard from "@/components/forms/ContactCardMenu";
import InfoStrip from "@/components/home/InfoStrip";
import CurrentlyWorking from "@/components/home/CurrentlyWorking";
import { PerformanceLoading } from "@/components/performance/PerformanceLoading";
import { useResponsiveSize } from "@/hooks/useScrolling";
import { usePageSetup } from "@/hooks/usePageSetup";
import { useTypewriter } from "@/hooks/useTypewriter";
import styles from "@/styles/page.module.css";

const StarfieldBackground = dynamic(() => import('@/components/features/StarfieldBackground'), { ssr: false });

// Lazy load heavy components with error boundaries
const ProjectCard = lazy(() =>
  import("../components/features/ProjectCardMenu").catch(err => {
    console.warn('Failed to load ProjectCard:', err);
    return { default: () => <div>Failed to load project card</div> };
  })
);

// Per-card accent drop shadows, hover only — about: blue, projects: purple, contact: pink
const CARD_GLOW_CLASSES = [
  "hover:drop-shadow-[0_12px_32px_rgba(59,130,246,0.35)]",
  "hover:drop-shadow-[0_12px_32px_rgba(139,92,246,0.35)]",
  "hover:drop-shadow-[0_12px_32px_rgba(236,72,153,0.35)]",
] as const;

// Role line typed out on load; the part after ROLE_SPLIT_INDEX gets the gradient.
const ROLE_TEXT = "Software developer specializing in game tools & AI systems";
const ROLE_SPLIT_INDEX = "Software developer specializing in ".length;

export default function Home() {
  const { isDesktop } = useResponsiveSize();
  const { prefersReducedMotion } = usePageSetup({ scrollMode: 'home' });

  // Typing effect for the role line — types once, never repeats.
  const typedRole = useTypewriter(ROLE_TEXT);
  const visibleRole = prefersReducedMotion ? ROLE_TEXT : typedRole;
  const typingComplete = visibleRole.length >= ROLE_TEXT.length;

  // Optimize card creation with memoization
  const cards = useMemo(() => [
    <AboutCard key="about" />,
    <Suspense key="project" fallback={<PerformanceLoading variant="card" size="lg" />}>
      <ProjectCard />
    </Suspense>,
    <ContactCard key="contact" />,
  ], []);

  return (
    <div className={`${styles.containerScrollable} ${styles.enhancedBackground} max-w-7xl mx-auto`}>
      <StarfieldBackground />

      <main className="relative z-10 w-full flex flex-col">
        <div className={`${styles.headerContainer} ${isDesktop ? styles.headerContainerDesktop : styles.headerContainerMobile} max-w-4xl mx-auto`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktop : styles.nameMobile} ${styles.animatedTitle}`} data-easter-egg="↑↑↓↓←→←→BA">
              Beer de Vreeze
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>

          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktop : styles.titleMobile}`}>
            <span className={styles.subtitleText}>{visibleRole.slice(0, ROLE_SPLIT_INDEX)}</span>
            <span className={`gradient-text ${styles.subtitleGradient} ${prefersReducedMotion ? styles.staticGradient : ''}`}>{visibleRole.slice(ROLE_SPLIT_INDEX)}</span>
            {/* Blinking cursor while typing; fades out over 500ms once complete */}
            {!prefersReducedMotion && (
              <span
                className={`gradient-text-static inline-block transition-opacity duration-500 ${typingComplete ? 'opacity-0' : 'animate-pulse'}`}
                aria-hidden="true"
              >
                |
              </span>
            )}
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

        {/* Recruiter info strip + current work, between hero and cards */}
        <InfoStrip />
        <CurrentlyWorking />

        <div className={`${styles.cardsSection} max-w-5xl mx-auto w-full`}>
          <div className={`${styles.cardsContainer} ${isDesktop ? styles.cardsContainerDesktop : styles.cardsContainerMobile}`}>
            {cards.map((card, index) => (
              <div
                key={index}
                className={`${styles.cardWrapper} ${!prefersReducedMotion ? styles.cardHover : ''} ${!prefersReducedMotion ? styles[`cardDelay${index}`] : ''} transition-[filter] duration-300 ${CARD_GLOW_CLASSES[index]}`}
                style={{
                  animationDelay: !prefersReducedMotion ? `${index * 150}ms` : '0ms',
                  contain: 'layout style paint'
                }}
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
