'use client'
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from "@/styles/page.module.css";

function NotFoundContent() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get error type from URL params or default to 404
  const errorType = searchParams?.get('error') || '404';

  // Define different error configurations
  const errorConfigs: Record<string, {
    code: string;
    title: string;
    message: string;
    description: string;
    achievement: string;
    errorCode: string;
  }> = {
    '404': {
      code: '404',
      title: '🚀 NAVIGATION ERROR 🚀',
      message: 'Looks like you ventured into uncharted space!',
      description: 'The page you\'re looking for seems to have been abducted by aliens 👽',
      achievement: 'Lost Explorer',
      errorCode: 'SPACE_CADET_LOST'
    },
    '403': {
      code: '403',
      title: '🛡️ ACCESS DENIED 🛡️',
      message: 'This sector is classified, space cadet!',
      description: 'Your clearance level isn\'t high enough to access this galactic zone 🔒',
      achievement: 'Security Breach Attempt',
      errorCode: 'UNAUTHORIZED_SECTOR'
    },
    '500': {
      code: '500',
      title: '⚡ SYSTEM MALFUNCTION ⚡',
      message: 'Houston, we have a problem!',
      description: 'The mothership\'s mainframe is experiencing technical difficulties 🛰️',
      achievement: 'Crisis Navigator',
      errorCode: 'MAINFRAME_ERROR'
    },
    '503': {
      code: '503',
      title: '🔧 MAINTENANCE MODE 🔧',
      message: 'The space station is under maintenance!',
      description: 'Our engineers are upgrading the hyperdrive systems 🚧',
      achievement: 'Maintenance Witness',
      errorCode: 'STATION_OFFLINE'
    },
    '408': {
      code: '408',
      title: '⏰ CONNECTION TIMEOUT ⏰',
      message: 'Signal lost in deep space!',
      description: 'Communication with the command center has been interrupted 📡',
      achievement: 'Signal Hunter',
      errorCode: 'COMM_LINK_DOWN'
    }
  };

  const currentError = errorConfigs[errorType] || errorConfigs['404'];

  // Only render UI if mounted (avoids hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return (
    <main className={`${styles.container} ${styles.enhancedBackground} px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16`}>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid}></div>
      
      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust}></div>
      
      {/* Enhanced Space Starfield */}
      <div className={styles.particleContainer}>
        {Array.from({ length: 50 }, (_, i) => {
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

      {/* 404 Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 relative z-40">
        {/* Error Number */}
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {currentError.code}
          </h1>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {currentError.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            {currentError.message}
          </p>
          <p className="text-base md:text-lg text-gray-400">
            {currentError.description}
          </p>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center relative z-50">
          <Link 
            href="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer z-50"
          >
            <span className="relative z-10">🚀 Return to Home Base</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </Link>
          
          <Link 
            href="/projects"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer z-50"
          >
            <span className="relative z-10">🎯 Explore Projects</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* Fun Gaming Elements */}
        <div className="mt-8 space-y-4 text-center">
          <div className="text-sm text-gray-500">
            💡 Pro Tip: Check the URL for typos, or use the navigation above
          </div>
          
          {/* Achievement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm">
            🏆 Achievement Unlocked: &quot;{currentError.achievement}&quot;
          </div>

          {/* Easter Egg Message */}
          <div className="text-xs text-gray-600 mt-4">
            <span className="opacity-50">
              Error Code: {currentError.errorCode} | Time: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

    </main>
  );
}

// Loading component for Suspense fallback
function NotFoundFallback() {
  return (
    <main className={`${styles.container} ${styles.enhancedBackground} px-4 sm:px-6 md:px-8 lg:px-8 xl:px-16`}>
      {/* Animated background grid */}
      <div className={styles.backgroundGrid}></div>
      
      {/* Cosmic dust layer */}
      <div className={styles.cosmicDust}></div>
      
      {/* Enhanced Space Starfield */}
      <div className={styles.particleContainer}>
        {Array.from({ length: 50 }, (_, i) => {
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

      {/* Loading Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 relative z-40">
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            🚀 NAVIGATION ERROR 🚀
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            Loading navigation systems...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundFallback />}>
      <NotFoundContent />
    </Suspense>
  );
}