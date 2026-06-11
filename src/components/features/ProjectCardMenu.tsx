import React from "react";
import { HiFolder } from "react-icons/hi2";
import BaseCard from "../cards/Card";
import styles from "./projectCardMenu.module.css";

const CARD_STYLE: React.CSSProperties = {
  width: 'clamp(160px, 20vw, 220px)',
  height: 'clamp(160px, 20vw, 220px)',
};

// Dark frosted-glass surface for the front card — matches the About and
// Contact cards so all three home cards share the same look.
const FRONT_SURFACE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(31,31,35,0.9) 0%, rgba(0,0,0,0.95) 70%, rgba(31,31,35,0.9) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const TINT_STYLE: React.CSSProperties = {
  background: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.14) 0%, transparent 60%)',
};

const STACK_CLASSES = [styles.card0, styles.card1, styles.card2, styles.card3, styles.card4];

export default function ProjectsCard() {
  return (
    <BaseCard href="/projects">
      <div className="relative z-10 flex items-center justify-center">
        {[4, 3, 2, 1, 0].map((index) => (
          <div
            key={index}
            className={`
              absolute flex items-center justify-center p-5 rounded-2xl border-2
              ${index === 0
                ? 'border-white/8 group-hover:border-white/15'
                : `${styles.backCard} border-purple-600/20`}
              ${styles.stackCard} ${STACK_CLASSES[index]}
            `}
            style={{
              ...CARD_STYLE,
              ...(index === 0 ? FRONT_SURFACE_STYLE : {}),
              zIndex: 10 - index,
              opacity: index === 0 ? 1 : 0.8 - (index * 0.1),
            }}
          >
            {/* Purple gradient tint on the front card */}
            {index === 0 && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.57] group-hover:opacity-100 transition-opacity duration-400"
                style={TINT_STYLE}
                aria-hidden="true"
              ></div>
            )}

            {index === 0 && (
              <HiFolder
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-white/70 group-hover:text-white relative z-10 ${styles.folderIcon}`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      <span className="absolute bottom-4 left-4 text-white/60 text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased transition-colors duration-300 group-hover:text-white z-20">
        Projects
      </span>
    </BaseCard>
  );
}
