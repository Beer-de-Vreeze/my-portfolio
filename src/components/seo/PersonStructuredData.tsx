'use client';

import Script from 'next/script';

interface PersonStructuredDataProps {
  name?: string;
  jobTitle?: string;
  description?: string;
  location?: string;
}

export default function PersonStructuredData({ 
  name = "Beer de Vreeze",
  jobTitle = "Game Developer",
  description = "Systems & Tools Game Developer specializing in Unity, C#, and AI",
  location = "Netherlands"
}: PersonStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": jobTitle,
    "description": description,
    "url": "https://beerdevreeze.vercel.app",
    "image": "https://beerdevreeze.vercel.app/images/Beer.webp",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NL",
      "addressLocality": location
    },
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
      "Interactive Media",
      "Software Engineering",
      "Algorithm Design"
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Game Developer",
      "occupationalCategory": "Software Developer",
      "skills": [
        "Unity",
        "C#",
        "AI/ML",
        "System Design",
        "Tool Development",
        "Performance Optimization"
      ]
    },
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "Game Development Studies",
      "educationalLevel": "Higher Education"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "Independent Developer"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "professional",
      "availableLanguage": ["English", "Dutch"]
    }
  };

  return (
    <Script
      id="person-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}