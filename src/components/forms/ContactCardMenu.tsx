"use client";
import type React from "react";
import { EnvelopeIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import BaseCard from "../cards/Card";
import styles from "./contactCardMenu.module.css";

const CONTAINER_STYLE: React.CSSProperties = {
  width: 'clamp(160px, 20vw, 220px)',
  height: 'clamp(160px, 20vw, 220px)',
};

const GLASS_SURFACE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const GRADIENT_BORDER_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(236,72,153,0.15), transparent 50%)',
};

const TINT_STYLE: React.CSSProperties = {
  background: 'radial-gradient(circle at 50% 80%, rgba(236,72,153,0.14) 0%, transparent 60%)',
};

export default function ContactCard() {
  return (
    <BaseCard href="/contact">
      {/* Gradient-border wrapper: gradient layer + 1px padding, inner surface at 23px radius */}
      <div className="relative z-10 rounded-[24px] p-px" style={CONTAINER_STYLE}>
        {/* Gradient border layer — visible on hover only */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={GRADIENT_BORDER_STYLE}
          aria-hidden="true"
        />

        {/* Frosted glass surface */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[23px] bg-black border border-white/[0.08] group-hover:border-white/[0.15] transition-colors duration-300"
          style={GLASS_SURFACE_STYLE}
        >
          {/* Pink gradient tint bleeding into the surface — 0.08 at rest, 0.14 on hover */}
          <div
            className="absolute inset-0 rounded-[23px] pointer-events-none opacity-[0.57] group-hover:opacity-100 transition-opacity duration-[400ms]"
            style={TINT_STYLE}
            aria-hidden="true"
          />

          {/* Floating message bubbles */}
          <div className={`${styles.bubble1} absolute top-4 right-4 w-3 h-3 bg-pink-400 rounded-full`}></div>
          <div className={`${styles.bubble2} absolute top-8 right-8 w-2 h-2 bg-purple-400 rounded-full`}></div>

          {/* Main envelope container */}
          <div className="relative">
            {/* Envelope base */}
            <EnvelopeIcon className={`${styles.envelopeIcon} w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-white/70 relative z-10`} />

            {/* Paper airplane that flies out */}
            <PaperAirplaneIcon className={`${styles.paperPlane} absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 text-pink-400 z-20`} />
          </div>
        </div>
      </div>

      <span className="absolute bottom-4 left-4 text-white/60 text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased transition-colors duration-300 group-hover:text-white">
        Contact
      </span>
    </BaseCard>
  );
}
