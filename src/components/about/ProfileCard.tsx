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
    <div className={`w-full max-w-[500px] h-auto md:w-[495px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4 ${className}`}>
      <div className="w-full">
        {/* Profile header */}
        <div className="flex items-center justify-start gap-3 mb-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 border-2 border-gray-600 shadow-md">
            <Image 
              src="/images/Beer.webp" 
              alt={`${name} profile picture`}
              width={80}
              height={80}
              className="w-full h-full object-cover object-center"
              priority
            />
          </div>
          <div className="flex flex-col justify-start gap-0.5 pt-8">
            <h2 className="text-2xl font-bold text-white tracking-tighter">{name}</h2>
            <p className="text-base text-gray-400 tracking-tighter font-extralight flex items-center gap-2">
              {username}
              <span className="flex items-center gap-2 ml-2" role="list" aria-label="Social media links">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white text-gray-400 transition-colors text-lg focus:outline-none rounded"
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
        <div className="border-t border-[#27272a] mt-1 py-3 bubble-container">
          <div className="flex flex-wrap gap-2 w-full" role="list" aria-label="Skills and interests">
            {bubbles.map((bubble) => (
              <div 
                key={bubble.id}
                className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 relative cursor-pointer shadow-md transition-transform duration-200 hover:scale-[1.03] overflow-visible focus:outline-none"
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
                <div className="flex-shrink-0" aria-hidden="true">
                  {bubble.icon}
                </div>
                <span className="tracking-tighter font-extralight text-sm text-white">{bubble.label}</span>
                
                {bubble.additionalInfo && hoveredBubble === bubble.id && (
                  <div 
                    className={`
                      absolute transform -translate-x-1/2 
                      bg-gray-800 border border-[#27272a] rounded-xl 
                      text-white text-xs w-max max-w-[180px] shadow-lg z-50 
                      transition-all duration-200 p-2.5
                      ${fadingBubble === bubble.id ? 'tooltip-close' : 'tooltip-popup'}
                    `}
                    style={{
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      pointerEvents: 'none'
                    }}
                    role="tooltip"
                    aria-live="polite"
                  >
                    {bubble.additionalInfo}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-[#27272a]" aria-hidden="true"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* About Me section - Enhanced readability */}
        <div className="border-t border-[#27272a] mt-1 pt-1 pb-0">
          <div>
            <p className="text-base text-gray-300 leading-tight tracking-tight mb-3">
              I&apos;m a software enthusiast driven by a love for clean code, creative problem-solving, and constant learning. I get a kick out of debugging, building systems that just work, and experimenting with the latest in tech.
            </p>
            <p className="text-base text-gray-300 leading-tight tracking-tight mb-3">
              I&apos;m always looking to grow whether that&apos;s diving into a new framework, collaborating with a team, or literally scuba diving (yes, I do that too). I&apos;m a gamer and someone who finds joy in cooking from scratch.
            </p>
            <p className="text-base text-gray-300 leading-tight tracking-tight mb-0">
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

// Enhanced tooltip styles with better animations
const TOOLTIP_STYLES = `
  .tooltip-popup {
    animation: tooltipPopup 0.2s ease-out forwards;
  }
  
  .tooltip-close {
    animation: tooltipClose 0.2s ease-in forwards;
  }
  
  @keyframes tooltipPopup {
    0% {
      opacity: 0;
      transform: translate(-50%, 10px) scale(0.9);
    }
    50% {
      transform: translate(-50%, -3px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
    }
  }
  
  @keyframes tooltipClose {
    0% {
      opacity: 1;
      transform: translate(-50%, 0) scale(1);
    }
    50% {
      transform: translate(-50%, -2px) scale(0.98);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, 8px) scale(0.9);
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