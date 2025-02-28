import { UserIcon } from "@heroicons/react/24/solid";
import BaseCard from "./Card";

export default function AboutCard() {
  return (
    <BaseCard href="/about">
      <div 
        className="relative z-10 flex items-center justify-center p-4 sm:p-5 bg-black border border-[#27272a] rounded-lg transition-all duration-300 group-hover:border-gray-500 group-hover:scale-105"
        style={{
          width: '160px',
          height: '160px'
        }}
      >
        <UserIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 text-white transition-transform duration-300 group-hover:scale-110" />
      </div>

      <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white text-xl sm:text-2xl md:text-3xl tracking-tighter font-extralight antialiased">
        About me
      </span>
    </BaseCard>
  );
}
