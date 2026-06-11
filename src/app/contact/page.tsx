'use client';
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ContactForm from '@/components/forms/ContactForm';
import Notification from '@/components/features/Notification';
import { motion } from 'framer-motion';
import { Mail, FileDown, ArrowUpRight } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import styles from '@/styles/page.module.css';
import { useResponsiveSize } from '@/hooks/useScrolling';
import { usePageSetup } from '@/hooks/usePageSetup';
import '@/styles/performance.css';

const StarfieldBackground = dynamic(() => import('@/components/features/StarfieldBackground'), { ssr: false });

const PINK_TINT_STYLE: React.CSSProperties = {
  background: 'radial-gradient(circle at 80% 20%, rgba(236,72,153,0.06) 0%, transparent 50%)',
};

const ItchIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 512 512"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z"/>
  </svg>
);

const CONTACT_LINKS = [
  {
    label: 'beer@vreeze.com',
    href: 'mailto:beer@vreeze.com',
    external: false,
    accent: 'text-blue-400',
    Icon: Mail,
  },
  {
    label: 'Beer-de-Vreeze',
    href: 'https://github.com/Beer-de-Vreeze',
    external: true,
    accent: 'text-gray-400',
    Icon: FaGithub,
  },
  {
    label: 'beer-de-vreeze',
    href: 'https://www.linkedin.com/in/beer-de-vreeze-59040919a/',
    external: true,
    accent: 'text-blue-400',
    Icon: FaLinkedin,
  },
  {
    label: 'bjeerpeer',
    href: 'https://bjeerpeer.itch.io/',
    external: true,
    accent: 'text-red-400',
    Icon: ItchIcon,
  },
  {
    label: 'Download CV',
    href: '/downloads/Beer%20de%20Vreeze%20CV.pdf',
    external: true,
    accent: 'text-emerald-400',
    Icon: FileDown,
  },
] as const;

export default function Contact() {
  const { isDesktop } = useResponsiveSize();
  const { prefersReducedMotion } = usePageSetup({ scrollMode: 'subpage' });

  // Notification state moved to page level
  const [notification, setNotification] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
    isVisible: false,
  });

  // Handler to show notifications from the contact form
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  }, []);

  // Handler to close notification
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Prefetch CV for better UX
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/downloads/Beer%20de%20Vreeze%20CV.pdf';
    document.head.appendChild(link);
  }, []);

  return (
    <div className={`flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`}>
      {/* Page-level notification - always visible at top right of viewport */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={handleCloseNotification}
      />

      <StarfieldBackground />

      <main className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16 relative z-10 pt-20 pb-32 w-full">
        {/* Compact page header */}
        <header className={`${styles.headerContainer} ${styles.headerContainerSmall} mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              Let&apos;s talk.
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>

          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>I read every message and reply within a day or two.</span>
          </h2>
        </header>

        {/* Split glassmorphism container: info left, form right */}
        <div className="glass relative w-full max-w-5xl mx-auto p-5 lg:p-8 flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_1px_1.5fr]">
          {/* Pink gradient tint */}
          <div
            className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={PINK_TINT_STYLE}
            aria-hidden="true"
          />

          {/* Left column: identity and links */}
          <motion.aside
            className="relative flex flex-col justify-center"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <p className="text-xl font-light text-white">Beer de Vreeze</p>
              <p className="text-sm text-gray-400">Software Developer · Game Tools · AI Systems</p>
              <p className="text-sm text-gray-500 leading-relaxed mt-3">
                Based in Beusichem, Netherlands.
              </p>
            </div>

            <div className="border-t border-white/10 my-6" />

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Find me</p>
              <ul className="flex flex-col">
                {CONTACT_LINKS.map(({ label, href, external, accent, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${accent}`} aria-hidden="true" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {label}
                      </span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 ml-auto text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>

          {/* Vertical divider on desktop */}
          <div className="hidden lg:block w-px bg-white/10 self-stretch" aria-hidden="true" />

          {/* Right column: the form */}
          <motion.section
            className="relative flex flex-col justify-center"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ContactForm onNotification={showNotification} />
          </motion.section>
        </div>
      </main>
    </div>
  );
}
