import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt, FaGlobe, FaGamepad, FaLightbulb, FaFish, FaMedkit, FaUtensils, FaGithub, FaLinkedin, FaFileAlt } from 'react-icons/fa';

/**
 * Represents a skill or interest bubble with optional tooltip information
 */
interface Bubble {
  icon: React.JSX.Element;
  label: string;
  additionalInfo?: string;
  id: string; // Add unique identifier for better key management
}

/**
 * Props for the ProfileCard component
 */
interface ProfileCardProps {
  /** Full name to display */
  name?: string;
  /** Username/handle to display */
  username?: string;
  /** Array of skill/interest bubbles */
  bubbles?: Bubble[];
  /** Additional CSS classes */
  className?: string; // Allow custom styling
}

// Constants moved outside component for better performance
const ANIMATION_DURATION = 200;
const TOOLTIP_FADE_DELAY = 300;
const MOBILE_BREAKPOINT = 768;

// Default bubbles with improved structure
const DEFAULT_BUBBLES: Bubble[] = [
  { 
    id: 'location',
    icon: <FaMapMarkerAlt className="w-4 h-4 text-white" />, 
    label: "Beusichem, Netherlands",
  },
  { 
    id: 'dutch',
    icon: <FaGlobe className="w-4 h-4 text-white" />, 
    label: "Dutch",
    additionalInfo: "Native" 
  },
  { 
    id: 'english',
    icon: <FaGlobe className="w-4 h-4 text-white" />, 
    label: "English",
    additionalInfo: "Professional" 
  },
  { 
    id: 'gaming',
    icon: <FaGamepad className="w-4 h-4 text-white" />, 
    label: "Gaming",
    additionalInfo: "Passionate about gaming" 
  },
  { 
    id: 'tech',
    icon: <FaLightbulb className="w-4 h-4 text-white" />, 
    label: "Tech Enthusiast",
    additionalInfo: "More than just a hobby - constantly exploring new technologies" 
  },
  { 
    id: 'first-aid',
    icon: <FaMedkit className="w-4 h-4 text-white" />, 
    label: "First Aid",
    additionalInfo: "Certified first aid provider" 
  },
  { 
    id: 'diving',
    icon: <FaFish className="w-4 h-4 text-white" />, 
    label: "Scuba Diver",
    additionalInfo: "Certified diver exploring underwater worlds" 
  },
  { 
    id: 'cooking',
    icon: <FaUtensils className="w-4 h-4 text-white" />, 
    label: "Cooking",
    additionalInfo: "Passionate about culinary arts" 
  }
];

/**
 * ProfileCard component - A responsive profile card with interactive skill bubbles
 * 
 * Features:
 * - Responsive design that works on mobile and desktop
 * - Interactive skill bubbles with tooltips
 * - Accessible keyboard navigation
 * - Optimized performance with memoization
 * - Touch-friendly mobile interactions
 * 
 * @param props - ProfileCard component props
 * @returns React functional component
 */
const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ 
  name = "Beer de Vreeze", 
  username = "@bjeer.peer",  
  bubbles = DEFAULT_BUBBLES,
  className = ""
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [fadingBubble, setFadingBubble] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Memoized mobile detection function
  const checkIfMobile = useCallback(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= MOBILE_BREAKPOINT;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    return (isTouchDevice && isSmallScreen) || isMobileDevice;
  }, []);

  // Detect if device is mobile/touch - improved detection
  useEffect(() => {
    const handleResize = () => setIsMobile(checkIfMobile());
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [checkIfMobile]);

  // Handle clicks outside of bubbles to close tooltips on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (!target.closest('.bubble-container')) {
        setHoveredBubble(prev => {
          if (prev !== null) {
            setFadingBubble(prev);
            setTimeout(() => {
              setHoveredBubble(null);
              setFadingBubble(null);
            }, ANIMATION_DURATION);
          }
          return null;
        });
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobile]);

  // Clear fading bubble after animation completes
  useEffect(() => {
    if (fadingBubble !== null) {
      const timer = setTimeout(() => {
        setFadingBubble(null);
      }, TOOLTIP_FADE_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [fadingBubble]);

  // Memoized handlers for better performance
  const handleMouseEnter = useCallback((bubbleId: string) => {
    if (!isMobile) {
      setFadingBubble(null);
      setHoveredBubble(bubbleId);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setHoveredBubble(prev => {
        if (prev !== null) {
          setFadingBubble(prev);
          setTimeout(() => {
            setFadingBubble(null);
          }, ANIMATION_DURATION);
          return null;
        }
        return prev;
      });
    }
  }, [isMobile]);

  const handleBubbleInteraction = useCallback((bubbleId: string, event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isMobile) {
      // On mobile, toggle the tooltip
      setHoveredBubble(prev => {
        if (prev === bubbleId) {
          setFadingBubble(bubbleId);
          setTimeout(() => {
            setFadingBubble(null);
          }, ANIMATION_DURATION);
          return null;
        } else {
          setFadingBubble(null);
          return bubbleId;
        }
      });
    } else {
      // Desktop behavior - click to close
      setHoveredBubble(prev => {
        if (prev === bubbleId) {
          setFadingBubble(bubbleId);
          setTimeout(() => {
            setFadingBubble(null);
          }, ANIMATION_DURATION);
          return null;
        }
        return prev;
      });
    }
  }, [isMobile]);

  // Memoized social links for better performance
  const socialLinks = useMemo(() => [
    {
      href: "https://github.com/Beer-de-Vreeze",
      icon: <FaGithub />,
      label: "GitHub Profile"
    },
    {
      href: "https://www.linkedin.com/in/beer-de-vreeze-59040919a/",
      icon: <FaLinkedin />,
      label: "LinkedIn Profile"
    },
    {
      href: "https://bjeerpeer.itch.io/",
      icon: (
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 512 512" 
          fill="currentColor"
          className="w-[1em] h-[1em]"
          aria-label="Itch.io Profile"
        >
          <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z"/>
        </svg>
      ),
      label: "Itch.io Profile"
    },
    {
      href: "/downloads/Beer%20de%20Vreeze%20CV.pdf",
      icon: <FaFileAlt />,
      label: "Download CV"
    }
  ], []);

  return (
    <div className={`w-full max-w-none sm:max-w-[500px] h-auto bg-gradient-to-br from-gray-900/80 to-black/90 border border-blue-500/20 rounded-2xl shadow-xl backdrop-blur-sm p-3 sm:p-4 md:p-6 ${className} 
                    transition-all duration-500 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10 
                    relative overflow-hidden group mx-auto`}>
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(-45deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:12px_12px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="w-full relative z-10">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4 text-center sm:text-left">
          <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30 shadow-xl relative group/avatar flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
            <Image 
              src="/images/Beer.webp" 
              alt={`${name} profile picture`}
              width={96}
              height={96}
              className="w-full h-full object-cover object-center relative z-10 transition-transform duration-300 group-hover/avatar:scale-105"
              priority
            />
          </div>
          <div className="flex flex-col justify-start gap-1 pt-0 sm:pt-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text">{name}</h2>
            <p className="text-base sm:text-lg text-blue-200/80 tracking-tight font-light flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span>{username}</span>
              <span className="flex items-center gap-3" role="list" aria-label="Social media links">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-300 text-blue-200/60 transition-all duration-300 text-lg sm:text-xl hover:scale-110 focus:outline-none rounded p-1"
                    aria-label={link.label}
                    role="listitem"
                  >
                    {link.icon}
                  </a>
                ))}
              </span>
            </p>
          </div>
        </div>
        
        {/* Bubbles section - Enhanced with accessibility */}
        <div className="border-t border-blue-500/20 mt-3 sm:mt-2 py-3 sm:py-4 bubble-container">
          <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full justify-center sm:justify-start" role="list" aria-label="Skills and interests">
            {bubbles.map((bubble) => (
              <div 
                key={bubble.id}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-400/30 rounded-full flex items-center gap-1.5 sm:gap-2 relative cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-blue-500/20 hover:shadow-xl overflow-visible focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                onMouseEnter={() => handleMouseEnter(bubble.id)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => handleBubbleInteraction(bubble.id, e)}
                onClick={(e) => !isMobile && handleBubbleInteraction(bubble.id, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBubbleInteraction(bubble.id, e);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={bubble.additionalInfo ? `${bubble.label}: ${bubble.additionalInfo}` : bubble.label}
                aria-expanded={hoveredBubble === bubble.id}
              >
                <div className="flex-shrink-0 text-blue-200 text-sm sm:text-base" aria-hidden="true">
                  {bubble.icon}
                </div>
                <span className="tracking-tight font-medium text-xs sm:text-sm text-blue-100">{bubble.label}</span>
                
                {bubble.additionalInfo && hoveredBubble === bubble.id && (
                  <div 
                    className={`
                      absolute transform -translate-x-1/2 
                      bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-blue-400/30 rounded-xl 
                      text-blue-100 text-xs w-max max-w-[200px] shadow-2xl shadow-blue-500/20 z-50 
                      transition-all duration-300 p-3 backdrop-blur-sm text-center
                      ${fadingBubble === bubble.id ? 'tooltip-close' : 'tooltip-popup'}
                    `}
                    style={{
                      bottom: 'calc(100% + 10px)',
                      left: '50%',
                      pointerEvents: 'none'
                    }}
                    role="tooltip"
                    aria-live="polite"
                  >
                    {bubble.additionalInfo}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-gradient-to-br from-gray-800 to-gray-900 border-r border-b border-blue-400/30" aria-hidden="true"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* About Me section - Enhanced readability */}
        <div className="border-t border-blue-500/20 mt-3 sm:mt-2 pt-3 sm:pt-4 pb-2">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-blue-50/90 leading-relaxed tracking-normal">
              I&apos;m a software enthusiast driven by a love for clean code, creative problem-solving, and constant learning. I get a kick out of debugging, building systems that just work, and experimenting with the latest in tech.
            </p>
            <p className="text-sm sm:text-base text-blue-50/90 leading-relaxed tracking-normal">
              I&apos;m always looking to grow whether that&apos;s diving into a new framework, collaborating with a team, or literally scuba diving (yes, I do that too). I&apos;m a gamer and someone who finds joy in cooking from scratch.
            </p>
            <p className="text-sm sm:text-base text-blue-50/90 leading-relaxed tracking-normal">
              I thrive in environments where curiosity, teamwork, and hands-on building meet. If there&apos;s a challenge, I&apos;m all in.
            </p>
          </div>
        </div>
        
        {/* Debug indicator - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="hidden text-xs text-gray-500 mt-2">
            Debug: {hoveredBubble !== null ? `Hovering bubble ${hoveredBubble}` : 'Not hovering'}
          </div>
        )}
      </div>
    </div>
  );
});

// Set display name for better debugging
ProfileCard.displayName = 'ProfileCard';

// Enhanced tooltip styles with better animations and modern design
const TOOLTIP_STYLES = `
  .tooltip-popup {
    animation: tooltipPopup 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  .tooltip-close {
    animation: tooltipClose 0.25s ease-in forwards;
  }
  
  @keyframes tooltipPopup {
    0% {
      opacity: 0;
      transform: translate(-50%, 15px) scale(0.8);
      filter: blur(4px);
    }
    50% {
      transform: translate(-50%, -5px) scale(1.05);
      filter: blur(1px);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }
  }
  
  @keyframes tooltipClose {
    0% {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }
    50% {
      transform: translate(-50%, -3px) scale(0.95);
      filter: blur(1px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, 12px) scale(0.8);
      filter: blur(4px);
    }
  }
`;

// Optimized styles injection - only add once and handle SSR
const injectStyles = (() => {
  let injected = false;
  return () => {
    if (typeof document !== 'undefined' && !injected && !document.querySelector('#profile-card-styles')) {
      try {
        const style = document.createElement('style');
        style.id = 'profile-card-styles';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(TOOLTIP_STYLES));
        document.head.appendChild(style);
        injected = true;
      } catch (error) {
        console.warn('Failed to inject ProfileCard styles:', error);
      }
    }
  };
})();

// Inject styles
injectStyles();

export default ProfileCard;