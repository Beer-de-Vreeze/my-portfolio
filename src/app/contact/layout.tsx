import { Metadata } from 'next';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Contact - Beer de Vreeze | Game Developer Portfolio',
  description: 'Get in touch with Beer de Vreeze for game development opportunities, collaborations, or just to say hello. Let\'s chat about your next interactive project.',
  keywords: ['contact game developer', 'hire Unity developer', 'game development services', 'collaboration opportunities'],
  openGraph: {
    title: 'Contact Beer de Vreeze | Game Developer',
    description: 'Get in touch for game development opportunities and collaborations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Beer de Vreeze | Game Developer',
    description: 'Get in touch for game development opportunities and collaborations.',
  },
};

export default function ContactLayout({
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
