'use client';

import { memo } from 'react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useModal } from "@/context/ModalContext";

// Note: We can't export metadata from a client component, so we'll handle it differently
// The metadata will be handled by the page component instead

function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isModalOpen } = useModal();

  return (
    <>
      {!isModalOpen && <Navbar />}
      {children}
      {!isModalOpen && <Footer />}
    </>
  );
}

// Export with memo for performance optimization
export default memo(ProjectsLayout);
