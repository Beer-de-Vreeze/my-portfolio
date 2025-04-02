import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaGlobe, FaGamepad, FaLightbulb, FaFish, FaMedkit } from 'react-icons/fa';

interface Bubble {
  icon: JSX.Element;
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
      label: "Gamer",
      additionalInfo: "Passionate about gaming" 
    },
    { 
      icon: <FaLightbulb className="w-4 h-4 text-white" />, 
      label: "Tech Enthusiast",
      additionalInfo: "More than just a hobby - constantly exploring new technologies" 
    },
    { 
      icon: <FaMedkit className="w-4 h-4 text-white" />, 
      label: "EHBO",
      additionalInfo: "Certified first aid provider" 
    },
    { 
      icon: <FaFish className="w-4 h-4 text-white" />, 
      label: "Scuba Diver",
      additionalInfo: "Certified diver exploring underwater worlds" 
    }
  ]
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<number | null>(null);
  const [fadingBubble, setFadingBubble] = useState<number | null>(null);
  const [animatingBubble, setAnimatingBubble] = useState<number | null>(null);

  // Clear fading bubble after animation completes
  useEffect(() => {
    if (fadingBubble !== null) {
      const timer = setTimeout(() => {
        setFadingBubble(null);
      }, 300); // Match this with the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [fadingBubble]);

  // Handle pop-up animation on hover
  useEffect(() => {
    if (hoveredBubble !== null) {
      setAnimatingBubble(hoveredBubble);
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setAnimatingBubble(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [hoveredBubble]);

  const handleBubbleClick = (index: number) => {
    if (hoveredBubble === index) {
      setFadingBubble(index);
      setTimeout(() => setHoveredBubble(null), 300);
    }
  };

  return (
    <div className="w-full max-w-[500px] h-auto md:w-[495px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4">
      <div className="w-full">
        <div className="flex items-center justify-start gap-3 mb-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 border-2 border-gray-600 shadow-md">
            <img 
              src="/images/Beer.webp" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-start gap-0.5 pt-8">
            <h2 className="text-2xl font-bold text-white tracking-tighter">{name}</h2>
            <p className="text-base text-gray-400 tracking-tighter font-extralight">{username}</p>
          </div>
        </div>
        <div className="border-t border-[#27272a] mt-1 py-3">
          <div className="flex flex-wrap gap-2">
            {bubbles.map((bubble, index) => (
              <div 
                key={index} 
                className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 relative cursor-pointer shadow-md transition-transform duration-300 hover:scale-105"
                onMouseEnter={() => setHoveredBubble(index)}
                onMouseLeave={() => setHoveredBubble(null)}
                onClick={() => handleBubbleClick(index)}
              >
                {bubble.icon}
                <span className="tracking-tighter font-extralight text-sm text-white">{bubble.label}</span>
                
                {(hoveredBubble === index || fadingBubble === index) && bubble.additionalInfo && (
                  <div 
                    className={`
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 
                      bg-gray-800 border border-[#27272a] rounded-xl 
                      text-white text-xs w-max max-w-[180px] shadow-lg z-50 
                      transition-all duration-300 
                      ${fadingBubble === index ? 'opacity-0' : 'opacity-100'}
                      ${animatingBubble === index ? 'animate-tooltip-popup' : ''}
                    `}
                  >
                    {bubble.additionalInfo}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-[#27272a]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add a style block for the custom animation
const tooltipStyles = `
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

  .animate-tooltip-popup {
    animation: tooltipPopup 0.3s forwards;
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(tooltipStyles));
  document.head.appendChild(style);
}

export default ProfileCard;