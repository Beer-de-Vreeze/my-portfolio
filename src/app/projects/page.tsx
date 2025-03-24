'use client'
import { useState, useEffect } from "react";
import ProjectCard from "@/components/projectCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Projects() {
  const [backgroundAttachment, setBackgroundAttachment] = useState("fixed");

  useEffect(() => {
    if (window.innerWidth < 768) {
      setBackgroundAttachment("scroll");
    }
  }, []);

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
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>
      <main className="relative z-0 flex flex-col items-center flex-grow p-2 pt-40 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          <ProjectCard 
            image="/images/cat.jpg" 
            title="Project Title" 
            techStack={["C#", "Unity"]} 
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget."
            liveLink="https://google.com"
            githubLink="https://github.com"
            contributors={["John Doe", "Jane Doe", "John Doe", "Jane Doe","John Doe","John Doe", "Jane Doe", "John Doe", "Jane Doe",]}
          />
          <ProjectCard 
            image="/images/cat.jpg" 
            title="Project Title" 
            techStack={["C#", "Unity"]} 
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget."
            liveLink="https://google.com"
            githubLink="https://github.com"
            contributors={["John Doe", "Jane Doe", "John Doe", "Jane Doe"]}
          />
          <ProjectCard 
            image="/images/cat.jpg" 
            title="Project Title" 
            techStack={["C#", "Unity"]} 
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget."
            liveLink="https://google.com"
            githubLink="https://github.com"
            contributors={["John Doe", "Jane Doe", "John Doe", "Jane Doe"]}
          />
          <ProjectCard 
            image="/images/cat.jpg" 
            title="Project Title" 
            techStack={["C#", "Unity"]} 
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget."
            liveLink="https://google.com"
            githubLink="https://github.com"
            contributors={["John Doe", "Jane Doe", "John Doe", "Jane Doe"]}
          />
        </div>
      </main>
      <div className="fixed bottom-0 left-0 w-full z-10">
        <Footer />
      </div>
    </div>
  );
}
