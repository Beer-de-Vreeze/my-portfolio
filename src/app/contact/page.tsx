'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import Notification from '@/components/Notification';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFileAlt } from 'react-icons/fa';
import { useResponsiveSize } from '@/components/utils/useScrolling';
import styles from '@/styles/page.module.css';

export default function Contact() {
  const { isDesktop } = useResponsiveSize();
  const [isMounted, setIsMounted] = useState(false);
  
  // Notification state moved to page level
  const [notification, setNotification] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
    isVisible: false,
  });

  // Handler to show notifications from the contact form
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  // Handler to close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // One-time overflow control based on screen size - only runs once after mount
  useEffect(() => {
    if (isMounted) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Only disable scrolling on very large desktops (1600px+ width AND 1000px+ height) where content actually fits
      if (width >= 1600 && height >= 1000) {
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
      } else {
        // For all other devices including laptops, ensure scrolling is enabled
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

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${styles.containerScrollable} ${styles.enhancedBackground}`}>
      {/* Page-level notification - always visible at top right of viewport */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={handleCloseNotification}
      />
      
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

      <Navbar />
      
      <main className={`contact-page-main flex-1 flex flex-col justify-start items-center max-w-2xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 pt-20 pb-40 sm:pb-32 md:pb-40 lg:pb-40`}>
        {/* Enhanced header section with animated title - smaller and more compact */}
        <div className={`${styles.headerContainer} ${styles.headerContainerSmall} mb-8 sm:mb-10 md:mb-12`}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.name} ${isDesktop ? styles.nameDesktopSmall : styles.nameMobileSmall} ${styles.animatedTitle}`}>
              <span className={styles.titleCharacter}>L</span>
              <span className={styles.titleCharacter}>e</span>
              <span className={styles.titleCharacter}>t</span>
              <span className={styles.titleCharacter}>&apos;</span>
              <span className={styles.titleCharacter}>s</span>
              <span className={styles.titleCharacter}>&nbsp;</span>
              <span className={styles.titleCharacter}>c</span>
              <span className={styles.titleCharacter}>h</span>
              <span className={styles.titleCharacter}>a</span>
              <span className={styles.titleCharacter}>t</span>
              <span className={styles.titleCharacter}>.</span>
            </h1>
            <div className={`${styles.titleUnderline} ${isDesktop ? styles.titleUnderlineDesktop : ''}`}></div>
          </div>
          
          <h2 className={`${styles.subtitle} ${isDesktop ? styles.titleDesktopSmall : styles.titleMobileSmall}`}>
            <span className={styles.subtitleText}>Send me a message, and I&apos;ll get back to you soon.</span>
          </h2>
          
          {/* Floating accent elements */}
          <div className={styles.accentDots}>
            <div className={`${styles.accentDot} ${styles.accentDot1}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot2}`}></div>
            <div className={`${styles.accentDot} ${styles.accentDot3}`}></div>
          </div>
        </div>

        {/* Contact form card with enhanced styling - full size for better usability */}
        <motion.div 
          className={`${styles.cardWrapper} ${styles.cardHover} select-content contact-form-container p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg w-full max-w-xl`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: -0.2 }}
        >

          <ContactForm onNotification={showNotification} />
          
          {/* Social links with gradient colors - more compact */}
          <div className="flex justify-center space-x-3 sm:space-x-4 mt-4 sm:mt-6">
            <motion.a 
              href="https://github.com/Beer-de-Vreeze" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl sm:text-3xl p-3 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 text-white hover:from-gray-500 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 1.8 }}
            >
              <FaGithub />
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/beer-de-vreeze-59040919a/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl sm:text-3xl p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-400 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 2.0 }}
            >
              <FaLinkedin />
            </motion.a>
            <motion.a 
              href="https://bjeerpeer.itch.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 text-white hover:from-red-400 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 2.2 }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 512 512" 
                fill="currentColor"
                className="w-[1em] h-[1em]"
              >
                <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z"/>
              </svg>
            </motion.a>
            <motion.a 
              href="/downloads/Beer%20de%20Vreeze%20CV.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 2.4 }}
            >
              <FaFileAlt />
            </motion.a>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}