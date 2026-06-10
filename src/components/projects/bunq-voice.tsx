import React from "react";
import SuspenseProjectCard from "../cards/SuspenseProjectCard";
import useMobileDetection from "@/hooks/useMobileDetection";

const BunqVoice = () => {
  // Desktop streams the self-hosted MP4; mobile falls back to the YouTube embed.
  const isMobile = useMobileDetection();

  return (
    <SuspenseProjectCard
      projectId="Bunq-Voice"
      title="Bunq Voice"
      description="Bunq Voice is a secure, voice-first banking interface built in 24 hours at the bunq Hackathon 7.0. Our team set out to make banking usable for blind, sight-impaired, and motor-disabled people — users that bunq's screen-reader-blocking security had effectively locked out of 'the bank of the free.' You simply talk to your account: check balances, review transactions, and set up payments by speaking naturally, and the app speaks the results back. Crucially, every outgoing payment is created as a pending draft that still requires biometric approval in the bunq app, so accessibility never comes at the cost of security. Under the hood it's a Python + TypeScript monorepo wiring xAI Grok speech-to-text and text-to-speech to Claude Sonnet 4.6 for reasoning, with a FastMCP server exposing bunq's API to the model through the Model Context Protocol. Built together with Giuseppe Dotto, Mink Quispel, and Joshua Ross."
      coverImage="/images/Bunq Voice Images/Bunq Voice Cover.png"
      githubLink="https://github.com/GiuseppeDotto/bunq-voice"
      liveLink="https://devpost.com/software/bunq-voice"
      media={[
        {
          type: isMobile ? "youtube" : "video",
          src: isMobile
            ? "https://youtu.be/GSzQdi8VywA"
            : "/images/Bunq Voice Images/Bunq Voice.mp4",
          alt: "Bunq Voice — speaking to your bank account to check balances and draft payments",
          thumbnail: "https://img.youtube.com/vi/GSzQdi8VywA/hqdefault.jpg",
        },
        {
          type: "image",
          src: "/images/Bunq Voice Images/Bunq Voice 1.jpg",
          alt: "Bunq Voice reading out your accounts and balances after you ask which accounts are in your name",
          caption: "Asking Bunq Voice which accounts you have — it looks them up and speaks the balances back.",
        },
        {
          type: "image",
          src: "/images/Bunq Voice Images/Bunq Voice 2.jpg",
          alt: "Bunq Voice creating a pending draft payment that still needs biometric approval in the bunq app",
          caption: "Creating a draft payment by voice — it stays pending until you confirm it with biometrics in the bunq app.",
        },
      ]}
      techStack={[
        "MCP",
        "Claude",
        "Python",
        "FastAPI",
        "FastMCP",
        "TypeScript",
        "React",
        "bunq API",
        "xAI Grok",
        "Pydantic",
      ]}
      features={[
        {
          title: "Voice-First Accessibility",
          description:
            "The whole interface is built around speech so that people who can't rely on a screen — blind, sight-impaired, and motor-disabled users — can still bank independently. A push-to-talk control captures PCM16 audio at 16 kHz, xAI Grok transcribes it, and the spoken response is streamed back as audio. It directly targets the gap where bunq's security measures blocked screen readers and effectively shut these users out.",
        },
        {
          title: "Draft-Only Payments for Real Security",
          description:
            "The AI is never allowed to move money on its own. Every payment it proposes is created as a pending draft on bunq's existing draft-payment system, which still has to be approved with biometrics inside the official bunq app before anything executes. This 'AI proposes, human authorizes' model keeps the bank's strong security intact while making it reachable by voice.",
        },
        {
          title: "MCP Server Bridging AI and Banking",
          description:
            "A FastMCP server exposes bunq's banking operations to the language model as seven well-defined Model Context Protocol tools — account queries, balance checks, transaction history, recipient lookup, and draft management. Claude Sonnet 4.6 reasons over the conversation and calls these tools, giving a clean abstraction layer between the AI and the real banking API rather than letting the model touch the SDK directly.",
        },
        {
          title: "Name-Based Recipient Lookup",
          description:
            "Nobody wants to read out a full IBAN, and a voice user often can't. A find_counterparty tool searches the account's transaction history to resolve a spoken name back into the right IBAN, so you can say 'send twenty euros to Mink' and the system figures out who that is — removing one of the biggest friction points of banking by voice.",
        },
        {
          title: "Gap-Free Streaming Voice Pipeline",
          description:
            "To make the assistant feel responsive, speech-to-text, LLM reasoning, and text-to-speech run concurrently instead of in a blocking chain. While one sentence is being spoken, the next is already being fetched, and MP3 streaming artifacts are smoothed out with server-side buffering — eliminating the awkward pauses that usually break a spoken conversation.",
        },
      ]}
    />
  );
};

export default BunqVoice;
