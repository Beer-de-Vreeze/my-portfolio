'use client'

import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Projects() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white" style={{
      backgroundImage: `
        linear-gradient(to right, rgba(9,9,9,0.8) 2px, transparent 1px),
        linear-gradient(to bottom, rgba(9,9,9,0.8) 1px, transparent 1px)
      `,
      backgroundSize: '20.5px 21px',
            backgroundAttachment: 'fixed'
    }}>
      <Navbar />
      <main className="flex flex-col items-center flex-grow p-2 pt-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          <ProjectCard 
            image="/images/gay.jpg" 
            title="Project Title" 
            techStack={["C#", "Unity"]} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
