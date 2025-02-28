import React from 'react';
import Image from 'next/image';

interface ProjectCardProps {
  image: string;
  title: string;
  techStack: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ image, title, techStack }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-5 bg-black border border-[#27272a] rounded-lg transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105 overflow-hidden" style={{ width: '400px', height: '200px' }}>
      <Image src={image} alt={title} layout="fill" objectFit="cover" className="rounded-lg" />
      <div className="absolute inset-0 flex flex-col justify-between bg-black bg-opacity-50 rounded-lg p-4">
        <h3 className="text-white text-xl sm:text-2xl md:text-3xl tracking-tighter font-extralight antialiased">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1 bg-black bg-opacity-70 p-2 rounded-md self-end mt-auto">
          {techStack.map((tech, index) => (
            <span key={index} className="bg-gray-800 text-white text-xs sm:text-sm px-2 py-1 rounded-md shadow-md font-medium">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;