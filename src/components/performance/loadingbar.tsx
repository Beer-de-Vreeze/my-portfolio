"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.1,
  easing: "ease-out",
  trickleSpeed: 300,
});

/**
 * Brief top progress pulse on navigation. The App Router has no
 * route-start events, so this fires when the new pathname commits —
 * it is a visual acknowledgement of the route change, not a measurement.
 * Bar styling lives in globals.css (#nprogress rules).
 */
const LoadingBar: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const timeout = setTimeout(() => NProgress.done(), 250);
    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [pathname]);

  return null;
};

export default LoadingBar;
