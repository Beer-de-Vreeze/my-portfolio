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
              href="https://bjeerpeer.itch.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 512 512" 
                fill="currentColor"
                className="w-[1em] h-[1em]"
              >
                <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z"/>
              </svg>
            </motion.a>
            <motion.a 
              href="/downloads/Beer%20de%20Vreeze%20CV.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
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