"use client";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../app/lib/firebase";

export default function ContactCard() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const docRef = doc(db, "users", "beerdevreeze");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOnline(docSnap.data().online);
        } else {
          console.log("No user document found");
          setOnline(false);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
        setOnline(false);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <BaseCard href="/contact">
      <div
        className="relative z-10 flex items-center justify-center p-4 sm:p-5 bg-black border border-[#27272a] rounded-lg transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105"
        style={{ width: "clamp(180px, 25vw, 260px)", height: "clamp(180px, 25vw, 260px)" }}
      >        {/* Online status indicator - positioned outside the card */}
        <div className="absolute -top-2 -right-2 md:-right-3 lg:-right-5 flex items-center space-x-2 bg-black border border-[#27272a] rounded-full px-3 py-1 z-20">
          {loading ? (
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gray-500 animate-pulse"></div>
          ) : (
            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`}></div>
          )}
          <span className="text-sm md:text-base lg:text-lg">{loading ? "Loading..." : online ? "Online" : "Offline"}</span>
        </div>

        <EnvelopeIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 text-white transition-transform duration-300 group-hover:scale-110" />
      </div>

      <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased">
        Contact
      </span>
    </BaseCard>
  );
}