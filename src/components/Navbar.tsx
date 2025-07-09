'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Folder, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      // Prevent body scroll when mobile menu is open - but only override if not already controlled
      if (!document.body.classList.contains('no-scroll')) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Only restore overflow if we set it (and it's not controlled by page-level no-scroll class)
      if (!document.body.classList.contains('no-scroll')) {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Only restore overflow if we're responsible for it
      if (!document.body.classList.contains('no-scroll')) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  const navItems = [
    { href: '/about', label: 'About', icon: <User size={20} /> },
    { href: '/projects', label: 'Projects', icon: <Folder size={20} /> },
    { href: '/contact', label: 'Contact', icon: <Mail size={20} /> },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 w-full backdrop-blur-xl border-b z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/95 border-gray-800/50 shadow-2xl shadow-blue-500/5' 
          : 'bg-black/90 border-gray-800/30'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isScrolled ? 'opacity-100' : 'opacity-50'
        }`}>
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              animation: 'gridShift 20s linear infinite'
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Link 
            href="/" 
            className="text-xl font-bold relative group"
            aria-label="Beer de Vreeze - Home"
          >
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-size-200 animate-gradient">
              Beer de Vreeze
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-2">
          {navItems.map(({ href, label, icon }) => (
            <div key={href}>
              <NavLink 
                href={href} 
                icon={icon}
                isActive={pathname === href}
                className="px-4 py-2 rounded-lg"
              >
                {label}
              </NavLink>
            </div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden relative text-white p-2 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 backdrop-blur-sm hover:from-gray-700/60 hover:to-gray-600/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300" 
          onClick={handleToggle}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <div className="relative w-6 h-6">
            <motion.span 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                opacity: isOpen ? 0 : 1,
                rotate: isOpen ? 180 : 0,
                scale: isOpen ? 0.8 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <Menu size={24} />
            </motion.span>
            <motion.span 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                opacity: isOpen ? 1 : 0,
                rotate: isOpen ? 0 : -180,
                scale: isOpen ? 1 : 0.8
              }}
              transition={{ duration: 0.3 }}
            >
              <X size={24} />
            </motion.span>
          </div>
        </motion.button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden bg-black/98 backdrop-blur-xl border-t border-gray-800/50 overflow-hidden"
            aria-hidden={!isOpen}
          >
            {/* Mobile menu background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 2px, transparent 2px),
                    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px, 20px 20px'
                }}
              />
            </div>

            <div className="flex flex-col px-6 py-8 space-y-4 relative z-10">
              {navItems.map(({ href, label, icon }) => (
                <div key={href}>
                  <NavLink 
                    href={href} 
                    icon={icon}
                    isActive={pathname === href}
                    isMobile
                    className="text-lg px-4 py-3 rounded-lg w-full justify-start"
                  >
                    {label}
                  </NavLink>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes gridShift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-size-200 { background-size: 200% 200%; }
        .animate-gradient { animation: gradient 3s ease infinite; }
      `}</style>
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
  const baseClasses = "font-medium transition-all duration-300 flex items-center space-x-2 relative group overflow-hidden";
  const activeClasses = isActive 
    ? "text-blue-400" 
    : "text-gray-300 hover:text-white";
  const mobileClasses = isMobile 
    ? "w-full justify-start" 
    : "";
  
  return (
    <motion.div
      whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Link 
        href={href} 
        className={`${baseClasses} ${activeClasses} ${mobileClasses} ${className}`}
        onClick={onClick}
        style={style}
      >
        {/* Background effects */}
        <div className={`absolute inset-0 transition-all duration-300 rounded-lg ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 scale-100' 
            : 'bg-gradient-to-r from-gray-800/30 to-gray-700/30 scale-0 group-hover:scale-100'
        }`} />
        
        {/* Animated border */}
        <div className={`absolute inset-0 rounded-lg border transition-all duration-300 ${
          isActive 
            ? 'border-blue-400/30' 
            : 'border-transparent group-hover:border-gray-600/30'
        }`} />

        {/* Content */}
        <div className="relative z-10 flex items-center space-x-2">
          {icon && (
            <motion.span 
              className={`transition-all duration-200 ${
                isActive ? 'text-blue-400 scale-110' : 'group-hover:scale-110'
              }`}
              whileHover={{ rotate: 5 }}
            >
              {icon}
            </motion.span>
          )}
          <span className="relative">
            {children}
            
            {/* Active indicator for desktop */}
            {isActive && !isMobile && (
              <motion.span 
                layoutId="activeTab"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            {/* Hover indicator for desktop */}
            {!isActive && !isMobile && (
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-400/50 rounded-full transition-all duration-300 group-hover:w-full" />
            )}
          </span>
        </div>
        
        {/* Mobile active indicator */}
        {isActive && isMobile && (
          <motion.div 
            layoutId="mobileActiveTab"
            className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-r-full"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Particle effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-400/60 rounded-full animate-ping" 
               style={{ animationDelay: '0ms' }} />
          <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-purple-400/60 rounded-full animate-ping" 
               style={{ animationDelay: '200ms' }} />
          <div className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-pink-400/60 rounded-full animate-ping" 
               style={{ animationDelay: '400ms' }} />
        </div>
      </Link>
    </motion.div>
  );
});

NavLink.displayName = 'NavLink';

export default Navbar;