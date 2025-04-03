import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const EducationCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [activeSchool, setActiveSchool] = useState(null);

  const schools = [
    {
      name: 'Lek en Linge',
      educationType: 'VMBO-TL',
      logo: '/images/lek-en-linge.webp',
      subtitle: 'High School',
      finishedDate: '06.2021',
    },
    {
      name: 'ROC Midden Nederland',
      educationType: 'MBO',
      logo: '/images/roc.webp',
      subtitle: 'Chef Training',
      finishedDate: '09.2022 till 09.2023',
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
      finishedDate: '09.2023 till present',
      program: [
        'Learning programming languages like C#​',
        "Exploring game design and development principles",
        'Building immersive experiences with Unity and industry-standard tools',
        'Developing engaging games – Unity, Git and SCRUM',
        'Collaborating effectively between programmers, artists, and designers'
      ],
      technologies: ['Unity', 'C#', 'Git',"Game Design", 'SCRUM',],
    }
  ];

  const toggleModal = (school) => {
    if (school) {
      setActiveSchool(school);
      setIsAnimatingOut(false);
      setIsModalOpen(true);
    } else {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 300);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        toggleModal(null);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className="w-full max-w-[800px]">
      <div className="w-full max-w-[800px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
          <h1 className="text-xl font-semibold text-white gradient-text">Education</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((school, index) => (
            <div 
              key={index}
              className="relative flex items-center p-3 pb-8 bg-black border border-[#27272a] rounded-lg shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => toggleModal(school)}
            >
              <div className="rounded-lg mr-4">
                <img src={school.logo} alt={`${school.name} logo`} className="w-20 h-20" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{school.name}</h3>
                <p className="text-gray-400 text-sm font-light">{school.subtitle}</p>
              </div>
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-0.5 text-xs bg-black border border-[#27272a] rounded-full text-gray-300">
                  {school.educationType || 'Education'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && activeSchool && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isAnimatingOut ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={() => toggleModal(null)} // Close when clicking outside
        >
          <div 
            className={`bg-black border border-[#27272a] text-white rounded-lg max-w-2xl w-full mx-4 relative shadow-lg transform transition-all duration-300 ${
              isAnimatingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent clicks on modal content from closing
          >
            {/* Close button moved inside the modal border */}
            <button 
              onClick={() => toggleModal(null)}
              className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 
                rounded-full p-3 w-10 h-10 flex items-center justify-center
                text-gray-300 hover:text-white transition-all duration-200
                shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            <div className="p-6 relative">
              <div className="flex items-start mb-4">
                <div className="rounded-lg mr-4">
                  <img src={activeSchool.logo} alt={`${activeSchool.name} logo`} className="w-24 h-24" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-semibold text-white">{activeSchool.name}</h2>
                    {activeSchool.educationType && (
                      <span className="px-2 py-0.5 text-xs bg-black border border-[#27272a] rounded-full text-gray-300 shadow-md">
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
                <>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Program included:</h3>
                    <ul className="space-y-1 font-mono text-gray-300 text-sm">
                      {activeSchool.program.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                
                  <div className="mt-6 flex flex-wrap gap-2">
                    {activeSchool.technologies.map((tech) => (
                      <div 
                        key={tech} 
                        className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center gap-1.5 shadow-md"
                      >
                        <span className="text-sm font-light text-gray-300">{tech}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationCard;