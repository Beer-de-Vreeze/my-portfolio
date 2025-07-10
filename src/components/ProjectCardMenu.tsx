import React from "react";
import { FolderIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";
import styles from "@/styles/page.module.css";

export default function ProjectsCard() {
  return (
    <BaseCard href="/projects">
      <div className="relative z-10 flex items-center justify-center">
        {[4, 3, 2, 1, 0].map((index) => (
          <div 
            key={index}
            className={`
              absolute flex items-center justify-center 
              p-5 ${index === 0 ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600' : 'bg-gradient-to-br from-purple-800/80 via-pink-700/70 to-red-700/60'} 
              border-2 ${index === 0 ? 'border-pink-400/40 group-hover:border-pink-300/70' : 'border-purple-600/20'} rounded-2xl 
              transition-all duration-500
              ${index === 0 ? `group-hover:shadow-2xl group-hover:shadow-pink-500/60 group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-red-500 ${styles.projectCardGrid}` : 'group-hover:border-purple-500/30'}
              card-${index}
            `}
            style={{
              zIndex: 10 - index,
              width: 'clamp(160px, 20vw, 220px)',
              height: 'clamp(160px, 20vw, 220px)',
              transform: `translate(${index * 8 + (index * 2)}px, ${index * 4}px)`,
              opacity: index === 0 ? 1 : 0.8 - (index * 0.1),
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease, border-color 0.4s ease, box-shadow 0.4s ease, filter 0.6s ease',
              filter: index > 0 ? 'blur(0px)' : 'none',
            }}
          >
            {/* Background gradient overlay for front card */}
            {index === 0 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              </>
            )}
            
            {/* Decorative elements for front card */}
            {index === 0 && (
              <>
                <div className="absolute top-3 right-3 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-6 right-6 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </>
            )}

            {index === 0 && (
              <FolderIcon 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-white transition-colors duration-500 group-hover:text-purple-400 relative z-10"
                style={{
                  transform: 'rotate(0deg) scale(1) rotateX(0deg)',
                  transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  filter: 'drop-shadow(0 0 0px rgba(168, 85, 247, 0))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(-15deg) scale(1.2) rotateX(20deg)';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 25px rgba(168, 85, 247, 0.9))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg) scale(1) rotateX(0deg)';
                  e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(168, 85, 247, 0))';
                }}
              />
            )}
          </div>
        ))}
      </div>

      <span className="absolute bottom-4 left-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased transition-all duration-300 group-hover:text-purple-400 z-20">
        Projects
      </span>

      <style jsx global>{`
        .card-0, .card-1, .card-2, .card-3, .card-4 {
          background: linear-gradient(135deg, #1f1f23 0%, #000000 70%, #1f1f23 100%);
          border-color: #374151;
        }
        
        .group:hover .card-0 {
          transform: translate(-16px, -12px) rotate(-2deg) !important;
          border-color: rgba(168, 85, 247, 0.6) !important;
          box-shadow: 0 15px 35px rgba(168, 85, 247, 0.3), 0 5px 15px rgba(168, 85, 247, 0.2) !important;
          filter: brightness(1.1) !important;
        }
        
        .group:hover .card-1 {
          transform: translate(28px, 12px) rotate(3deg) !important;
          border-color: rgba(147, 51, 234, 0.4) !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4) !important;
          filter: blur(0.5px) brightness(0.9) !important;
        }
        
        .group:hover .card-2 {
          transform: translate(52px, 20px) rotate(-1deg) !important;
          border-color: rgba(139, 69, 19, 0.3) !important;
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3) !important;
          filter: blur(1px) brightness(0.8) !important;
        }
        
        .group:hover .card-3 {
          transform: translate(76px, 28px) rotate(2deg) !important;
          border-color: #374151 !important;
          filter: blur(1.5px) brightness(0.7) !important;
        }
        
        .group:hover .card-4 {
          transform: translate(100px, 36px) rotate(-1deg) !important;
          border-color: #374151 !important;
          filter: blur(2px) brightness(0.6) !important;
        }
        
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .group:hover .card-1 {
          animation: cardPulse 2s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .group:hover .card-2 {
          animation: cardPulse 2.5s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </BaseCard>
  );
}