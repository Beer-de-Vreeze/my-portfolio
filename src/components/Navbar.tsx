'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Folder, Mail } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle mobile menu toggle with keyboard
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { href: '/about', label: 'About', icon: <User size={20} /> },
    { href: '/projects', label: 'Projects', icon: <Folder size={20} /> },
    { href: '/contact', label: 'Contact', icon: <Mail size={20} /> },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full backdrop-blur-md border-b border-[#27272a] z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 shadow-lg' : 'bg-black/80'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        <Link 
          href="/" 
          className="text-xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
          aria-label="Beer de Vreeze - Home"
        >
          Beer de Vreeze
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-1">
          {navItems.map(({ href, label, icon }) => (
            <NavLink 
              key={href}
              href={href} 
              icon={icon}
              isActive={pathname === href}
              className="px-4 py-2 rounded-lg"
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden relative text-white hover:text-gray-300 p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 hover:scale-105 active:scale-95 transition-all duration-200" 
          onClick={handleToggle}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <div className="relative w-6 h-6">
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
            }`}>
              <Menu size={24} />
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
            }`}>
              <X size={24} />
            </span>
          </div>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div 
        id="mobile-menu"
        className={`md:hidden bg-black/95 backdrop-blur-md border-t border-[#27272a] overflow-hidden transition-all duration-400 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col px-6 py-8 space-y-4">
          {navItems.map(({ href, label, icon }, index) => (
            <div
              key={href}
              className={`transform transition-all duration-300 ${
                isOpen 
                  ? 'translate-y-0 opacity-100' 
                  : '-translate-y-8 opacity-0'
              }`}
              style={{ 
                transitionDelay: isOpen ? `${50 + index * 75}ms` : '0ms' 
              }}
            >
              <NavLink 
                href={href} 
                icon={icon}
                isActive={pathname === href}
                isMobile
                className="text-lg px-4 py-3 rounded-lg w-full justify-start hover:bg-white/10"
              >
                {label}
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

const NavLink = memo(({ 
  href, 
  children, 
  icon, 
  onClick, 
  className = "",
  isActive = false,
  isMobile = false,
  style = {}
}: { 
  href: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  isMobile?: boolean;
  style?: React.CSSProperties;
}) => {
  const baseClasses = "font-medium transition-all duration-300 flex items-center space-x-2 relative group";
  const activeClasses = isActive 
    ? "text-blue-400" 
    : "text-gray-300 hover:text-white";
  const mobileClasses = isMobile 
    ? "w-full justify-start hover:bg-white/10" 
    : "hover:bg-white/10";
  
  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${activeClasses} ${mobileClasses} ${className}`}
      onClick={onClick}
      style={style}
    >
      {icon && (
        <span className={`transition-transform duration-200 ${
          isActive ? 'scale-110' : 'group-hover:scale-110'
        }`}>
          {icon}
        </span>
      )}
      <span className="relative">
        {children}
        {/* Active indicator */}
        {isActive && !isMobile && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
        )}
        {/* Hover indicator */}
        {!isActive && !isMobile && (
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 rounded-full transition-all duration-300 group-hover:w-full" />
        )}
      </span>
      
      {/* Mobile active indicator */}
      {isActive && isMobile && (
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" />
      )}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

export default Navbar;