'use client';

import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EducationSection from "@/components/about/EducationCard";
import ProfileCard from "@/components/about/ProfileCard";
import SkillsCard from "@/components/about/SkillCard";
import JourneyCard from "@/components/about/JourneyCard";

export default function About() {
  // Journey steps data
  const journeySteps = [
    {
      title: "Started Programming",
      category: "Introduction",
      date: "2016",
      description: "My journey began when I wrote my first line of code. I was immediately hooked and knew this was the path for me."
    },
    {
      title: "Computer Science Degree",
      category: "Education",
      date: "2018-2022",
      description: "Pursued formal education in computer science, focusing on game development and interactive media."
    },
    {
      title: "First Game Project",
      category: "Development",
      date: "2020",
      description: "Created my first complete game project, which taught me the fundamentals of game mechanics, design principles, and user experience."
    },
    {
      title: "Industry Internship",
      category: "Experience",
      date: "2021",
      description: "Worked with an established game studio, gaining hands-on experience in professional game development workflows."
    },
    {
      title: "Portfolio Development",
      category: "Expertise",
      date: "2022-Present",
      description: "Building a diverse portfolio of games and interactive experiences, constantly expanding my skills and exploring new technologies."
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-32 px-4 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            About Me
          </h1>
          
          <ProfileCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SkillsCard />
            <EducationSection />
          </div>
          
          <JourneyCard steps={journeySteps} />
        </div>
      </main>
      <Footer />
    </>
  );
}
