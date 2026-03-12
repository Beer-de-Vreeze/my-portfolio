import type React from "react";
import { UserIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";
import styles from "@/styles/page.module.css";

// Static class strings — defined at module level, never re-created per render
const ICON_CLASSES =
  "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-white transition-colors duration-500 group-hover:text-blue-400 about-card-icon";

const CONTAINER_BASE =
  "relative z-10 flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 rounded-xl transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-lg group-hover:shadow-blue-500/20 overflow-hidden";

const TEXT_CLASSES =
  "absolute bottom-4 left-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased transition-all duration-300 group-hover:text-blue-400";

const CONTAINER_STYLE: React.CSSProperties = {
  width: 'clamp(160px, 20vw, 220px)',
  height: 'clamp(160px, 20vw, 220px)',
};

interface AboutCardProps {
  className?: string;
  disabled?: boolean;
}

export default function AboutCard({ className, disabled = false }: AboutCardProps) {
  const containerClasses = `${CONTAINER_BASE} ${styles.aboutCardGrid}`;

  return (
    <BaseCard 
      href="/about" 
      ariaLabel="Navigate to About Me page - Learn more about Beer de Vreeze"
      className={className}
      disabled={disabled}
    >
      <div
        className={containerClasses}
        style={CONTAINER_STYLE}
        role="img"
        aria-label="User profile icon"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Floating circles decoration */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-6 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>

        <UserIcon
          className={ICON_CLASSES}
          aria-hidden="true"
        />
      </div>

      <span
        className={TEXT_CLASSES}
        aria-hidden="true"
      >
        About me
      </span>
    </BaseCard>
  );
}
