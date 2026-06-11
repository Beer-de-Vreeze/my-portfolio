import type React from "react";
import { HiUser } from "react-icons/hi2";
import BaseCard from "./Card";
import { GLASS_SURFACE_STYLE } from "@/styles/glassStyles";

// Static class strings — defined at module level, never re-created per render
const ICON_CLASSES =
  "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 relative z-10 text-white/70 group-hover:text-white will-change-transform " +
  "transition-all duration-800 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] " +
  "motion-safe:group-hover:transform-[rotate(720deg)_rotateY(180deg)_scale(1.15)] " +
  "group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.9)]";

const TEXT_CLASSES =
  "absolute bottom-4 left-4 text-white/60 text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased transition-colors duration-300 group-hover:text-white";

const CONTAINER_STYLE: React.CSSProperties = {
  width: 'clamp(160px, 20vw, 220px)',
  height: 'clamp(160px, 20vw, 220px)',
};

const GRADIENT_BORDER_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), transparent 50%)',
};

const TINT_STYLE: React.CSSProperties = {
  background: 'radial-gradient(circle at 30% 70%, rgba(59,130,246,0.14) 0%, transparent 60%)',
};

interface AboutCardProps {
  className?: string;
  disabled?: boolean;
}

export default function AboutCard({ className, disabled = false }: AboutCardProps) {
  return (
    <BaseCard
      href="/about"
      ariaLabel="Navigate to About Me page - Learn more about Beer de Vreeze"
      className={className}
      disabled={disabled}
    >
      {/* Gradient-border wrapper: gradient layer + 1px padding, inner surface at 23px radius */}
      <div
        className="relative z-10 rounded-[24px] p-px"
        style={CONTAINER_STYLE}
        role="img"
        aria-label="User profile icon"
      >
        {/* Gradient border layer — visible on hover only */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={GRADIENT_BORDER_STYLE}
          aria-hidden="true"
        />

        {/* Frosted glass surface */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[23px] bg-black border border-white/8 group-hover:border-white/15 transition-colors duration-300"
          style={GLASS_SURFACE_STYLE}
        >
          {/* Blue gradient tint bleeding into the surface — 0.08 at rest, 0.14 on hover */}
          <div
            className="absolute inset-0 rounded-[23px] pointer-events-none opacity-[0.57] group-hover:opacity-100 transition-opacity duration-400"
            style={TINT_STYLE}
            aria-hidden="true"
          />

          {/* Animated background gradient overlay on hover */}
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true"></div>

          <HiUser
            className={ICON_CLASSES}
            aria-hidden="true"
          />
        </div>
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
