"use client";
import { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Add highlight.js import and style
import "highlight.js/styles/monokai.css";
// Import custom highlighting styles
import "@/styles/code-highlight.css";
import AudioPreviever from "@/components/projects/AudioPreviever";
import BearlyStealthy from "@/components/projects/Bearly Stealthy";
import MLAgent from "@/components/projects/MLAgent";
import SketchinSpells from "@/components/projects/Sketchin Spells";
import Tetrtis from "@/components/projects/Tetrtis";
import Website from "@/components/projects/Website";
import LPCafe from "@/components/projects/LPCafe";

// Loading component for the projects grid
const ProjectsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading project...</div>
      </div>
    ))}
  </div>
);

// Projects content component that uses useSearchParams
const ProjectsContent = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
    <AudioPreviever onModalStateChange={onModalStateChange} />
    <LPCafe onModalStateChange={onModalStateChange} />
    <MLAgent onModalStateChange={onModalStateChange} />
    <Website onModalStateChange={onModalStateChange} />
    <BearlyStealthy onModalStateChange={onModalStateChange} />
    <SketchinSpells onModalStateChange={onModalStateChange} />
    <Tetrtis onModalStateChange={onModalStateChange} />
  </div>
);

export default function Projects() {
  const [backgroundAttachment, setBackgroundAttachment] = useState("fixed");
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setBackgroundAttachment("scroll");
    }
  }, []);

  // Handle modal state changes from the ProjectCard component
  const handleModalStateChange = (isOpen: boolean) => {
    setIsAnyModalOpen(isOpen);
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-black text-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(9,9,9,0.8) 2px, transparent 1px),
          linear-gradient(to bottom, rgba(9,9,9,0.8) 1px, transparent 1px)
        `,
        backgroundSize: "20.5px 21px",
        backgroundAttachment: backgroundAttachment,
      }}
    >
      <div
        className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ease-in-out ${
          isAnyModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Navbar />
      </div>

      <main className="relative z-0 flex flex-col items-center flex-grow p-2 pt-20 pb-20">
        <Suspense fallback={<ProjectsLoading />}>
          <ProjectsContent onModalStateChange={handleModalStateChange} />
        </Suspense>
      </main>

      <div
        className={`fixed bottom-0 left-0 w-full z-10 transition-all duration-300 ease-in-out ${
          isAnyModalOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Footer />
      </div>
    </div>
  );
}
