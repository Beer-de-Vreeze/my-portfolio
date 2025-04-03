import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BaseCardProps {
  children: ReactNode;
  href: string;
  className?: string;
}

export default function BaseCard({ children, href, className = "" }: BaseCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  
  const handleMouseEnter = () => {
    // Preload the page when user hovers over the card
    router.prefetch(href);
  };

  return (
    <Link 
      href={href} 
      className="group w-full flex justify-center md:w-auto"
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseEnter={handleMouseEnter}
    >
      <div 
        className={`relative w-[95vw] max-w-[500px] h-[250px] md:w-[495px] md:h-[297px] bg-black border border-[#27272a] rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:border-[#71717a] ${isClicked ? 'scale-95' : ''} ${className}`}
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