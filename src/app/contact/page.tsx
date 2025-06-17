'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFileAlt } from 'react-icons/fa';

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white"           style={{
      backgroundImage: `
        linear-gradient(to right, rgba(9,9,9,0.8) 2px, transparent 1px),
        linear-gradient(to bottom, rgba(9,9,9,0.8) 1px, transparent 1px)
      `,
      backgroundSize: '20.5px 21px',
            backgroundAttachment: 'fixed'
    }}>
      <Navbar />      <main className="flex-grow flex flex-col max-w-2xl mx-auto pt-20 pb-32 px-4 sm:px-6 md:px-8">
        <div className="select-content p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 sm:mb-6">Let&apos;s chat.</h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-8 sm:mb-10 md:mb-12">Send me a message, and I&apos;ll get back to you soon.</p>

          <ContactForm />          <div className="flex justify-center space-x-4 sm:space-x-6 mt-6 sm:mt-8">
            <motion.a 
              href="https://github.com/Beer-de-Vreeze" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl sm:text-3xl"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaGithub />
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/beer-de-vreeze-59040919a/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl sm:text-3xl"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaLinkedin />
            </motion.a>            <motion.a 
              href="/downloads/Beer%20de%20Vreeze%20CV.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title="View CV"
            >
              <FaFileAlt />
            </motion.a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}