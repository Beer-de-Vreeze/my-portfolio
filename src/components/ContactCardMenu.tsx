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
        style={{ width: "160px", height: "160px" }}
      >
        {/* Online status indicator - positioned outside the card */}
        <div className="absolute -top-2 -right-7 flex items-center space-x-2 bg-black border border-[#27272a] rounded-full px-3 py-1 z-20">
          {loading ? (
            <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse"></div>
          ) : (
            <div className={`w-3 h-3 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`}></div>
          )}
          <span className="text-sm">{loading ? "Loading..." : online ? "Online" : "Offline"}</span>
        </div>

        <EnvelopeIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 text-white transition-transform duration-300 group-hover:scale-110" />
      </div>

      <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white text-xl sm:text-2xl md:text-3xl tracking-tighter font-extralight antialiased">
        Contact
      </span>
    </BaseCard>
  );
}