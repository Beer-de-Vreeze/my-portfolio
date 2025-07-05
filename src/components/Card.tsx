import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BaseCardProps {
  children: ReactNode;
  href: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function BaseCard({ children, href, className = "", ariaLabel, disabled = false }: BaseCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  
  const handleMouseEnter = () => {
    // Preload the page when user hovers over the card
    if (!disabled) {
      router.prefetch(href);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Link 
      href={disabled ? "#" : href} 
      className={`group w-full flex justify-center md:w-auto ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      onMouseDown={() => !disabled && setIsClicked(true)}
      onMouseUp={() => !disabled && setIsClicked(false)}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      <div 
        className={`relative w-[95vw] max-w-[600px] h-[250px] md:w-[600px] md:h-[297px] lg:w-[650px] lg:h-[330px] xl:w-[700px] xl:h-[360px] 2xl:w-[750px] 2xl:h-[390px] bg-black border border-[#27272a] rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:border-[#71717a] ${isClicked ? 'scale-95' : ''} ${className}`}
      >
        <div 
          className="absolute inset-0 w-full h-full rounded-lg"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(39,39,42,0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(39,39,42,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '20.5px 21px'
          }}
        />
        
        {/* Card Content */}
        {children}
      </div>
    </Link>
  );
}