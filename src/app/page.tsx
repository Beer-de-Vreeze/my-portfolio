'use client'
import { useState, useEffect } from 'react';
import AboutCard from "../components/cards/AboutCard";
import ContactCard from "@/components/forms/ContactCardMenu";
import ProjectsCard from "../components/features/ProjectCardMenu";
import styles from "@/styles/page.module.css";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${styles.container} min-h-screen`}>
      <main className="relative z-10 w-full flex flex-col" id="main-content">
        <header className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4">
            Beer de Vreeze
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-300 text-center">
            Systems & Tools Game Developer
          </h2>
        </header>
        
        <section className="flex-1 flex flex-col items-center justify-center py-8" aria-label="Portfolio sections">
          <h2 className="text-2xl font-semibold text-white mb-8">Explore my work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full px-4" role="group" aria-label="Portfolio navigation cards">
            <AboutCard />
            <ProjectsCard />
            <ContactCard />
          </div>
        </section>
      </main>
    </div>
  );
}