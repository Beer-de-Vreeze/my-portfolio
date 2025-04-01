import React, { useState } from 'react';
import {
  SiReact, SiUnity, SiGithub, SiJavascript, SiTypescript, SiHtml5, SiCss3, SiNodedotjs, SiTailwindcss,
  SiDotnet, SiPython, SiGooglecloud, SiPytorch, SiPhp, SiMysql, SiFirebase, SiLua, SiRoblox
} from 'react-icons/si';
import { FiRefreshCw } from 'react-icons/fi';

interface TechItemProps {
  icon: string | React.ReactNode;
  name: string;
}

const TechItem: React.FC<TechItemProps> = ({ icon, name }) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-black border border-[#27272a] rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
      <div className="text-white text-5xl flex items-center justify-center">
        {icon}
      </div>
      <div className="text-white mt-2 text-sm font-light">{name}</div>
    </div>
  );
};

interface TechStackProps {
  title?: string;
}

const TechStack: React.FC<TechStackProps> = ({ title = "Tech Stack" }) => {
  const [activeCategory, setActiveCategory] = useState('Coding');

  const categories = [
    { name: 'Coding', active: activeCategory === 'Coding' },
    { name: 'Game Dev', active: activeCategory === 'Game Dev' },
    { name: 'Frontend', active: activeCategory === 'Frontend' },
    { name: 'Backend', active: activeCategory === 'Backend' },
    { name: 'DevOps', active: activeCategory === 'DevOps' },
  ];

  const technologies = [
    { icon: <SiReact />, name: 'React', category: 'Frontend' },
    { icon: <SiJavascript />, name: 'JavaScript', category: 'Coding' },
    { icon: <SiTypescript />, name: 'TypeScript', category: 'Coding' },
    { icon: <SiCss3 />, name: 'CSS', category: 'Frontend' },
    { icon: <SiHtml5 />, name: 'HTML', category: 'Frontend' },
    { icon: <SiTailwindcss />, name: 'Tailwind CSS', category: 'Frontend' },
    { icon: <SiDotnet />, name: 'C#', category: 'Coding' },
    { icon: <SiPython />, name: 'Python', category: 'Coding' },
    { icon: <SiUnity />, name: 'Unity', category: 'Game Dev' },
    { icon: <SiGooglecloud />, name: 'Cloud', category: 'DevOps' },
    { icon: <SiGithub />, name: 'Git', category: 'DevOps' },
    { icon: <SiNodedotjs />, name: 'Node.js', category: 'Backend' },
    { icon: <SiReact />, name: 'React Native', category: 'Frontend' },
    { icon: <SiGooglecloud />, name: 'Azure', category: 'DevOps' },
    { icon: <FiRefreshCw />, name: 'SCRUM', category: 'DevOps' },
    { icon: <SiPytorch />, name: 'Pytorch', category: 'Coding' },
    { icon: <SiPhp />, name: 'PHP', category: 'Backend' },
    { icon: <SiMysql />, name: 'SQL', category: 'Backend' },
    { icon: <SiFirebase />, name: 'Google Firebase', category: 'Backend' },
    { icon: <SiLua />, name: 'Lua', category: 'Coding' },
    { icon: <SiRoblox />, name: 'Roblox Studio', category: 'Game Dev' },
  ]

  const filteredTechnologies = technologies.filter(
    (tech) => tech.category === activeCategory
  );

  return (
    <div className="w-full max-w-[800px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
        <h1 className="text-xl font-semibold text-white gradient-text">{title}</h1>
        <div className="flex space-x-3">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => setActiveCategory(category.name)}
              className={`cursor-pointer text-sm font-light text-gray-400 ${
                category.active ? 'border-b-2 border-white text-white' : ''
              }`}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTechnologies.map((tech, index) => (
          <TechItem key={index} icon={tech.icon} name={tech.name} />
        ))}
      </div>
    </div>
  );
};

export default TechStack;