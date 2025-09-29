'use client';

import Script from 'next/script';

export default function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Beer de Vreeze - Game Developer Portfolio",
    "alternateName": "Beer de Vreeze Portfolio",
    "description": "Professional portfolio showcasing game development projects, Unity expertise, C# programming, and AI/ML implementations by Beer de Vreeze",
    "url": "https://beerdevreeze.vercel.app",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "creator": {
      "@type": "Person",
      "name": "Beer de Vreeze",
      "jobTitle": "Game Developer"
    },
    "publisher": {
      "@type": "Person",
      "name": "Beer de Vreeze"
    },
    "about": {
      "@type": "Thing",
      "name": "Game Development",
      "sameAs": [
        "https://en.wikipedia.org/wiki/Video_game_development",
        "https://en.wikipedia.org/wiki/Unity_(game_engine)"
      ]
    },
    "keywords": [
      "game developer",
      "unity developer", 
      "c# programming",
      "ai machine learning",
      "game development portfolio",
      "interactive experiences",
      "systems programming",
      "tools development",
      "indie games",
      "software engineering"
    ],
    "mainEntity": {
      "@type": "Person",
      "name": "Beer de Vreeze"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": "https://beerdevreeze.vercel.app/projects",
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "ContactAction",
        "target": "https://beerdevreeze.vercel.app/contact"
      }
    ],
    "hasPart": [
      {
        "@type": "WebPage",
        "@id": "https://beerdevreeze.vercel.app/",
        "name": "Home",
        "description": "Welcome to Beer de Vreeze's game developer portfolio"
      },
      {
        "@type": "WebPage", 
        "@id": "https://beerdevreeze.vercel.app/about",
        "name": "About",
        "description": "Learn about Beer de Vreeze's skills, education, and development journey"
      },
      {
        "@type": "WebPage",
        "@id": "https://beerdevreeze.vercel.app/projects", 
        "name": "Projects",
        "description": "Explore my collection of games, tools, and creative works"
      },
      {
        "@type": "WebPage",
        "@id": "https://beerdevreeze.vercel.app/contact",
        "name": "Contact", 
        "description": "Get in touch for collaborations and opportunities"
      }
    ]
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}