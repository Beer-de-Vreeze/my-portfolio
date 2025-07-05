const Footer: React.FC = () => {

  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 bg-black text-white py-4 flex justify-center items-center border-t border-[#27272a] z-50"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-3 px-4">
        <div 
          className="px-4 py-2 bg-black border border-[#27272a] rounded-full flex items-center justify-center"
          role="text"
          aria-label="Copyright information"
        >
          <span className="tracking-tighter font-extralight text-sm sm:text-lg">
            © Beer de Vreeze
          </span>
        </div>
        <a
          href="mailto:beer@vreeze.com"
          className="px-4 py-2 bg-black border border-[#27272a] rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gray-800 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Send email to Beer de Vreeze"
          title="Contact Beer de Vreeze via email"
        >
          <span className="tracking-tighter font-extralight text-sm sm:text-lg">
            beer@vreeze.com
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
