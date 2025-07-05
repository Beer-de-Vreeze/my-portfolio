import React, { useState, useEffect, useCallback, useRef } from 'react';
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
        toggleModal(null);
      }
    };

    if (modalState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalState.isOpen, toggleModal]);

  return (
    <div className="w-full max-w-[800px]">
      <div className="w-full max-w-[800px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
          <h1 className="text-xl font-semibold text-white gradient-text">Education</h1>
        </div>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          role="region"
          aria-label="Education timeline"
        >
          {schools.map((school, index) => (
            <button
              key={`${school.name}-${index}`}
              className="relative flex items-center p-3 pb-8 bg-black hover:bg-black focus:bg-black border border-[#27272a] rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black cursor-pointer text-left w-full"
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
              <div className="rounded-lg mr-4" aria-hidden="true">
                <Image 
                  src={school.logo} 
                  alt={`${school.name} logo`} 
                  width={80} 
                  height={80} 
                  className="object-cover"
                  priority={index < 2}
                />
              </div>
              <div className="flex-1" id={`education-${index}`}>
                <h3 className="text-white font-semibold">{school.name}</h3>
                <p className="text-gray-400 text-sm font-light">{school.subtitle}</p>
              </div>
              <div className="absolute bottom-2 right-2" aria-hidden="true">
                <span className="px-2 py-0.5 text-xs bg-black border border-[#27272a] rounded-full text-gray-300">
                  {school.educationType || 'Education'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Modal with improved accessibility, performance, and fade animations */}
      {modalState.isOpen && activeSchool && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-all duration-300 ${
            modalState.isAnimatingOut 
              ? 'animate-fadeOut opacity-0' 
              : 'animate-fadeIn opacity-100'
          }`}
          onClick={() => toggleModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-content"
        >
          <div 
            className={`bg-black border border-[#27272a] text-white rounded-lg max-w-2xl w-full mx-4 relative shadow-lg transform transition-all duration-300 ${
              modalState.isAnimatingOut 
                ? 'animate-fadeOut opacity-0 scale-95 translate-y-4' 
                : 'animate-fadeIn opacity-100 scale-100 translate-y-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Enhanced close button with better accessibility */}
            <button 
              ref={closeButtonRef}
              onClick={() => toggleModal(null)}
              className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 
                rounded-full p-3 w-10 h-10 flex items-center justify-center
                text-gray-300 hover:text-white transition-all duration-200
                shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-label={`Close ${activeSchool.name} details dialog`}
              type="button"
            >
              <svg 
                width="20" 
                height="20" 
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
            
            <div className="p-6 relative" id="modal-content">
              <div className="flex items-start mb-4">
                <div className="rounded-lg mr-4" aria-hidden="true">
                  <Image 
                    src={activeSchool.logo} 
                    alt={`${activeSchool.name} logo`} 
                    width={96} 
                    height={96} 
                    className="object-cover" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 id="modal-title" className="text-xl font-semibold text-white">
                      {activeSchool.name}
                    </h2>
                    {activeSchool.educationType && (
                      <span 
                        className="px-2 py-0.5 text-xs bg-black border border-[#27272a] rounded-full text-gray-300 shadow-md"
                        aria-label={`Education type: ${activeSchool.educationType}`}
                      >
                        {activeSchool.educationType}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 font-light">
                    {activeSchool.subtitle}
                    {activeSchool.finishedDate && (
                      <span className="ml-2 text-sm">• {activeSchool.finishedDate}</span>
                    )}
                  </p>
                </div>
              </div>
              
              {activeSchool.program && (
                <section className="mt-6" aria-labelledby="program-heading">
                  <h3 id="program-heading" className="text-lg font-semibold text-white mb-2">
                    Program included:
                  </h3>
                  <ul className="space-y-1 font-mono text-gray-300 text-sm list-disc list-inside">
                    {activeSchool.program.map((item, index) => (
                      <li key={`program-${index}`}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
              
              {activeSchool.technologies && (
                <section className="mt-6" aria-labelledby="technologies-heading">
                  <h3 id="technologies-heading" className="sr-only">Technologies and skills</h3>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Technologies and skills learned">
                    {activeSchool.technologies.map((tech) => (
                      <div 
                        key={tech} 
                        className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 shadow-md"
                        role="listitem"
                      >
                        <span className="text-sm font-light text-gray-300">{tech}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationCard;