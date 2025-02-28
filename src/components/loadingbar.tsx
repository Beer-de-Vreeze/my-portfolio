"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress settings
NProgress.configure({ 
  showSpinner: false, 
  speed: 400, 
  minimum: 0.2,
  easing: 'ease',
  trickleSpeed: 200
});

const LoadingBar = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Apply custom gradient styles
    const customStyles = document.createElement('style');
    customStyles.textContent = `
      #nprogress .bar {
        background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
        height: 3px;
      }
    `;
    document.head.appendChild(customStyles);

    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 150); // Adjust timing for smoother effect

    return () => {
      clearTimeout(timer);
      document.head.removeChild(customStyles);
    };
  }, [pathname]);

  return null;
};

export default LoadingBar;
