'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, Folder, Mail } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          className="md:hidden text-white" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md flex flex-col items-center space-y-4 py-4">
          <NavLink href="/about" icon={<User size={20} />} onClick={() => setIsOpen(false)}>About</NavLink>
          <NavLink href="/projects" icon={<Folder size={20} />} onClick={() => setIsOpen(false)}>Projects</NavLink>
          <NavLink href="/contact" icon={<Mail size={20} />} onClick={() => setIsOpen(false)}>Contact</NavLink>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, icon, onClick }: { href: string; children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) => (
  <Link href={href} className="text-lg font-medium hover:text-gray-300 transition duration-300 flex items-center space-x-2" onClick={onClick}>
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;