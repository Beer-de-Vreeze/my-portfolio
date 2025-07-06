import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

// Enhanced TypeScript interface with readonly properties for better type safety
interface School {
  readonly name: string;
  readonly educationType: string;
  readonly logo: string;
  readonly subtitle: string;
  readonly finishedDate: string;
  readonly program?: readonly string[];
  readonly technologies?: readonly string[];
}

// Combined modal state for better state management
interface ModalState {
  readonly isOpen: boolean;
  readonly isAnimatingOut: boolean;
}

const EducationCard: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    isAnimatingOut: false
  });
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  
  // Refs for better accessibility
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Readonly array for better type safety and performance
  const schools: readonly School[] = [
    {
      name: 'Lek en Linge',
      educationType: 'VMBO-TL',
      logo: '/images/lek-en-linge.webp',
      subtitle: 'High School',
      finishedDate: '06.2021',
      program: [
        'Dutch Language and Literature: Advanced reading, writing, and communication skills.',
        'English: Conversational and written English proficiency.',
        'Mathematics: Algebra, geometry, and statistical analysis.',
        'History and Geography: European and world history, geographic knowledge.',
        'Biology: Basic life sciences and natural world understanding.',
        'Physical Education: Sports, fitness, and health awareness.'
      ],
      technologies: [
        'Critical Thinking',
        'Communication Skills',
        'Problem Solving',
        'Research Methods',
        'Academic Writing'
      ]
    },
    {
      name: 'ROC Midden Nederland',
      educationType: 'MBO',
      logo: '/images/roc.webp',
      subtitle: 'Chef Training',
      finishedDate: '09.2022 - 09.2023',
      program: [
        'Menu Planning and Preparation: Designing and executing diverse menus.',
        'Advanced Cooking Techniques: Mastering methods such as sautéing, grilling, roasting, and steaming.',
        'Kitchen Management: Handling orders, inventory control, and ensuring quality standards.',
        'Hygiene and Safety: Adhering to HACCP guidelines and maintaining a safe kitchen environment.',
        'Practical Experience: Extensive hands-on training in professional kitchen settings under expert guidance.'
      ],
      technologies: [
        'Culinary Expertise',
        'Creativity',
        'Organizational Skills',
        'Hygiene and Safety Compliance',
        'Independence'
      ]
    },
    {
      name: 'GLU',
      educationType: 'MBO',
      logo: '/images/GLU.webp',
      subtitle: 'Game Development',
      finishedDate: '09.2023 - present',
      program: [
        'Learning programming languages like C#​',
        'Exploring game design and development principles',
        'Building immersive experiences with Unity and industry-standard tools',
        'Developing engaging games – Unity, Git and SCRUM',
        'Collaborating effectively between programmers, artists, and designers'
      ],
      technologies: ['Unity', 'C#', 'Git', 'Game Design', 'SCRUM']
    }
  ] as const;
  
  // Enhanced toggleModal with better state management
  const toggleModal = useCallback((school: School | null) => {
    if (school) {
      setActiveSchool(school);
      setModalState({ isOpen: true, isAnimatingOut: false });
    } else {
      setModalState(prev => ({ ...prev, isAnimatingOut: true }));
      setTimeout(() => {
        setModalState({ isOpen: false, isAnimatingOut: false });
        setActiveSchool(null);
      }, 300);
    }
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState.isOpen) {
        e.preventDefault();
        e.stopPropagation();
        toggleModal(null);
      }
    };

    if (modalState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus the close button when modal opens
      setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalState.isOpen, toggleModal]);

  return (
    <>
      <div className="w-full max-w-none sm:max-w-[800px] mx-auto">
        <div className="w-full bg-gradient-to-br from-gray-900/60 to-black/80 border border-blue-500/20 rounded-2xl shadow-xl backdrop-blur-sm p-3 sm:p-4 md:p-6 relative overflow-hidden group">
          {/* Enhanced background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-center border-b border-blue-500/20 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text">Education</h1>
            </div>
        
        <div 
          className="grid grid-cols-1 gap-3 sm:gap-4"
          role="region"
          aria-label="Education timeline"
        >
          {schools.map((school, index) => (
            <button
              key={`${school.name}-${index}`}
              className="relative flex items-center p-3 sm:p-4 pb-8 sm:pb-10 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-400/20 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-300/40 hover:shadow-blue-500/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer text-left w-full backdrop-blur-sm group/card"
              onClick={() => toggleModal(school)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleModal(school);
                }
              }}
              aria-label={`View details for ${school.name} - ${school.subtitle}`}
              aria-describedby={`education-${index}`}
              type="button"
            >
              <div className="rounded-xl mr-3 sm:mr-4 overflow-hidden border border-blue-400/20 shadow-lg group-hover/card:border-blue-300/40 transition-all duration-300 flex-shrink-0" aria-hidden="true">
                <Image 
                  src={school.logo} 
                  alt={`${school.name} logo`} 
                  width={60} 
                  height={60} 
                  className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] object-cover transition-transform duration-300 group-hover/card:scale-105"
                  priority={index < 2}
                />
              </div>
              <div className="flex-1 min-w-0" id={`education-${index}`}>
                <h3 className="text-blue-100 font-bold text-base sm:text-lg group-hover/card:text-white transition-colors duration-300 truncate">{school.name}</h3>
                <p className="text-blue-200/70 text-sm font-medium group-hover/card:text-blue-100 transition-colors duration-300">{school.subtitle}</p>
              </div>
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3" aria-hidden="true">
                <span className="px-2 sm:px-3 py-1 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-blue-200 backdrop-blur-sm group-hover/card:from-blue-400/30 group-hover/card:to-purple-400/30 group-hover/card:text-blue-100 transition-all duration-300">
                  {school.educationType || 'Education'}
                </span>
              </div>
            </button>
          ))}
        </div>
        </div>
      </div>
      </div>

      {/* Enhanced Modal with improved accessibility, performance, and fade animations - Now positioned relative to viewport */}
      {modalState.isOpen && activeSchool && typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] transition-all duration-300 ${
            modalState.isAnimatingOut 
              ? 'animate-fadeOut opacity-0' 
              : 'animate-fadeIn opacity-100'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleModal(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-content"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className={`bg-gradient-to-br from-gray-900/95 to-black/95 border border-blue-500/30 text-white rounded-2xl max-w-2xl w-full mx-3 sm:mx-4 max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-blue-500/10 backdrop-blur-md transform transition-all duration-300 ${
              modalState.isAnimatingOut 
                ? 'animate-fadeOut opacity-0 scale-95 translate-y-4' 
                : 'animate-fadeIn opacity-100 scale-100 translate-y-0'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
            
            {/* Enhanced close button with better accessibility */}
            <button 
              ref={closeButtonRef}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleModal(null);
              }}
              className="sticky top-3 sm:absolute sm:top-4 right-3 sm:right-4 z-[10000] bg-blue-900/50 hover:bg-blue-800/70 
                rounded-full p-2 sm:p-3 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center
                text-blue-200 hover:text-white transition-all duration-200
                shadow-lg backdrop-blur-sm border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 cursor-pointer ml-auto mb-2 sm:mb-0"
              aria-label={`Close ${activeSchool.name} details dialog`}
              type="button"
            >
              <svg 
                width="16" 
                height="16" 
                className="sm:w-5 sm:h-5"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path 
                  d="M18 6L6 18M6 6L18 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>
            
            <div className="p-4 sm:p-6 lg:p-8 relative z-10" id="modal-content">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                <div className="rounded-xl mb-3 sm:mb-0 sm:mr-4 lg:mr-6 overflow-hidden border border-blue-400/20 shadow-lg mx-auto sm:mx-0" aria-hidden="true">
                  <Image 
                    src={activeSchool.logo} 
                    alt={`${activeSchool.name} logo`} 
                    width={80} 
                    height={80}
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-24 lg:h-24 object-cover" 
                  />
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-blue-100">
                      {activeSchool.name}
                    </h2>
                    {activeSchool.educationType && (
                      <span 
                        className="px-2 sm:px-3 py-1 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-blue-200 shadow-md backdrop-blur-sm mx-auto sm:mx-0 w-fit"
                        aria-label={`Education type: ${activeSchool.educationType}`}
                      >
                        {activeSchool.educationType}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200/80 font-medium text-base sm:text-lg">
                    {activeSchool.subtitle}
                    {activeSchool.finishedDate && (
                      <span className="block sm:inline sm:ml-3 text-sm text-blue-300/70 mt-1 sm:mt-0">• {activeSchool.finishedDate}</span>
                    )}
                  </p>
                </div>
              </div>
              
              {activeSchool.program && (
                <section className="mt-6 sm:mt-8" aria-labelledby="program-heading">
                  <h3 id="program-heading" className="text-lg sm:text-xl font-bold text-blue-100 mb-3 sm:mb-4">
                    Program included:
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 text-blue-50/90 text-sm leading-relaxed">
                    {activeSchool.program.map((item, index) => (
                      <li key={`program-${index}`} className="flex items-start">
                        <span className="inline-block w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400 mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              
              {activeSchool.technologies && (
                <section className="mt-6 sm:mt-8" aria-labelledby="technologies-heading">
                  <h3 id="technologies-heading" className="text-lg sm:text-xl font-bold text-blue-100 mb-3 sm:mb-4">Skills & Technologies:</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3" role="list" aria-label="Technologies and skills learned">
                    {activeSchool.technologies.map((tech) => (
                      <div 
                        key={tech} 
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-full flex items-center gap-2 shadow-md backdrop-blur-sm hover:border-blue-300/50 transition-colors duration-200"
                        role="listitem"
                      >
                        <span className="text-xs sm:text-sm font-medium text-blue-200">{tech}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default EducationCard;