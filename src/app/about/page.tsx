'use client'

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/about/ProfileCard";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-24 px-4 bg-black text-white">
        <div className="max-w-3xl mx-auto">
          <ProfileCard />
        </div>
      </main>
      <Footer />
    </>
  );
}
