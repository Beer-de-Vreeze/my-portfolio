import React, { useState, useCallback, useMemo } from 'react';
import {
  SiReact, SiUnity, SiGit, SiJavascript, SiTypescript, SiHtml5, SiCss3, SiNextdotjs, SiTailwindcss,
  SiDotnet, SiPython, SiGooglecloud, SiPhp, SiMysql, SiFirebase, SiLua, SiRoblox, SiVercel, SiAudacity
} from 'react-icons/si';
import { FiRefreshCw } from 'react-icons/fi';

type TechCategory = 'Coding' | 'Game Dev' | 'Frontend' | 'Backend' | 'Tools' | 'DevOps';

interface TechItemProps {
  icon: React.ReactNode;
  name: string;
}

interface Technology {
  icon: React.ReactNode;
  name: string;
  category: TechCategory;
}

interface Category {
  name: TechCategory;
  active: boolean;
}

interface TechStackProps {
  title?: string;
}

const TechItem: React.FC<TechItemProps> = React.memo(({ icon, name }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-3 bg-black border border-[#27272a] rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:border-gray-600 hover:shadow-lg group"
      role="button"
      tabIndex={0}
      aria-label={`Technology: ${name}`}
    >
      <div className="text-white text-5xl flex items-center justify-center transition-colors duration-300 group-hover:text-gray-300">
        {icon}
      </div>
      <div className="text-white mt-2 text-xs font-light text-center w-full break-words hyphens-auto transition-colors duration-300 group-hover:text-gray-300">
        {name}
      </div>
    </div>
  );
});

TechItem.displayName = 'TechItem';

const SkillCard: React.FC<TechStackProps> = ({ title = "Tech Stack" }) => {
  const [activeCategory, setActiveCategory] = useState<TechCategory>('Coding');

  const categories: Category[] = useMemo(() => [
    { name: 'Coding', active: activeCategory === 'Coding' },
    { name: 'Game Dev', active: activeCategory === 'Game Dev' },
    { name: 'Frontend', active: activeCategory === 'Frontend' },
    { name: 'Backend', active: activeCategory === 'Backend' },
    { name: 'Tools', active: activeCategory === 'Tools' },
    { name: 'DevOps', active: activeCategory === 'DevOps' },
  ], [activeCategory]);

  const technologies: Technology[] = useMemo(() => [
    // Coding
    { icon: <SiDotnet />, name: 'C#', category: 'Coding' },
    { icon: <SiPython />, name: 'Python', category: 'Coding' },
    { icon: <SiJavascript />, name: 'JavaScript', category: 'Coding' },
    { icon: <SiTypescript />, name: 'TypeScript', category: 'Coding' },
    { icon: <SiLua />, name: 'Lua', category: 'Coding' },
    // Game Dev
    { icon: <SiUnity />, name: 'Unity', category: 'Game Dev' },
    { icon: <SiRoblox />, name: 'Roblox Studio', category: 'Game Dev' },
    // Frontend
    { icon: <SiHtml5 />, name: 'HTML', category: 'Frontend' },
    { icon: <SiCss3 />, name: 'CSS', category: 'Frontend' },
    { icon: <SiTailwindcss />, name: 'Tailwind CSS', category: 'Frontend' },
    { icon: <SiReact />, name: 'React', category: 'Frontend' },
    { icon: <SiReact />, name: 'React Native', category: 'Frontend' },
    // Backend
    { icon: <SiNextdotjs />, name: 'Next.js', category: 'Backend' },
    { icon: <SiPhp />, name: 'PHP', category: 'Backend' },
    { icon: <SiMysql />, name: 'SQL', category: 'Backend' },
    { icon: <SiFirebase />, name: 'Google Firebase', category: 'Backend' },
    // DevOps
    { icon: <SiGit />, name: 'Git', category: 'DevOps' },
    { icon: <FiRefreshCw />, name: 'SCRUM', category: 'DevOps' },
    { icon: <SiGooglecloud />, name: 'Azure', category: 'DevOps' },
    { icon: <SiVercel />, name: 'Vercel', category: 'DevOps' },
    // Tools
    { icon: <SiAudacity />, name: 'Audacity', category: 'Tools' },
  ], []);

  const filteredTechnologies = useMemo(
    () => technologies.filter((tech) => tech.category === activeCategory),
    [technologies, activeCategory]
  );

  const handleCategoryChange = useCallback((category: TechCategory) => {
    setActiveCategory(category);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, category: TechCategory) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryChange(category);
    }
  }, [handleCategoryChange]);

  return (
    <div className="w-full max-w-[800px] bg-black border border-[#27272a] rounded-lg shadow-lg p-4 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
        <h1 className="text-xl font-semibold text-white gradient-text">{title}</h1>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide whitespace-nowrap pb-1 mb-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {categories.map((category) => (
          <div
            key={category.name}
            onClick={() => handleCategoryChange(category.name)}
            onKeyDown={(event) => handleKeyDown(event, category.name)}
            className={`cursor-pointer text-sm font-light flex-shrink-0 transition-colors duration-300 ease-in-out hover:text-gray-200 animate-pulseGlow px-1 py-1 rounded ${
              category.active ? 'border-b-2 border-white text-white' : 'text-gray-400 border-b-2 border-transparent'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`View ${category.name} technologies`}
            aria-pressed={category.active}
          >
            {category.name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fadeIn">
        {filteredTechnologies.map((tech, index) => (
          <div
            key={`${tech.category}-${tech.name}-${index}`}
            className="animate-slideInUp"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TechItem icon={tech.icon} name={tech.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillCard;