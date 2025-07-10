import { Metadata } from 'next';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'About - Beer de Vreeze | Game Developer Portfolio',
  description: 'Learn about Beer de Vreeze, a passionate game developer specializing in Unity, AI/ML, and interactive experiences. Discover my educational background and development journey.',
  keywords: ['game developer', 'Unity developer', 'AI machine learning', 'game development education', 'interactive experiences'],
  openGraph: {
    title: 'About Beer de Vreeze | Game Developer',
    description: 'Learn about my journey as a game developer and the skills I\'ve developed.',
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: 'About Beer de Vreeze | Game Developer',
    description: 'Learn about my journey as a game developer and the skills I\'ve developed.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
