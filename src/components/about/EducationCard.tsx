import React, { useState, useRef, useEffect } from 'react';

interface EducationCardProps {
  school: string;
  course: string;
  logo: string;
  link: string;
  details?: {
    finishDate?: string;
    programItems?: string[];
    technologies?: string[];
    link?: string;
  };
}

const EducationCard: React.FC<EducationCardProps> = ({
  school,
  course,
  logo,
  link,
  details,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setIsModalOpen(true);
    // Trigger animation after a small delay to ensure DOM is updated
    setTimeout(() => setIsAnimating(true), 10);
  };

  const closeModal = () => {
    // First turn off animation to trigger fade out
    setIsAnimating(false);
    
    // Wait for animation to start, then close faster than the full animation duration
    setTimeout(() => {
      setIsModalOpen(false);
    }, 100); // Even faster removal while animation is still happening
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  // Handle clicking outside the modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  return (
    <>
      {/* Education Card */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-5 bg-black border border-[#27272a] rounded-lg transition-all duration-300 hover:border-gray-500 hover:scale-105 overflow-hidden h-[200px]"
        onClick={openModal}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={logo} alt={`${school} logo`} className="w-16 h-16 rounded-lg" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-between bg-black bg-opacity-50 rounded-lg p-4">
          <h3 className="text-white text-xl sm:text-2xl md:text-3xl tracking-tighter font-extralight antialiased">
            {school}
          </h3>
          <p className="text-gray-400 text-sm sm:text-lg">{course}</p>
          <span className="text-gray-400 text-xs sm:text-sm mt-auto">{link}</span>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div 
            ref={modalContentRef}
            className={`bg-black border border-[#27272a] rounded-lg p-8 max-w-2xl w-full transition-all duration-300 ease-in-out ${
              isAnimating ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="bg-gray-800 rounded-lg p-4 mr-6">
                  <img src={logo} alt={`${school} logo`} className="w-16 h-16" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{school}</h3>
                  <p className="text-xl text-gray-400">{course}</p>
                  {details?.finishDate && (
                    <p className="text-gray-400 mt-2">Finished: {details.finishDate}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {details?.link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-gray-800 rounded-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors mb-6"
              >
                {link}
              </a>
            )}

            {details?.programItems && details.programItems.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xl text-white mb-4">Program included:</h4>
                <div className="space-y-2">
                  {details.programItems.map((item, index) => (
                    <p key={index} className="text-gray-300 font-mono">{item}</p>
                  ))}
                </div>
              </div>
            )}

            {details?.technologies && details.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {details.technologies.map((tech, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 relative"
                  >
                    <span className="tracking-tighter font-extralight text-sm text-white">{tech}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Example usage component
const EducationSection: React.FC = () => {
  const educationData: EducationCardProps[] = [
    {
      school: "MMCSchool",
      course: "Frontend Course",
      logo: "/mmcschool-logo.png", // Replace with actual path
      link: "MMCSCHOOL.PL",
      details: {
        finishDate: "07.2023",
        programItems: [
          "Creating responsive websites with HTML5 & CSS3",
          "Discovering basics of JavaScript and Bootstrap",
          "Diving into advanced JavaScript, UI/UX practices, Git & Github",
          "Making projects \"that works\" - Gulp, Webpack, SEO"
        ],
        technologies: ["HTML5", "CSS3", "JavaScript", "UI/UX", "Git", "Github", "Gulp", "Webpack", "SEO"]
      }
    },
    {
      school: "University of Helsinki",
      course: "Deep Dive Into Modern Web Development",
      logo: "/helsinki-logo.png", // Replace with actual path
      link: "OPEN UNIVERSITY",
      details: {
        programItems: [
          "Full Stack development with React, Node.js, and MongoDB",
          "Modern JavaScript features and best practices",
          "REST APIs and GraphQL",
          "Testing and CI/CD pipelines"
        ],
        technologies: ["React", "Node.js", "MongoDB", "TypeScript", "GraphQL", "Jest"]
      }
    }
  ];

  return (
    <div className="bg-black min-h-screen py-12 px-6">
      <h2 className="text-4xl font-bold text-purple-300 mb-8">Education</h2>
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {educationData.map((edu, index) => (
          <EducationCard 
            key={index}
            school={edu.school}
            course={edu.course}
            logo={edu.logo}
            link={edu.link}
            details={edu.details}
          />
        ))}
      </div>
    </div>
  );
};

export default EducationSection;