'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import hljs from 'highlight.js';
import { FaCopy, FaCheck, FaCode, FaExpand, FaCompress } from 'react-icons/fa';

interface CodeSnippet {
  code: string;
  language: string;
  title?: string;
  description?: string;
}

interface CodeBlockProps {
  snippet: CodeSnippet;
  className?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
  allowExpand?: boolean;
  maxHeight?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  snippet,
  className = '',
  showLineNumbers = true,
  allowCopy = true,
  allowExpand = true,
  maxHeight = '400px',
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  // Highlight code on mount and when snippet changes
  useEffect(() => {
    if (snippet.code && snippet.language) {
      try {
        const highlighted = hljs.highlight(snippet.code, { 
          language: snippet.language.toLowerCase() 
        }).value;
        setHighlightedCode(highlighted);
      } catch {
        // Fallback to auto-detect or plain text
        try {
          const autoHighlighted = hljs.highlightAuto(snippet.code).value;
          setHighlightedCode(autoHighlighted);
        } catch {
          setHighlightedCode(snippet.code);
        }
      }
    }
  }, [snippet.code, snippet.language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = snippet.code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to copy code to clipboard');
      }
      document.body.removeChild(textArea);
    }
  }, [snippet.code]);

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const lines = snippet.code.split('\n');
  const shouldShowExpand = allowExpand && lines.length > 15;

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      {(snippet.title || allowCopy || shouldShowExpand) && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FaCode className="text-gray-400 text-sm" />
            <span className="text-gray-300 font-medium text-sm">
              {snippet.title || `${snippet.language.toUpperCase()} Code`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {shouldShowExpand && (
              <button
                onClick={toggleExpanded}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                title={expanded ? 'Collapse code' : 'Expand code'}
                aria-label={expanded ? 'Collapse code' : 'Expand code'}
              >
                {expanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
              </button>
            )}
            
            {allowCopy && (
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Copy to clipboard"
                aria-label="Copy code to clipboard"
              >
                {copied ? <FaCheck size={14} className="text-green-400" /> : <FaCopy size={14} />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {snippet.description && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <p className="text-gray-300 text-sm">{snippet.description}</p>
        </div>
      )}

      {/* Code content */}
      <div 
        className={`relative ${expanded ? '' : 'overflow-hidden'}`}
        style={{ maxHeight: expanded || !shouldShowExpand ? 'none' : maxHeight }}
      >
        <div className="flex">
          {/* Line numbers */}
          {showLineNumbers && (
            <div className="flex-shrink-0 bg-gray-800 px-3 py-4 border-r border-gray-700">
              <div className="text-gray-500 text-sm font-mono leading-6 select-none">
                {lines.map((_, index) => (
                  <div key={index + 1} className="text-right">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code */}
          <div className="flex-1 overflow-x-auto">
            <pre className="p-4 text-sm leading-6">
              <code
                ref={codeRef}
                className={`hljs language-${snippet.language.toLowerCase()} block`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          </div>
        </div>

        {/* Fade overlay when not expanded */}
        {shouldShowExpand && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/collapse button at bottom */}
      {shouldShowExpand && !expanded && (
        <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
          <button
            onClick={toggleExpanded}
            className="text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          >
            <FaExpand size={12} />
            <span>Show full code ({lines.length} lines)</span>
          </button>
        </div>
      )}

      {/* Copy feedback */}
      {copied && (
        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
          Copied!
        </div>
      )}
    </div>
  );
};

export default CodeBlock;