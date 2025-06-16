import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaGlobe, FaGamepad, FaLightbulb, FaFish, FaMedkit, FaUtensils } from 'react-icons/fa';

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
  const [animatingBubble, setAnimatingBubble] = useState<number | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);

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
      setIsTooltipVisible(true);
      setAnimatingBubble(hoveredBubble);
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setAnimatingBubble(null);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setIsTooltipVisible(false);
    }
  }, [hoveredBubble]);

  const handleMouseEnter = (index: number) => {
    console.log('Mouse enter on bubble:', index);
    setHoveredBubble(index);
  };

  const handleMouseLeave = () => {
    console.log('Mouse leave');
    setHoveredBubble(null);
  };

  const handleBubbleClick = (index: number) => {
    console.log('Bubble clicked:', index);
    if (hoveredBubble === index) {
      setFadingBubble(index);
      setTimeout(() => setHoveredBubble(null), 300);
    }
  };

  return (
    <div className="w-full max-w-[500px] h-auto md:w-[495px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4">
      <div className="w-full">
        {/* Profile header - existing code */}
        <div className="flex items-center justify-start gap-3 mb-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 border-2 border-gray-600 shadow-md">
            <img 
              src="/images/Beer.webp" 
              alt="Profile" 
              className="w-full h-full object-cover object-center"
            />          </div>
          <div className="flex flex-col justify-start gap-0.5 pt-8">
            <h2 className="text-2xl font-bold text-white tracking-tighter">{name}</h2>
            <p className="text-base text-gray-400 tracking-tighter font-extralight">{username}</p>
          </div>
        </div>
        
        {/* Bubbles section - modified for better fit */}
        <div className="border-t border-[#27272a] mt-1 py-3">
          <div className="flex flex-wrap gap-2 w-full">
            {bubbles.map((bubble, index) => (
              <div 
                key={index} 
                className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 relative cursor-pointer shadow-md transition-transform duration-200 hover:scale-[1.03] overflow-visible"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleBubbleClick(index)}
              >
                <div className="flex-shrink-0">
                  {bubble.icon}
                </div>
                <span className="tracking-tighter font-extralight text-sm text-white">{bubble.label}</span>
                
                {bubble.additionalInfo && hoveredBubble === index && (
                  <div 
                    className={`
                      fixed transform -translate-x-1/2 
                      bg-gray-800 border border-[#27272a] rounded-xl 
                      text-white text-xs w-max max-w-[180px] shadow-lg z-50 
                      transition-all duration-300 p-2.5
                      ${fadingBubble === index ? 'opacity-0' : 'opacity-100'}
                      tooltip-popup
                    `}
                    style={{
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      pointerEvents: 'none'
                    }}
                  >
                    {bubble.additionalInfo}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-[#27272a]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Debug indicator */}
        <div className="hidden">{hoveredBubble !== null ? `Hovering bubble ${hoveredBubble}` : 'Not hovering'}</div>
      </div>
    </div>
  );
};

// Replace dynamic style injection with a static class
const tooltipStyles = `
  .tooltip-popup {
    animation: tooltipPopup 0.3s forwards;
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
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(tooltipStyles));
  document.head.appendChild(style);
}

export default ProfileCard;