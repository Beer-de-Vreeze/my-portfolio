'use client'

import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white">
      <button 
        onClick={() => router.push('/')} 
        className="absolute top-6 left-6 text-white hover:text-gray-300"
      >
        ← Back
      </button>
      
      <h1 className="text-5xl md:text-7xl mb-10">About Me</h1>
      
      <div className="max-w-3xl text-lg">
        <p className="mb-6">
          I&apos;m Beer de Vreeze, a Netherlands-based Game Developer passionate about creating 
          immersive gaming experiences.
        </p>
        {/* Add your full bio and details here */}
      </div>
    </main>
  );
}
