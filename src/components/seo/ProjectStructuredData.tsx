'use client';

import Script from 'next/script';

interface ProjectStructuredDataProps {
  projects: {
    name: string;
    description: string;
    image: string;
    url?: string;
    dateCreated: string;
    programmingLanguage: string[];
    applicationCategory: string;
    operatingSystem?: string;
  }[];
}

export default function ProjectStructuredData({ projects }: ProjectStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Beer de Vreeze",
    "jobTitle": "Game Developer",
    "description": "Systems & Tools Game Developer specializing in Unity, C#, and AI",
    "url": "https://beerdevreeze.vercel.app",
    "image": "https://beerdevreeze.vercel.app/images/Beer.webp",
    "sameAs": [
      "https://github.com/Beer-de-Vreeze",
      "https://www.linkedin.com/in/beer-de-vreeze-59040919a/",
      "https://bjeerpeer.itch.io/"
    ],
    "knowsAbout": [
      "Unity Game Engine",
      "C# Programming",
      "Artificial Intelligence",
      "Machine Learning",
      "Game Development",
      "Systems Programming",
      "Tool Development",
      "Interactive Media"
    ],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "Game Development Studies",
      "educationalLevel": "Bachelor's Degree Level"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Independent Game Developer"
    },
    "owns": projects.map(project => ({
      "@type": "SoftwareApplication",
      "name": project.name,
      "description": project.description,
      "image": `https://beerdevreeze.vercel.app${project.image}`,
      "url": project.url,
      "dateCreated": project.dateCreated,
      "creator": {
        "@type": "Person",
        "name": "Beer de Vreeze"
      },
      "programmingLanguage": project.programmingLanguage,
      "applicationCategory": project.applicationCategory,
      "operatingSystem": project.operatingSystem || "Windows, Mac, Linux"
    }))
  };

  return (
    <Script
      id="project-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}