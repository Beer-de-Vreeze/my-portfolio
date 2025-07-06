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
      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-400/20 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-300/40 hover:shadow-blue-500/20 hover:shadow-xl group backdrop-blur-sm min-h-[100px] sm:min-h-[120px]"
      role="button"
      tabIndex={0}
      aria-label={`Technology: ${name}`}
    >
      <div className="text-blue-200 text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 group-hover:text-blue-100 group-hover:scale-110 mb-2 sm:mb-3">
        {icon}
      </div>
      <div className="text-blue-100 text-xs sm:text-sm font-medium text-center w-full break-words hyphens-auto transition-colors duration-300 group-hover:text-white leading-tight">
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
    <div className="w-full max-w-none sm:max-w-[800px] bg-gradient-to-br from-gray-900/60 to-black/80 border border-blue-500/20 rounded-2xl shadow-xl backdrop-blur-sm p-3 sm:p-4 md:p-6 relative overflow-hidden group mx-auto">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-center border-b border-blue-500/20 pb-3 sm:pb-4 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text">{title}</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3 md:flex md:flex-wrap md:gap-3">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              onKeyDown={(event) => handleKeyDown(event, category.name)}
              className={`relative px-2 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 border-2 ${
                category.active 
                  ? 'border-blue-400 bg-blue-500/20 text-blue-100 shadow-lg shadow-blue-500/30' 
                  : 'border-gray-600/50 bg-gray-800/40 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-200'
              } backdrop-blur-sm active:scale-95 transform text-center`}
              type="button"
              aria-pressed={category.active}
              aria-label={`View ${category.name} technologies`}
            >
              <span className="relative z-10 block truncate">{category.name}</span>
              {category.active && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {filteredTechnologies.map((tech, index) => (
            <div
              key={`${tech.category}-${tech.name}-${index}`}
              className="w-full"
            >
              <TechItem icon={tech.icon} name={tech.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;