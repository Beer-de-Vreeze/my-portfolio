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
              {/* Itch.io official logo SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" width="1em" height="1em">
                <path d="M8 12C5.79086 12 4 13.7909 4 16V48C4 50.2091 5.79086 52 8 52H56C58.2091 52 60 50.2091 60 48V16C60 13.7909 58.2091 12 56 12H8ZM8 16H56V48H8V16ZM16 20C13.7909 20 12 21.7909 12 24V40C12 42.2091 13.7909 44 16 44H48C50.2091 44 52 42.2091 52 40V24C52 21.7909 50.2091 20 48 20H16ZM16 24H48V40H16V24ZM20 28V36H24V32H40V36H44V28H40V32H24V28H20Z"/>
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