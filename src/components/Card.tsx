import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BaseCardProps, CARD_VARIANTS } from "./types/Card.types";

const BaseCard = memo(function BaseCard({ 
  children, 
  href, 
  className = "", 
  ariaLabel, 
  disabled = false,
  priority = false,
  variant = 'default'
}: BaseCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const prefetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Prefetch immediately for high-priority cards
  useEffect(() => {
    if (priority && !disabled && !prefetchedRef.current) {
      router.prefetch(href);
      prefetchedRef.current = true;
    }
  }, [priority, disabled, href, router]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    
    setIsHovered(true);
    
    // Prefetch with a small delay to avoid excessive prefetching
    if (!prefetchedRef.current) {
      timeoutRef.current = setTimeout(() => {
        router.prefetch(href);
        prefetchedRef.current = true;
      }, 100);
    }
  }, [disabled, href, router]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    if (!disabled) {
      setIsPressed(false);
    }
  }, [disabled]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Handle Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPressed(true);
    }
  }, [disabled]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false);
      // Trigger navigation
      router.push(href);
    }
  }, [disabled, router, href]);

  // Memoize variant-specific styles
  const cardDimensions = useMemo(() => CARD_VARIANTS[variant], [variant]);

  const linkClassNames = useMemo(() => 
    `group w-full flex justify-center md:w-auto transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded-lg ${
      disabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`,
    [disabled]
  );

  const cardClassNames = useMemo(() => 
    `relative ${cardDimensions} bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 rounded-xl flex flex-col items-center justify-center transition-all duration-500 will-change-transform shadow-lg ${
      disabled 
        ? 'opacity-50' 
        : `hover:border-gray-600 hover:shadow-2xl hover:shadow-black/50 hover:bg-gradient-to-br hover:from-gray-800 hover:via-gray-900 hover:to-black ${
            isHovered ? 'scale-[1.02] rotate-[0.5deg]' : ''
          } ${
            isPressed ? 'scale-95 rotate-0' : ''
          }`
    } ${className}`,
    [cardDimensions, disabled, isHovered, isPressed, className]
  );

  const gridBackgroundStyle = useMemo(() => ({
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
      linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(139, 92, 246, 0.05) 1px, transparent 1px),
      linear-gradient(45deg, rgba(236, 72, 153, 0.02) 1px, transparent 1px),
      linear-gradient(-45deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px, 15px 15px, 15px 15px',
    backgroundPosition: '0 0, 40px 40px, 0 0, 0 0, 0 0, 7.5px 7.5px',
    opacity: 0.4
  }), []);

  return (
    <Link 
      href={disabled ? "#" : href} 
      className={linkClassNames}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      role="button"
    >
      <div className={cardClassNames}>
        {/* Enhanced gradient overlay */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-700 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
          aria-hidden="true"
        />
        
        {/* Enhanced grid background pattern */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={gridBackgroundStyle}
          aria-hidden="true"
        />
        
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-[1px] rounded-xl pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-white/5 via-transparent to-white/5"
          aria-hidden="true"
        />
        
        {/* Focus indicator with enhanced styling */}
        <div 
          className="absolute inset-0 rounded-xl border-2 border-transparent group-focus:border-blue-400 group-focus:shadow-lg group-focus:shadow-blue-400/30 transition-all duration-300 pointer-events-none" 
          aria-hidden="true"
        />
        
        {/* Card Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </Link>
  );
});

export default BaseCard;