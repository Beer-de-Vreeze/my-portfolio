import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * @returns boolean indicating if the user is on a mobile device
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the user is on a mobile device
    const checkMobile = () => {
      const isMobileDevice = 
        typeof window !== "undefined" &&
        (window.innerWidth <= 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ));
      
      setIsMobile(isMobileDevice);
    };
    
    // Check initially
    checkMobile();
    
    // Update on window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default useMobileDetection;
