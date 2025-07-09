'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useModal } from "@/context/ModalContext";

// Note: We can't export metadata from a client component, so we'll handle it differently
// The metadata will be handled by the page component instead

export default function ProjectsLayout({
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
