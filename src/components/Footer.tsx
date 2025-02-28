const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black text-white py-4 flex justify-center items-center border-t border-[#27272a]">
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-2 px-6">
        <div className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center justify-center">
          <span className="text-white tracking-tighter font-extralight text-lg">
            © Beer de Vreeze
          </span>
        </div>
        <a
          href="mailto:beer@vreeze.com"
          className="px-3 py-1 bg-black border border-[#27272a] rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gray-800"
        >
          <span className="text-white tracking-tighter font-extralight text-lg">
            beer@vreeze.com
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;