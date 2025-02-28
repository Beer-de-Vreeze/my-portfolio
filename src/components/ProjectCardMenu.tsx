import React from "react";
import { FolderIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";

export default function ProjectsCard() {
  return (
    <BaseCard href="/projects">
      <div className="relative z-10 flex items-center justify-center">
        {[4, 3, 2, 1, 0].map((index) => (
          <div 
            key={index}
            className={`
              absolute flex items-center justify-center 
              p-4 sm:p-5 bg-black border border-[#27272a] rounded-lg 
              transition-all duration-300
              ${index === 0 ? 'group-hover:border-gray-500 group-hover:scale-105' : ''}
              card-${index}
            `}
            style={{
              zIndex: 10 - index,
              width: '160px',
              height: '160px',
              transform: `translate(${index * 6 + (index * 2)}px, ${index * 3}px)`,
              opacity: index === 0 ? 1 : 0.85 - (index * 0.07),
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease, border-color 0.3s ease',
            }}
          >
            {index === 0 && (
              <FolderIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 text-white transition-transform duration-300 group-hover:scale-110" />
            )}
          </div>
        ))}
      </div>

      <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white text-xl sm:text-2xl md:text-3xl tracking-tighter font-extralight antialiased">
        Projects
      </span>

      <style jsx global>{`
        .card-0, .card-1, .card-2, .card-3, .card-4 {
          background-color: black;
          border-color: #27272a;
        }
        
        .group:hover .card-0 {
          transform: translate(-8px, -6px) !important;
          border-color: #71717a !important;
        }
        
        .group:hover .card-1 {
          transform: translate(20px, 6px) !important;
          border-color: #27272a !important;
        }
        
        .group:hover .card-2 {
          transform: translate(36px, 12px) !important;
          border-color: #27272a !important;
        }
        
        .group:hover .card-3 {
          transform: translate(52px, 18px) !important;
          border-color: #27272a !important;
        }
        
        .group:hover .card-4 {
          transform: translate(68px, 24px) !important;
        }
      `}</style>
    </BaseCard>
  );
}