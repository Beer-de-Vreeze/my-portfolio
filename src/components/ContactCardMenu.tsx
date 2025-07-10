"use client";
import { EnvelopeIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";
import styles from "@/styles/page.module.css";

export default function ContactCard() {
  return (
    <BaseCard href="/contact">
      <div
        className={`relative z-10 flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 rounded-xl transition-all duration-500 group-hover:border-pink-500/50 group-hover:shadow-lg group-hover:shadow-pink-500/20 overflow-hidden ${styles.contactCardGrid}`}
        style={{
          width: 'clamp(160px, 20vw, 220px)',
          height: 'clamp(160px, 20vw, 220px)'
        }}
      >
        {/* Floating message bubbles */}
        <div className="bubble-1 absolute top-4 right-4 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-80"></div>
        <div className="bubble-2 absolute top-8 right-8 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-60"></div>
        <div className="bubble-3 absolute top-12 right-12 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-40"></div>
        
        {/* Decorative dots similar to other cards - Desktop only */}
        <div className="absolute top-3 right-3 w-2 h-2 bg-pink-400 rounded-full opacity-60 hidden lg:block lg:animate-pulse"></div>
        <div className="absolute bottom-6 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-40 hidden lg:block lg:animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-50 hidden lg:block lg:animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Main envelope container */}
        <div className="envelope-container relative">
          {/* Envelope base */}
          <EnvelopeIcon className="envelope-icon w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-white relative z-10" />
          
          {/* Paper airplane that flies out */}
          <PaperAirplaneIcon className="paper-plane absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 text-pink-400 opacity-0 rotate-45 z-20" />
          
          {/* Sending trail effect */}
          <div className="trail-1 absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-pink-400 to-transparent opacity-0 rotate-45"></div>
          <div className="trail-2 absolute top-1/2 left-1/2 w-0.5 h-6 bg-gradient-to-t from-purple-400 to-transparent opacity-0 rotate-45"></div>
        </div>
        
        {/* Success checkmark that appears */}
        <div className="checkmark absolute top-1/4 right-1/4 w-6 h-6 text-pink-400 opacity-0 scale-0">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <span className="contact-text absolute bottom-4 left-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased transition-all duration-300 group-hover:text-pink-400">
        Contact
      </span>
      
      <style jsx global>{`
        /* Envelope opening animation */
        .envelope-icon {
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: drop-shadow(0 0 0px rgba(236, 72, 153, 0));
        }
        
        .group:hover .envelope-icon {
          transform: scale(1.1);
          color: rgb(236, 72, 153);
          filter: drop-shadow(0 0 15px rgba(236, 72, 153, 0.6));
        }
        
        /* Paper plane flying animation */
        .paper-plane {
          transition: all 0.8s ease-out;
        }
        
        .group:hover .paper-plane {
          opacity: 1 !important;
          animation: fly-away 0.8s ease-out forwards;
        }
        
        @keyframes fly-away {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(45deg) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translate(60px, -60px) rotate(45deg) scale(1.2);
          }
        }
        
        /* Message bubbles floating animation */
        .bubble-1, .bubble-2, .bubble-3 {
          transition: all 0.8s ease-out;
        }
        
        .group:hover .bubble-1 {
          animation: float-up-1 2s ease-out infinite;
        }
        
        .group:hover .bubble-2 {
          animation: float-up-2 2.5s ease-out infinite;
          animation-delay: 0.3s;
        }
        
        .group:hover .bubble-3 {
          animation: float-up-3 3s ease-out infinite;
          animation-delay: 0.6s;
        }
        
        @keyframes float-up-1 {
          0% { transform: translateY(0px) scale(1); opacity: 0.8; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
        }
        
        @keyframes float-up-2 {
          0% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-25px) scale(1.3); opacity: 0.4; }
          100% { transform: translateY(-50px) scale(0.7); opacity: 0; }
        }
        
        @keyframes float-up-3 {
          0% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.4); opacity: 0.3; }
          100% { transform: translateY(-60px) scale(0.6); opacity: 0; }
        }
        
        /* Trail effects */
        .trail-1, .trail-2 {
          transition: all 1s ease-out;
          transform-origin: bottom;
        }
        
        .group:hover .trail-1 {
          opacity: 0.6 !important;
          animation: trail-fade 1.5s ease-out;
          animation-delay: 0.5s;
        }
        
        .group:hover .trail-2 {
          opacity: 0.4 !important;
          animation: trail-fade 1.8s ease-out;
          animation-delay: 0.7s;
        }
        
        @keyframes trail-fade {
          0% { opacity: 0; transform: rotate(45deg) scaleY(0); }
          30% { opacity: 0.8; transform: rotate(45deg) scaleY(1); }
          100% { opacity: 0; transform: rotate(45deg) scaleY(1.2); }
        }
        
        /* Success checkmark */
        .checkmark {
          transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .group:hover .checkmark {
          opacity: 1 !important;
          transform: scale(1) !important;
          animation: checkmark-bounce 0.8s ease-out;
          animation-delay: 1.5s;
        }
        
        @keyframes checkmark-bounce {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.3) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        /* Contact text glow effect */
        .group:hover .contact-text {
          text-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
      `}</style>
    </BaseCard>
  );
}