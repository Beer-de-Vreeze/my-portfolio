'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl text-white py-4 flex justify-center items-center border-t border-gray-800/50 z-50 pointer-events-none"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            animation: 'gridShift 25s linear infinite reverse'
          }}
        />
      </div>

      <div className="w-full max-w-5xl flex flex-row justify-between items-center gap-2 sm:gap-3 px-2 sm:px-4 relative z-10 pointer-events-auto">
        <div 
          className="relative group/copyright"
          role="text"
          aria-label="Copyright information"
        >
          <div className="relative px-2 sm:px-4 py-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="relative tracking-tighter font-extralight text-xs sm:text-sm lg:text-lg text-gray-300 cursor-help">
              © Beer de Vreeze
            </span>
            
            {/* Hidden Konami Code Easter Egg - Only shows on direct text hover */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/copyright:opacity-100 transition-opacity duration-500 pointer-events-none z-50">
              <div className="bg-black/95 border border-green-500/70 rounded-lg px-3 py-2 text-xs text-green-400 font-mono whitespace-nowrap shadow-xl backdrop-blur-sm">
                <span className="text-green-200">↑↑↓↓←→←→BA</span>
              </div>
              {/* Small arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-500/70"></div>
            </div>
          </div>
        </div>

        <motion.a
          href="mailto:beer@vreeze.com"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex-shrink min-w-0"
          aria-label="Send email to Beer de Vreeze"
          title="Contact Beer de Vreeze via email"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
          <div className="relative px-2 sm:px-4 py-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:border-blue-500/30 group-hover:bg-gradient-to-r group-hover:from-gray-800/90 group-hover:to-gray-700/90">
            {/* Enhanced glow effect for email */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            
            <Mail size={16} className="mr-2 text-gray-400 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
            <span className="relative tracking-tighter font-extralight text-xs sm:text-sm lg:text-lg truncate text-gray-300 group-hover:text-white transition-colors duration-300">
              beer@vreeze.com
            </span>
            
            {/* Enhanced particle effects for email */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-blue-400/70 rounded-full animate-ping" 
                   style={{ animationDelay: '0ms' }} />
              <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-purple-400/50 rounded-full animate-ping" 
                   style={{ animationDelay: '150ms' }} />
              <div className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-pink-400/60 rounded-full animate-ping" 
                   style={{ animationDelay: '300ms' }} />
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border border-blue-400/0 group-hover:border-blue-400/20 group-hover:animate-ping transition-all duration-300" />
          </div>
        </motion.a>
      </div>

      <style jsx>{`
        @keyframes gridShift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
