import React from "react";
import SuspenseProjectCard from "../projectCard";

const MLAgent = ({
  onModalStateChange,
}: {
  onModalStateChange: (isOpen: boolean) => void;
}) => (
  <SuspenseProjectCard
    projectId="ML-Agents"
    title="Unity ML-Agents Training"
    description="An advanced Unity-based machine learning setup featuring multiple AI scenarios and smart agent systems. Built with the Unity ML-Agents framework, this project showcases complex AI behaviors like zombie survival, hunter-prey dynamics, and pellet collection challenges. It highlights reinforcement learning techniques with reward systems, observation spaces, and neural network training pipelines designed to speed up AI development and research."
    githubLink="https://github.com/Beer-de-Vreeze/ML-Agents-Training"
    coverImage="/images/AI Images/Title.webp"
    media={[
      {
        type: "video",
        src: "/images/AI Images/Jerry Move.webm",
        alt: "Move 1 first itteration",
      },
      {
        type: "video",
        src: "/images/AI Images/Jerry MoveWithVision.webm",
        alt: "Move with raycast training",
      },
      {
        type: "video",
        src: "/images/AI Images/Jerry MoveWithFEEDBACKV2.webm",
        alt: "Training with feedback",
      },
      {
        type: "video",
        src: "/images/AI Images/Jerry MoveWithFEEDBACKTRAINING2.webm",
        alt: "Training with Timer",
      },
      {
        type: "video",
        src: "/images/AI Images/HUNTERVSPREY.webm",
        alt: "Hunter VS Prey simulation",
      },
    ]}
    techStack={[
      "Unity",
      "Unity ML-Agents",
      "C#",
      "Reinforcement Learning",
      "Neural Networks",
    ]}
    features={[
      {
        title: "Multiple AI Scenarios",
        description:
          "Includes zombie survival, hunter-prey, and pellet collection environments for diverse ML training.",
      },
      {
        title: "Advanced AI Behavior",
        description:
          "AI agents demonstrate complex behaviors like strategic hunting, evasive maneuvers, and resource collection.",
      },
      {
        title: "Dynamic Environment Interaction",
        description:
          "Agents interact with a constantly changing environment, improving their adaptability and learning efficiency.",
      },
      {
        title: "Real-time Training Feedback",
        description:
          "Immediate feedback through rewards and penalties helps agents quickly learn and optimize their actions.",
      },
      {
        title: "Comprehensive Tech Stack",
        description:
          "Utilizes Unity, ML-Agents, C#, and advanced neural network techniques for robust AI development.",
      },
    ]}
    onModalStateChange={onModalStateChange}
  />
);

export default MLAgent;