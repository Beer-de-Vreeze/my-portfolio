import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const EducationCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [activeSchool, setActiveSchool] = useState(null);

  const schools = [
    {
      name: 'MMCSchool',
      logo: '/api/placeholder/100/100',
      subtitle: 'Frontend Course',
      finishedDate: '07.2023',
      program: [
        'Creating responsive websites with HTML5 & CSS3',
        'Discovering basics of JavaScript and Bootstrap',
        'Diving into advanced JavaScript, UI/UX practices, Git & Github',
        'Making projects "that works" - Gulp, Webpack, SEO'
      ],
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'UI/UX', 'Git', 'Github', 'Gulp', 'Webpack', 'SEO']
    },
    {
      name: 'GLU',
      logo: 'images/glu.webp',
      subtitle: 'Game Development MBO',
      finishedDate: '09/2023 until present',
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
      }, 300); // Match this with transition duration
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
              className="flex items-center p-3 bg-black border border-[#27272a] rounded-lg shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => toggleModal(school)}
            >
              <div className="rounded-lg mr-4">
                <img src={school.logo} alt={`${school.name} logo`} className="w-20 h-20" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{school.name}</h3>
                <p className="text-gray-400 text-sm font-light">{school.subtitle}</p>
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
            <button 
              onClick={() => toggleModal(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <IoClose size={20} />
            </button>
            
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="rounded-lg mr-4">
                  <img src={activeSchool.logo} alt={`${activeSchool.name} logo`} className="w-24 h-24" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{activeSchool.name}</h2>
                  <p className="text-gray-400 font-light">{activeSchool.subtitle}</p>
                  {activeSchool.finishedDate && (
                    <p className="text-sm text-gray-400 font-light mt-1">{activeSchool.finishedDate}</p>
                  )}
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