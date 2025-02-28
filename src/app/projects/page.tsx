'use client'

import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Projects() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white grid-background">
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
