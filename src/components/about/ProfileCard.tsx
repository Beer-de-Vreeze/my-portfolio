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
  // Clear fading bubble after animation completes
  useEffect(() => {
    if (fadingBubble !== null) {
      const timer = setTimeout(() => {
        setFadingBubble(null);
      }, 300); // Match this with the CSS transition duration
      
      return () => clearTimeout(timer);
    }
  }, [fadingBubble]);

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
        {/* Profile header - existing code */}        <div className="flex items-center justify-start gap-3 mb-0">
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" width="1em" height="1em">
                    <path d="M8 12C5.79086 12 4 13.7909 4 16V48C4 50.2091 5.79086 52 8 52H56C58.2091 52 60 50.2091 60 48V16C60 13.7909 58.2091 12 56 12H8ZM8 16H56V48H8V16ZM16 20C13.7909 20 12 21.7909 12 24V40C12 42.2091 13.7909 44 16 44H48C50.2091 44 52 42.2091 52 40V24C52 21.7909 50.2091 20 48 20H16ZM16 24H48V40H16V24ZM20 28V36H24V32H40V36H44V28H40V32H24V28H20Z"/>
                  </svg>
                </a>
                <a href="/downloads/Beer%20de%20Vreeze%20CV.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white text-gray-400 transition-colors text-lg">
                  <FaFileAlt />
                </a>
              </span>
            </p>
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