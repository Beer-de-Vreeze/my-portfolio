import React, { Suspense } from "react";
import ProjectCard from "@/components/projectCard";

const ProjectCardLoading = () => (
  <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading project...</div>
  </div>
);

const SuspenseProjectCard = (
  props: React.ComponentProps<typeof ProjectCard>
) => (
  <Suspense fallback={<ProjectCardLoading />}>
    <ProjectCard {...props} />
  </Suspense>
);

export default SuspenseProjectCard;
