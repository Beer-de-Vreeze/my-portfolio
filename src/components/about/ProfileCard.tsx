import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt, FaGlobe, FaGamepad, FaLightbulb, FaFish, FaMedkit, FaUtensils, FaGithub, FaLinkedin, FaFileAlt } from 'react-icons/fa';

interface Bubble {
  icon: React.JSX.Element;
  label: string;
  additionalInfo?: string;
}

interface ProfileCardProps {
  name?: string;
  username?: string;
  bubbles?: Bubble[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  name = "Beer de Vreeze", 
  username = "@bjeer.peer",  
  bubbles = [
    { 
      icon: <FaMapMarkerAlt className="w-4 h-4 text-white" />, 
      label: "Beusichem, Netherlands",
    },
    { 
      icon: <FaGlobe className="w-4 h-4 text-white" />, 
      label: "Dutch",
      additionalInfo: "Native" 
    },
    { 
      icon: <FaGlobe className="w-4 h-4 text-white" />, 
      label: "English",
      additionalInfo: "Professional" 
    },
    { 
      icon: <FaGamepad className="w-4 h-4 text-white" />, 
      label: "Gaming",
      additionalInfo: "Passionate about gaming" 
    },
    { 
      icon: <FaLightbulb className="w-4 h-4 text-white" />, 
      label: "Tech Enthusiast",
      additionalInfo: "More than just a hobby - constantly exploring new technologies" 
    },
    { 
      icon: <FaMedkit className="w-4 h-4 text-white" />, 
      label: "First Aid",
      additionalInfo: "Certified first aid provider" 
    },
    { 
      icon: <FaFish className="w-4 h-4 text-white" />, 
      label: "Scuba Diver",
      additionalInfo: "Certified diver exploring underwater worlds" 
    },
    { 
      icon: <FaUtensils className="w-4 h-4 text-white" />, 
      label: "Cooking",
      additionalInfo: "Passionate about culinary arts" 
    }
  ]
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<number | null>(null);
  const [fadingBubble, setFadingBubble] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile/touch - updated detection
  useEffect(() => {
    const checkIfMobile = () => {
      // More specific mobile detection
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Only consider it mobile if it's both touch-enabled AND has a small screen OR is a known mobile device
      setIsMobile((isTouchDevice && isSmallScreen) || isMobileDevice);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
            }, 200);
          }
          return prev;
        });
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobile]); // Remove hoveredBubble from dependencies

  // Clear fading bubble after animation completes
  useEffect(() => {
    if (fadingBubble !== null) {
      const timer = setTimeout(() => {
        setFadingBubble(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [fadingBubble]);

  const handleMouseEnter = (index: number) => {
    if (!isMobile) {
      // Clear any pending fade animation
      setFadingBubble(null);
      setHoveredBubble(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredBubble(prev => {
        if (prev !== null) {
          setFadingBubble(prev);
          // Reduced timeout for faster transitions
          setTimeout(() => {
            setFadingBubble(null);
          }, 200);
          return null; // Immediately set to null instead of returning prev
        }
        return prev;
      });
    }
  };

  const handleBubbleInteraction = (index: number, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isMobile) {
      // On mobile, toggle the tooltip
      setHoveredBubble(prev => {
        if (prev === index) {
          setFadingBubble(index);
          setTimeout(() => {
            setFadingBubble(null);
          }, 200);
          return null; // Return null immediately
        } else {
          setFadingBubble(null);
          return index;
        }
      });
    } else {
      // Desktop behavior - click to close
      setHoveredBubble(prev => {
        if (prev === index) {
          setFadingBubble(index);
          setTimeout(() => {
            setFadingBubble(null);
          }, 200);
          return null; // Return null immediately
        }
        return prev;
      });
    }
  };

  return (
    <div className="w-full max-w-[500px] h-auto md:w-[495px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4">
      <div className="w-full">
        {/* Profile header - existing code */}
        <div className="flex items-center justify-start gap-3 mb-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 border-2 border-gray-600 shadow-md">
            <Image 
              src="/images/Beer.webp" 
              alt="Profile" 
              width={80}
              height={80}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-start gap-0.5 pt-8">
            <h2 className="text-2xl font-bold text-white tracking-tighter">{name}</h2>
            <p className="text-base text-gray-400 tracking-tighter font-extralight flex items-center gap-2">
              {username}
              <span className="flex items-center gap-2 ml-2">
                <a href="https://github.com/Beer-de-Vreeze" target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400 transition-colors text-lg">
                  <FaGithub />
                </a>
                <a href="https://www.linkedin.com/in/beer-de-vreeze-59040919a/" target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400 transition-colors text-lg">
                  <FaLinkedin />
                </a>
                <a href="https://bjeerpeer.itch.io/" target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400 transition-colors text-lg">
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 512 512" 
                    fill="currentColor"
                    className="w-[1em] h-[1em]"
                  >
                    <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z"/>
                  </svg>
                </a>
                <a href="/downloads/Beer%20de%20Vreeze%20CV.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400 transition-colors text-lg">
                  <FaFileAlt />
                </a>
              </span>
            </p>
          </div>
        </div>
        
        {/* Bubbles section - modified for mobile touch behavior */}
        <div className="border-t border-[#27272a] mt-1 py-3 bubble-container">
          <div className="flex flex-wrap gap-2 w-full">
            {bubbles.map((bubble, index) => (
              <div 
                key={index} 
                className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 relative cursor-pointer shadow-md transition-transform duration-200 hover:scale-[1.03] overflow-visible"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => handleBubbleInteraction(index, e)}
                onClick={(e) => !isMobile && handleBubbleInteraction(index, e)}
              >
                <div className="flex-shrink-0">
                  {bubble.icon}
                </div>
                <span className="tracking-tighter font-extralight text-sm text-white">{bubble.label}</span>
                
                {bubble.additionalInfo && hoveredBubble === index && (
                  <div 
                    className={`
                      absolute transform -translate-x-1/2 
                      bg-gray-800 border border-[#27272a] rounded-xl 
                      text-white text-xs w-max max-w-[180px] shadow-lg z-50 
                      transition-all duration-200 p-2.5
                      ${fadingBubble === index ? 'tooltip-close' : 'tooltip-popup'}
                    `}
                    style={{
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      pointerEvents: 'none'
                    }}
                  >
                    {bubble.additionalInfo}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-[#27272a]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* About Me section */}
        <div className="border-t border-[#27272a] mt-1 pt-1 pb-0">
          <div>
            <p className="text-base text-gray-300 leading-tight tracking-tight mb-3">
              I&apos;m a software enthusiast driven by a love for clean code, creative problem-solving, and constant learning. I get a kick out of debugging, building systems that just work, and experimenting with the latest in tech.
            </p>
            <p className="text-base text-gray-300 leading-tight tracking-tight mb-3">
              I&apos;m always looking to grow whether that&apos;s diving into a new framework, collaborating with a team, or literally scuba diving (yes, I do that too). I&apos;m a gamer and someone who finds joy in cooking from scratch.
            </p>
            <p className="text-base text-gray-300 leading-tight tracking-tight mb-0">
              I thrive in environments where curiosity, teamwork, and hands-on building meet. If there&apos;s a challenge, I&apos;s all in.
            </p>
          </div>
        </div>
        
        {/* Debug indicator */}
        <div className="hidden">{hoveredBubble !== null ? `Hovering bubble ${hoveredBubble}` : 'Not hovering'}</div>
      </div>
    </div>
  );
};

// Enhanced tooltip styles with close animation - moved outside component
const tooltipStyles = `
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

// Add styles only once
if (typeof document !== 'undefined' && !document.querySelector('#profile-card-styles')) {
  const style = document.createElement('style');
  style.id = 'profile-card-styles';
  style.type = 'text/css';
  style.appendChild(document.createTextNode(tooltipStyles));
  document.head.appendChild(style);
}

export default ProfileCard;