import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SiReact, SiUnity, SiGithub, SiJavascript, SiTypescript, SiHtml5, SiCss3, SiNodedotjs, SiMongodb, SiPostgresql, SiDocker, SiKubernetes, SiGooglecloud, SiFirebase, SiRedux, SiNextdotjs, SiTailwindcss, SiDotnet, SiBlender, SiAdobephotoshop, SiAngular, SiSass, SiWebpack, SiJest, SiGraphql, SiMysql, SiPhp, SiPython, SiCplusplus, SiUnrealengine, SiGodotengine, SiElectron, SiFlutter, SiDart, SiSwift, SiKotlin, SiRust, SiGo, SiRuby, SiLaravel, SiDjango, SiSpring, SiExpress, SiFastapi, SiNestjs, SiWebassembly, SiTensorflow, SiPytorch, SiOpencv, SiVercel, SiNetlify, SiHeroku, SiDigitalocean, SiVim, SiIntellijidea, SiXcode, SiAndroidstudio } from 'react-icons/si'; // Import original logos
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Import arrow icons

// Define the media item type
interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string; // Alt text for images, title for videos
}

interface ProjectCardProps {
  media: MediaItem[]; // Replace single image with array of media items
  title: string;
  techStack: string[];
  description?: string;
  features?: string[];
  liveLink?: string;
  githubLink?: string;
  contributors?: string[];
  onModalStateChange?: (isOpen: boolean) => void;
}

const techIcons: { [key: string]: JSX.Element } = {
  "React": <SiReact className="text-blue-500 text-lg mr-2" />,
  "Unity": <SiUnity className="text-white text-lg mr-2" />,
  "GitHub": <SiGithub className="text-gray-800 text-lg mr-2" />,
  "JavaScript": <SiJavascript className="text-yellow-500 text-lg mr-2" />,
  "TypeScript": <SiTypescript className="text-blue-500 text-lg mr-2" />,
  "HTML5": <SiHtml5 className="text-orange-500 text-lg mr-2" />,
  "CSS3": <SiCss3 className="text-blue-500 text-lg mr-2" />,
  "Node.js": <SiNodedotjs className="text-green-500 text-lg mr-2" />,
  "MongoDB": <SiMongodb className="text-green-500 text-lg mr-2" />,
  "PostgreSQL": <SiPostgresql className="text-blue-500 text-lg mr-2" />,
  "Docker": <SiDocker className="text-blue-500 text-lg mr-2" />,
  "Kubernetes": <SiKubernetes className="text-blue-500 text-lg mr-2" />,
  "Google Cloud": <SiGooglecloud className="text-blue-500 text-lg mr-2" />,
  "Firebase": <SiFirebase className="text-yellow-500 text-lg mr-2" />,
  "Redux": <SiRedux className="text-purple-500 text-lg mr-2" />,
  "Next.js": <SiNextdotjs className="text-white text-lg mr-2" />,
  "Tailwind CSS": <SiTailwindcss className="text-blue-500 text-lg mr-2" />,
  "C#": <SiDotnet className="text-purple-500 text-lg mr-2" />,
  "Blender": <SiBlender className="text-orange-600 text-lg mr-2" />,
  "Photoshop": <SiAdobephotoshop className="text-blue-500 text-lg mr-2" />,
  "Angular": <SiAngular className="text-red-600 text-lg mr-2" />,
  "Sass": <SiSass className="text-pink-500 text-lg mr-2" />,
  "Webpack": <SiWebpack className="text-blue-500 text-lg mr-2" />,
  "Jest": <SiJest className="text-red-500 text-lg mr-2" />,
  "GraphQL": <SiGraphql className="text-pink-500 text-lg mr-2" />,
  "MySQL": <SiMysql className="text-blue-500 text-lg mr-2" />,
  "PHP": <SiPhp className="text-purple-500 text-lg mr-2" />,
  "Python": <SiPython className="text-yellow-500 text-lg mr-2" />,
  "C++": <SiCplusplus className="text-blue-500 text-lg mr-2" />,
  "Unreal Engine": <SiUnrealengine className="text-black text-lg mr-2" />,
  "Godot": <SiGodotengine className="text-blue-500 text-lg mr-2" />,
  "Electron": <SiElectron className="text-blue-500 text-lg mr-2" />,
  "Flutter": <SiFlutter className="text-blue-500 text-lg mr-2" />,
  "Dart": <SiDart className="text-blue-500 text-lg mr-2" />,
  "Swift": <SiSwift className="text-orange-500 text-lg mr-2" />,
  "Kotlin": <SiKotlin className="text-purple-500 text-lg mr-2" />,
  "Rust": <SiRust className="text-black text-lg mr-2" />,
  "Go": <SiGo className="text-blue-500 text-lg mr-2" />,
  "Ruby": <SiRuby className="text-red-500 text-lg mr-2" />,
  "Laravel": <SiLaravel className="text-red-500 text-lg mr-2" />,
  "Django": <SiDjango className="text-green-500 text-lg mr-2" />,
  "Spring": <SiSpring className="text-green-500 text-lg mr-2" />,
  "Express": <SiExpress className="text-black text-lg mr-2" />,
  "FastAPI": <SiFastapi className="text-green-500 text-lg mr-2" />,
  "NestJS": <SiNestjs className="text-red-500 text-lg mr-2" />,
  "WebAssembly": <SiWebassembly className="text-blue-500 text-lg mr-2" />,
  "TensorFlow": <SiTensorflow className="text-orange-500 text-lg mr-2" />,
  "PyTorch": <SiPytorch className="text-orange-500 text-lg mr-2" />,
  "OpenCV": <SiOpencv className="text-blue-500 text-lg mr-2" />,
  "Vercel": <SiVercel className="text-black text-lg mr-2" />,
  "Netlify": <SiNetlify className="text-blue-500 text-lg mr-2" />,
  "Heroku": <SiHeroku className="text-purple-500 text-lg mr-2" />,
  "DigitalOcean": <SiDigitalocean className="text-blue-500 text-lg mr-2" />,
  "Vim": <SiVim className="text-green-500 text-lg mr-2" />,
  "IntelliJ IDEA": <SiIntellijidea className="text-black text-lg mr-2" />,
  "Xcode": <SiXcode className="text-blue-500 text-lg mr-2" />,
  "Android Studio": <SiAndroidstudio className="text-green-500 text-lg mr-2" />
};

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  media = [{ type: 'image', src: "/path/to/wip-image-library/placeholder.jpg", alt: "Project thumbnail" }], 
  title, 
  techStack,
  description = "Project description goes here. This is a brief overview of the project and its main features.",
  features = ["Feature one description", "Feature two description", "Feature three description"],
  liveLink = "#",
  githubLink: sourceLink = "#",
  contributors = ["Developer Name"],
  onModalStateChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Predefined color palette for contributor indicators
  const contributorColors = [
    '#FF6B6B', '#48BEFF', '#4ECB71', '#FFD93D', '#B983FF', 
    '#FF9F45', '#3DEFE9', '#FF78C4', '#7158E2', '#17C3B2', 
    '#FFC857', '#4E8FF7', '#FB5607', '#3A86FF', '#8AC926'
  ];

  // Get the thumbnail image (first image or video thumbnail)
  const thumbnailImage = media[0]?.src || "/path/to/wip-image-library/placeholder.jpg";

  const closeModal = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      onModalStateChange?.(false);
    }, 300);
  };
  
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscKey);
      onModalStateChange?.(true);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, onModalStateChange]);

  const handleTechIconClick = (tech: string) => {
    console.log(`${tech} icon clicked`);
  };

  const goToNextMedia = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const goToPreviousMedia = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  const handleVideoEnd = () => {
    setIsPlaying(false);
  };
  
  const renderVideoControls = () => {
    if (!isVideo) return null;

    return (
      <div 
        className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
        onClick={handleVideoToggle}
      >
        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div 
            className="bg-black/50 hover:bg-black/70 p-4 rounded-full 
              transition-all duration-300 group"
          >
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white group-hover:scale-110 transition-transform"
            >
              <path 
                d="M8 5V19L19 12L8 5Z" 
                fill="currentColor" 
              />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const goToMedia = (index: number) => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentMediaIndex(index);
  };

  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';

  return (
    <>
      {/* Project Card - Improved Mobile Responsiveness */}
      <div 
        onClick={() => setIsModalOpen(true)}
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
        className={`relative z-10 flex flex-col justify-between p-4 sm:p-5 bg-[#111111] border border-[#2a2a2a] rounded-lg transition-all duration-300 hover:border-[#4a4a4a] hover:translate-y-[-4px] overflow-hidden cursor-pointer w-full max-w-[500px] mx-auto h-48 sm:h-56 ${isClicked ? 'scale-95' : ''}`}
      >
        <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20">
          <Image 
            src={thumbnailImage} 
            alt={title} 
            fill 
            sizes="(max-width: 768px) 100vw, 400px"
            className="blur-[2px] object-cover" 
          />
        </div>
        
        {/* Card content - remains unchanged */}
        <div className="relative z-10">
          <h3 className="text-white text-xl sm:text-2xl font-medium mb-2 truncate">
            {title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{description.split('.')[0]}.</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-1.5 mt-auto">
          {techStack.slice(0, 4).map((tech, index) => (
            <span 
              key={index} 
              className="px-4 py-2 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-xs"
              onClick={() => handleTechIconClick(tech)}
            >
              {techIcons[tech] || null} {tech}
            </span>
          ))}
          {techStack.length > 4 && (
            <span className="px-4 py-2 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-xs">
              +{techStack.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Modal - Improved Mobile Responsiveness */}
      {(isModalOpen || isClosing) && (
        <div 
          className={`fixed inset-0 z-[1050] flex items-center justify-center bg-black/95 backdrop-blur-sm 
            ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'} 
            transition-opacity duration-300 ease-in-out py-2 sm:py-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Close button - Fixed in viewport, scrolls with user */}
          <button 
            onClick={closeModal}
            className="fixed top-4 right-4 z-[1060] bg-black/70 hover:bg-black/90 
              rounded-full p-3 w-10 h-10 flex items-center justify-center
              text-gray-300 hover:text-white transition-all duration-200
              shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Modal Content - Fully Responsive Layout */}
          <div 
            className={`w-full max-w-7xl ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'} 
              transition-transform duration-300 ease-in-out py-6 overflow-y-auto 
              max-h-[90vh] my-auto`}
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 px-4 sm:px-10">
              {/* Left Column - Slideshow media and Buttons */}
              <div className="lg:w-2/5 flex flex-col">
                {/* Media Slideshow Container */}
                <div className="relative w-full rounded-xl overflow-hidden border border-[#333333] mb-4">
                  {/* Media Content */}
                  <div className="relative aspect-video w-full">
                    {isVideo ? (
                      <>
                        <video 
                          ref={videoRef}
                          src={currentMedia.src} 
                          className="w-full h-full object-cover" 
                          controls={false}
                          onEnded={handleVideoEnd}
                        />
                        {renderVideoControls()}
                      </>
                    ) : (
                      <Image 
                        src={currentMedia.src} 
                        alt={currentMedia.alt || title} 
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover"
                      />
                    )}

                    {/* Navigation Arrows - Only show if more than 1 media */}
                    {media.length > 1 && (
                      <>
                        {/* Previous Media Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); goToPreviousMedia(); }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 
                            bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 
                            flex items-center justify-center transition-all duration-300 
                            hover:scale-110 group"
                          aria-label="Previous media"
                        >
                          <FaArrowLeft size={20} className="text-white group-hover:text-blue-400" />
                        </button>

                        {/* Next Media Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); goToNextMedia(); }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 
                            bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 
                            flex items-center justify-center transition-all duration-300 
                            hover:scale-110 group"
                          aria-label="Next media"
                        >
                          <FaArrowRight size={20} className="text-white group-hover:text-blue-400" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Indicators for multiple media */}
                  {media.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                      {media.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { 
                            e.stopPropagation();
                            goToMedia(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentMediaIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to media ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Media type indicator */}
                  <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-medium z-20">
                    {currentMediaIndex + 1}/{media.length}
                  </div>
                </div>
                
                {/* Buttons - Full Width on Mobile, Stacked */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={liveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                      hover:from-blue-700 hover:to-purple-700 text-white rounded-md text-sm font-medium 
                      transition-all flex items-center justify-center gap-2"
                  >
                    Live Demo
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 5L21 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a 
                    href={sourceLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 text-center py-3 bg-[#1a1a1a] border border-[#333333] 
                      hover:border-[#555555] text-white rounded-md text-sm font-medium 
                      transition-colors flex items-center justify-center gap-2"
                  >
                    Source Code
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Right Column - Remains mostly unchanged */}
              <div className="lg:w-3/5 mt-4 lg:mt-0">
                {/* Title and Description */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent leading-tight">
                    {title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-base sm:text-[1rem]">
                    {description}
                  </p>
                </div>
                
                {/* Rest of the content - features, tech stack, contributors remains the same */}
                <hr className="border-t border-[#2a2a2a] my-6" />
                
                {/* Features - Compact and Readable */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent">
                    Features
                  </h2>
                  <ul className="grid grid-cols-1 gap-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-purple-500 mt-1 flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <hr className="border-t border-[#2a2a2a] my-6" />
                
                {/* Tech Stack - Flexible Wrapping */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent">
                    Built with
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, index) => (
                      <span 
                        key={index} 
                        className="px-5 py-3 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-sm"
                        onClick={() => handleTechIconClick(tech)}
                      >
                        {techIcons[tech] || null} {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <hr className="border-t border-[#2a2a2a] my-6" />
                
                {/* Contributors - Responsive Wrapping */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent">
                    Contributors
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {contributors.map((contributor, index) => {
                      const circleColor = contributorColors[index % contributorColors.length];
                      return (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-2 px-5 py-3 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-sm"
                        >
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: circleColor }}
                          ></span>
                          {contributor}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCard;