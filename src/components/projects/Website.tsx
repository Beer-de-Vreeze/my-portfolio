import React from "react";
import SuspenseProjectCard from "../cards/SuspenseProjectCard";

const Website = () => (
  <SuspenseProjectCard
    projectId="portfolio-website"
    title="Portfolio Website"
    description="A modern, full-stack portfolio website built with Next.js, TypeScript, and Tailwind CSS, showcasing advanced web development techniques and performance optimization strategies. The site implements server-side rendering, static generation, and client-side hydration for optimal loading speeds. Features include lazy loading with Intersection Observer API, memoized component architecture, and accessibility compliance with WCAG guidelines. Built with modern React patterns including custom hooks, context management, and advanced CSS Grid layouts with responsive design principles."
    coverImage="/images/Website Images/Web5.webp"
    githubLink="https://github.com/Beer-de-Vreeze/my-portfolio"
    liveLink="https://beerdevreeze.com"
    media={[
      {
        type: "image",
        src: "/images/Website Images/Web1.webp",
        alt: "Homepage hero section",
      },
      {
        type: "image",
        src: "/images/Website Images/Web2.webp",
        alt: "About me section with personal info and skills",
      },
      {
        type: "image",
        src: "/images/Website Images/Web3.webp",
        alt: "Project showcase with interactive cards",
      },
      {
        type: "image",
        src: "/images/Website Images/Web5.webp",
        alt: "Project details modal with media carousel",
      },
      {
        type: "image",
        src: "/images/Website Images/Web4.webp",
        alt: "Contact page with form and social links",
      },
      {
        type: "image" ,
        src: "/images/Website Images/Web6.webp",
        alt: "Mobile view of the portfolio website showcasing responsive design",
      }
    ]}
    techStack={[
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Vercel",
      "ESLint",
      "Responsive Design",
      "Performance Optimization",
    ]}
    features={[
      {
        title: "Dynamic Project Showcase with Lazy Loading",
        description:
          "A sophisticated project display system utilizing React's Intersection Observer API for performance-optimized lazy loading. Features modal overlays with media carousels, gesture-based touch navigation, and preemptive image loading strategies. The system implements viewport-based content loading, reducing initial bundle size and improving Core Web Vitals scores through efficient resource management.",
        codeSnippet: {
          title: "Project Card Component with Lazy Loading",
          language: "tsx",
          code: `const ProjectCard: React.FC<ProjectCardProps> = ({ 
  projectId,
  media,
  title,
  techStack,
  coverImage,
  description,
  lazyLoad = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { 
    threshold: 0.1,
    rootMargin: '50px'
  });

  const shouldLoadMedia = useMemo(() => {
    return !lazyLoad || isVisible || isModalOpen;
  }, [lazyLoad, isVisible, isModalOpen]);

  const preloadImages = useCallback(() => {
    if (!shouldLoadMedia) return;
    
    setLoadingState('media', true);
    
    const imageUrls = media
      .filter(item => item.type === 'image')
      .map(item => item.src)
      .filter(src => !preloadedImages.current.has(src));

    imageUrls.forEach(src => {
      const img = document.createElement('img');
      img.onload = () => preloadedImages.current.add(src);
      img.src = src;
    });
  }, [media, shouldLoadMedia]);

  return (
    <div 
      ref={cardRef}
      onClick={openModal}
      className="relative flex flex-col justify-between p-4 bg-[#111111] 
        border border-[#2a2a2a] rounded-lg transition-all duration-300 
        hover:border-[#4a4a4a] hover:translate-y-[-4px] cursor-pointer"
    >
      {/* Card content */}
    </div>
  );
};`
        },
      },
            {
        title: "Advanced Performance Optimization & Web Accessibility",
        description:
          "Comprehensive performance engineering including code splitting, tree shaking, and bundle optimization with Next.js automatic optimizations. Implements WCAG 2.1 AA compliance with semantic HTML, ARIA attributes, keyboard navigation, and screen reader support. Features include preload strategies, critical CSS inlining, and image optimization with next/image for responsive loading across devices.",
      },
      {
        title: "Interactive React Components with State Management",
        description:
          "Sophisticated component architecture featuring ProfileCard with dynamic skill bubbles, tooltip management, and responsive interaction patterns. Implements React.memo for performance optimization, custom hooks for mobile detection, and event delegation for touch-friendly interfaces. Uses advanced CSS-in-JS patterns with Tailwind's utility classes and custom CSS properties for dynamic theming.",
        codeSnippet: {
          title: "ProfileCard Component with Interactive Bubbles",
          language: "tsx",
          code: `const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ 
  name = "Beer de Vreeze", 
  username = "@bjeer.peer",  
  bubbles = DEFAULT_BUBBLES,
  className = ""
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [fadingBubble, setFadingBubble] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection with proper cleanup
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBubbleInteraction = useCallback((bubbleId: string, event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isMobile) {
      // On mobile, toggle the tooltip
      setHoveredBubble(prev => {
        if (prev === bubbleId) {
          setFadingBubble(bubbleId);
          return null;
        } else {
          setFadingBubble(null);
          return bubbleId;
        }
      });
    }
  }, [isMobile]);

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-black/90 
      border border-blue-500/20 rounded-2xl shadow-xl backdrop-blur-sm p-6">
      {/* Profile content with interactive skill bubbles */}
      <div className="flex flex-wrap gap-2.5 w-full justify-center">
        {bubbles.map((bubble) => (
          <div 
            key={bubble.id}
            className="px-4 py-2 bg-gradient-to-r from-blue-900/40 
              to-purple-900/40 border border-blue-400/30 rounded-full 
              flex items-center gap-2 relative cursor-pointer 
              transition-all duration-300 hover:scale-105"
            onTouchStart={(e) => handleBubbleInteraction(bubble.id, e)}
            role="button"
            aria-label={bubble.additionalInfo ? \`\${bubble.label}: \${bubble.additionalInfo}\` : bubble.label}
          >
            {bubble.icon}
            <span className="text-sm text-blue-100">{bubble.label}</span>
            
            {bubble.additionalInfo && hoveredBubble === bubble.id && (
              <div className="absolute bottom-full left-1/2 transform 
                -translate-x-1/2 mb-2 bg-gray-800/95 border 
                border-blue-400/30 rounded-xl text-blue-100 text-xs 
                w-max max-w-[200px] p-3 tooltip-popup"
                role="tooltip"
              >
                {bubble.additionalInfo}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});`
        },
      },
      {
        title: "Modern CSS Architecture & Design System",
        description:
          "A comprehensive design system built with CSS custom properties, CSS Grid, and Flexbox layouts. Features glassmorphism effects using backdrop-filter, gradient overlays, and carefully calculated contrast ratios for optimal readability. Implements a mobile-first responsive design methodology with breakpoint-specific optimizations and smooth CSS transitions for enhanced user experience.",
        codeSnippet: {
          title: "Custom Color Palette & Glassmorphism Effects",
          language: "css",
          code: `/* Custom dark theme color palette */
:root {
  --bg-primary: #111111;
  --bg-secondary: #1a1a1a;
  --border-primary: #2a2a2a;
  --border-hover: #4a4a4a;
  --text-primary: #ffffff;
  --text-secondary: #gray-300;
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
}

/* Glassmorphism card effect */
.glass-card {
  background: rgba(17, 17, 17, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(42, 42, 42, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Gradient text effects */
.gradient-text {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`
        },
      },
      {
        title: "Micro-Interactions & Animation Systems",
        description:
          "Carefully crafted animation system using CSS transforms, transitions, and keyframes for smooth user interactions. Features hover state management, loading animations, and modal transition effects that enhance usability without compromising performance. Implements hardware-accelerated animations and GPU-optimized transforms for consistent 60fps experiences across devices.",
      },
      {
        title: "Modern Development Architecture & TypeScript Integration",
        description:
          "Built with enterprise-grade development practices including TypeScript for type safety, ESLint for code quality, and Azure MSAL for secure authentication. Implements React best practices with custom hooks, component composition patterns, and performance optimizations using React.memo, useCallback, and useMemo. Features automated testing setup and continuous deployment pipeline with Vercel integration.",
        codeSnippet: {
          title: "Enhanced Responsive Grid with Modern CSS",
          language: "tsx",
          code: `// Advanced responsive grid with CSS Grid and Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
  gap-4 sm:gap-6 lg:gap-8 auto-rows-auto">
  {projects.map((project, index) => (
    <div 
      key={project.id}
      className="w-full max-w-[500px] mx-auto h-48 sm:h-56 
        transition-all duration-300 hover:translate-y-[-4px]
        bg-gradient-to-br from-gray-900/80 to-black/90 
        border border-blue-500/20 rounded-2xl backdrop-blur-sm"
    >
      <ProjectCard {...project} />
    </div>
  ))}
</div>

// Modern breakpoint system with custom CSS properties
const breakpoints = {
  sm: '640px',    // Small devices (tablets)
  md: '768px',    // Medium devices (small laptops)  
  lg: '1024px',   // Large devices (laptops)
  xl: '1280px',   // Extra large devices (desktops)
  '2xl': '1536px' // 2X Extra large devices (large desktops)
};

// CSS custom properties for dynamic theming
:root {
  --gradient-primary: linear-gradient(90deg, #3b82f6, #8b5cf6);
  --glass-bg: rgba(17, 17, 17, 0.8);
  --border-glow: rgba(59, 130, 246, 0.3);
}`
        },
      },
    ]}
    codeSnippet={{
      title: "Enhanced Layout with Modern Features",
      language: "tsx",
      code: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 
          via-black to-gray-900 text-white">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

// Enhanced Navbar with improved accessibility and animations
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm 
      border-b border-gray-800 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/" 
            className="text-xl font-bold bg-gradient-to-r from-blue-400 
              to-purple-400 bg-clip-text text-transparent hover:scale-105 
              transition-transform duration-300"
          >
            Beer de Vreeze
          </Link>
          
          {/* Desktop Navigation with enhanced styling */}
          <div className="hidden md:flex space-x-8">
            {['Home', 'About', 'Projects', 'Contact'].map((item) => (
              <NavLink 
                key={item}
                href={item === 'Home' ? '/' : \`/\${item.toLowerCase()}\`}
                className="relative group px-3 py-2 text-gray-300 
                  hover:text-white transition-colors duration-300"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 
                  bg-gradient-to-r from-blue-400 to-purple-400 
                  group-hover:w-full transition-all duration-300" />
              </NavLink>
            ))}
          </div>

          {/* Enhanced mobile menu with animation */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 
              transition-colors duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            <MenuIcon className={\`w-6 h-6 transform transition-transform 
              duration-300 \${isOpen ? 'rotate-90' : ''}\`} />
          </button>
        </div>
        
        {/* Mobile menu with slide animation */}
        <div className={\`md:hidden overflow-hidden transition-all 
          duration-300 \${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}\`}>
          <div className="py-4 space-y-2 border-t border-gray-800">
            {['Home', 'About', 'Projects', 'Contact'].map((item) => (
              <MobileNavLink 
                key={item}
                href={item === 'Home' ? '/' : \`/\${item.toLowerCase()}\`}
                onClick={() => setIsOpen(false)}
              >
                {item}
              </MobileNavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};`
    }}
  />
);

export default Website;