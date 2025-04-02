'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, Folder, Mail } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Prevent animation on initial load
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-[#27272a] z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold gradient-text">
          Beer de Vreeze
        </Link>

        <div className="hidden md:flex space-x-6">
          <NavLink href="/about" icon={<User size={20} />}>About</NavLink>
          <NavLink href="/projects" icon={<Folder size={20} />}>Projects</NavLink>
          <NavLink href="/contact" icon={<Mail size={20} />}>Contact</NavLink>
        </div>

        <button 
          className="md:hidden text-white hover:text-gray-300 transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <div className="relative w-6 h-6">
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
              <Menu size={24} />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              <X size={24} />
            </span>
          </div>
        </button>
      </div>
      
      {/* Mobile Menu with Enhanced Animation */}
      <div 
        className={`md:hidden bg-black/90 backdrop-blur-md overflow-hidden transition-all duration-400 ease-in-out ${
          !mounted ? 'h-0' : (isOpen ? 'h-[220px]' : 'h-0')
        }`}
      >
        <div className="flex flex-col items-center py-6 space-y-6">
          <NavLink 
            href="/about" 
            icon={<User size={20} />} 
            onClick={() => setIsOpen(false)} 
            className={`transform transition-all duration-300 delay-[50ms] text-xl ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
          >
            About
          </NavLink>
          <NavLink 
            href="/projects" 
            icon={<Folder size={20} />} 
            onClick={() => setIsOpen(false)}
            className={`transform transition-all duration-300 delay-[150ms] text-xl ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
          >
            Projects
          </NavLink>
          <NavLink 
            href="/contact" 
            icon={<Mail size={20} />} 
            onClick={() => setIsOpen(false)}
            className={`transform transition-all duration-300 delay-[250ms] text-xl ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
            }`}
          >
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children, icon, onClick, className = "" }: { 
  href: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode; 
  onClick?: () => void;
  className?: string;
}) => (
  <Link 
    href={href} 
    className={`text-lg font-medium hover:text-gray-300 transition duration-300 flex items-center space-x-2 ${className}`} 
    onClick={onClick}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;