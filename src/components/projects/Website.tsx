import React from "react";
import SuspenseProjectCard from "../projectCard";

const Website = ({ onModalStateChange }: { onModalStateChange: (isOpen: boolean) => void }) => (
  <SuspenseProjectCard
    projectId="portfolio-website"
    coverImage="/images/Website Images/Web3.webp"
    media={[
      {
        type: "image",
        src: "/images/Website Images/Web1.webp",
        alt: "Title Screen",
      },
      {
        type: "image",
        src: "/images/Website Images/Web2.webp",
        alt: "About me",
      },
      {
        type: "image",
        src: "/images/Website Images/Web3.webp",
        alt: "ProjectModa;",
      },
      {
        type: "image",
        src: "/images/Website Images/Web4.webp",
        alt: "Contact Page",
      },
      {
        type: "image",
        src: "/images/Website Images/Web5.webp",
        alt: "VideoPlayer",
      },
      {
        type: "image",
        src: "/images/Website Images/Web6.webp",
        alt: "CodeSnippet",
      },
    ]}
    title="Portfolio Website"
    description="A modern, responsive portfolio website built with Next.js and Tailwind CSS. Features a clean design, interactive project cards, and smooth navigation. Optimized for performance and accessibility."
    techStack={["Next.js", "React", "Tailwind CSS", "TypeScript"]}
    features={[
      {
        title: "Responsive Design",
        description: "Looks great on all devices, from mobile to desktop.",
      },
      {
        title: "Interactive Elements",
        description: "Engaging project presentations with image carousels and video playback.",
      },
      {
        title: "Performance Optimized",
        description: "Fast loading times with optimized images and code splitting.",
      },
      {
        title: "Modern Tech Stack",
        description: "Built with the latest web technologies for a seamless experience.",
      },
    ]}
    onModalStateChange={onModalStateChange}
  />
);

export default Website;