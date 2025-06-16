import { UserIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";

export default function AboutCard() {
  return (
    <BaseCard href="/about">
      <div 
        className="relative z-10 flex items-center justify-center p-4 sm:p-5 bg-black border border-[#27272a] rounded-lg transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105"
        style={{
          width: 'clamp(180px, 25vw, 250px)',
          height: 'clamp(160px, 20vw, 220px)'
        }}
      >
        <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-white transition-transform duration-300 group-hover:scale-110" />
      </div>

      <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-extralight antialiased">
        About me
      </span>
    </BaseCard>
  );
}
