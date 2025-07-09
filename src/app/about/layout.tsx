'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useModal } from "@/context/ModalContext";

export default function AboutLayout({
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
