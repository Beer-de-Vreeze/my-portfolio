import React from 'react';

interface CodeBlockProps {
  snippetId: string;
  code: string;
  language: string;
  title?: string;
  collapsed: boolean;
  onToggle: (id: string) => void;
  pressedButton: string | null;
  onCopy: (code: string, id: string) => void;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-all duration-300 ${
      collapsed ? 'rotate-0' : 'rotate-180'
    }`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CodeBlock: React.FC<CodeBlockProps> = ({
  snippetId, code, language, title, collapsed, onToggle, pressedButton, onCopy,
}) => {
  return (
    <div className="mt-6 w-full">
      {/* Collapsible header */}
      <button
        onClick={() => onToggle(snippetId)}
        className="group w-full flex items-center justify-between p-4
          bg-gradient-to-r from-gray-900/50 to-gray-800/50
          hover:from-blue-900/30 hover:to-purple-900/30
          border border-blue-400/20 hover:border-blue-300/40
          transition-all duration-300 text-left rounded-xl shadow-lg"
      >
        <span className="text-sm text-blue-200 font-medium group-hover:text-blue-100 transition-colors">
          {title || 'Code Example'}
        </span>
        <ChevronIcon collapsed={collapsed} />
      </button>

      {/* Collapsible content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? 'max-h-0' : 'max-h-[72rem]'
      }`}>
        <div className="relative overflow-hidden border border-blue-400/20 rounded-xl mt-2 shadow-lg">
          <div className="max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-800/50">
            <pre className="w-full overflow-x-auto p-5 text-sm sm:text-[14px] leading-relaxed bg-gradient-to-br from-gray-900/80 to-black/90">
              <code className={`language-${language || 'javascript'} font-mono text-gray-100`}>
                {code}
              </code>
            </pre>
          </div>

          {/* Copy button */}
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(code, snippetId); }}
            className={`absolute top-3 right-3 p-2.5 rounded-lg text-xs transition-all duration-200 shadow-lg ${
              pressedButton === snippetId
                ? 'scale-90 bg-blue-500 text-white'
                : 'bg-gray-800/70 text-gray-200 hover:bg-blue-600/80 hover:text-white border border-blue-500/20'
            }`}
            aria-label="Copy code"
          >
            <CopyIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
