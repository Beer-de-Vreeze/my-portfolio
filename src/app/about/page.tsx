'use client';

import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/about/ProfileCard";
import Stack from "@/components/about/Stack";



export default function About() {
  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-24 pb-32 px-4 text-white grid"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(9,9,9,0.8) 2px, transparent 1px),
            linear-gradient(to bottom, rgba(9,9,9,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "20.5px 21px",
          backgroundAttachment: "fixed",
          backgroundColor: "black",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16 relative">
            <div className="lg:col-span-2 lg:h-full">
              <div className="h-full flex flex-col justify-between">
                <ProfileCard />
              </div>
            </div>
            <div className="lg:col-span-2 lg:flex lg:flex-col lg:gap-4 mt-8 lg:mt-0">
              <Stack />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
