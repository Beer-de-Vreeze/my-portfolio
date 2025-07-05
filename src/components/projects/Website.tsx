import React from "react";
import SuspenseProjectCard from "../projectCard";

const Website = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => (
  <SuspenseProjectCard
    projectId="portfolio-website"
    title="Portfolio Website"
    description="Welcome to the very website you're currently browsing! This is my personal portfolio built from scratch with Next.js and Tailwind CSS. It showcases my projects with style, features smooth animations, and handles everything from lazy loading to accessibility. The site is fully responsive, performance-optimized, and packed with interactive elements that make browsing through my work engaging and fun. Plus, it's completely open source if you want to peek under the hood!"
    coverImage="/images/Website Images/Web3.webp"
    githubLink="https://github.com/Beer-de-Vreeze/my-gameportfolio"
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
        src: "/images/Website Images/Web4.webp",
        alt: "Contact page with form and social links",
      },
      {
        type: "image",
        src: "/images/Website Images/Web5.webp",
        alt: "Video player with custom controls",
      },
      {
        type: "image",
        src: "/images/Website Images/Web6.webp",
        alt: "Code snippet viewer with syntax highlighting",
      },
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
        title: "Interactive Project Cards with Media Carousels",
        description:
          "Each project is showcased with a dynamic card system featuring image/video carousels, modal overlays, and smooth animations. Projects load lazily for better performance, and the carousel supports touch gestures, keyboard navigation, and auto-play functionality.",
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
        title: "Performance Optimization & Accessibility",
        description:
          "The site implements advanced performance techniques including image optimization, lazy loading, code splitting, and memoization. It's fully accessible with keyboard navigation, screen reader support, and proper ARIA labels throughout.",
        codeSnippet: {
          title: "Custom Intersection Observer Hook",
          language: "tsx",
          code: `const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLDivElement | null>,
  options: IntersectionObserverInit = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [elementRef, options]);

  return isVisible;
};`
        },
      },
      {
        title: "Responsive Design with Tailwind CSS",
        description:
          "Built mobile-first with a fully responsive design that looks great on everything from phones to ultrawide monitors. Uses Tailwind's utility classes for consistent spacing, typography, and responsive breakpoints.",
        codeSnippet: {
          title: "Responsive Project Grid Layout",
          language: "tsx",
          code: `// Responsive grid that adapts to screen size
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
  gap-4 sm:gap-6 lg:gap-8 auto-rows-auto">
  {projects.map((project, index) => (
    <div 
      key={project.id}
      className="w-full max-w-[500px] mx-auto h-48 sm:h-56 
        transition-all duration-300 hover:translate-y-[-4px]"
    >
      <ProjectCard {...project} />
    </div>
  ))}
</div>

// Mobile-first breakpoint system
const breakpoints = {
  sm: '640px',    // Small devices
  md: '768px',    // Medium devices  
  lg: '1024px',   // Large devices
  xl: '1280px',   // Extra large devices
  '2xl': '1536px' // 2X Extra large devices
};`
        },
      },
      {
        title: "Dark Mode Design with Custom Theming",
        description:
          "Features a sleek dark theme with carefully chosen colors, gradients, and contrast ratios. The design uses glassmorphism effects, subtle animations, and a modern color palette that's easy on the eyes during long browsing sessions.",
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
        title: "Custom Animations & Micro-interactions",
        description:
          "Smooth animations throughout the site using CSS transitions and transforms. Features hover effects, loading states, modal animations, and subtle micro-interactions that enhance the user experience without being overwhelming.",
      },
    ]}
    codeSnippet={{
      title: "Main Layout Component with Navigation",
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

// Navbar with responsive design
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm 
      border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold gradient-text">
            Beer de Vreeze
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </nav>
  );
};`
    }}
    onModalStateChange={onModalStateChange}
  />
);

export default Website;