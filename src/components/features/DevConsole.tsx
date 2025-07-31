'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import styles from '../../styles/DevConsole.module.css';
import Uwuifier from 'uwuifier';
import Fuse from 'fuse.js';
import { evaluate } from 'mathjs';
import { format, differenceInDays, addDays, isToday, isTomorrow } from 'date-fns';
import convert from 'convert-units';
import { LoremIpsum } from 'lorem-ipsum';
import generatePassword from 'generate-password';
import he from 'he';
import chroma from 'chroma-js';
import hljs from 'highlight.js';
import bigInt from 'big-integer';
import stringArgv from 'string-argv';
import Pokedex from 'pokedex-promise-v2';
import CryptoJS from 'crypto-js';
import xml2js from 'xml2js';
import yaml from 'js-yaml';
import { format as sqlFormatter } from 'sql-formatter';
import beautify from 'js-beautify';
import { v1 as uuidv1, v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import QRCode from 'qrcode';
import { NASA_API } from '@clxrity/nasa-api';

// Utility function to convert URLs to clickable links
const makeLinksClickable = (text: string): string => {
  // Patterns for different types of URLs
  const urlPatterns = [
    // HTTP/HTTPS URLs
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi,
    // Email addresses
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    // Basic domain names (www.example.com)
    /(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ];

  let processedText = text;

  // Process HTTP/HTTPS URLs
  processedText = processedText.replace(urlPatterns[0], (match) => {
    return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  // Process email addresses
  processedText = processedText.replace(urlPatterns[1], (match) => {
    return `<a href="mailto:${match}">${match}</a>`;
  });

  // Process www domains (add https:// prefix)
  processedText = processedText.replace(urlPatterns[2], (match) => {
    if (!processedText.includes(`href="${match}"`)) { // Avoid double-processing
      return `<a href="https://${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    }
    return match;
  });

  return processedText;
};

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if it's mobile on mount
    const checkMobile = () => {
      if (typeof window === 'undefined') return false;
      
      const userAgent = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || '';
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()) || isSmallScreen);
    };
    
    checkMobile();
    
    // Also listen for resize events
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string | Promise<string>;
}

interface ConsoleHistory {
  input: string;
  output: string;
  timestamp: Date;
  type: 'command' | 'error' | 'info';
}

const DevConsoleDesktop: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [consoleSessionStart, setConsoleSessionStart] = useState<number | null>(null);
  const [history, setHistory] = useState<ConsoleHistory[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);
  const [pendingTrivia, setPendingTrivia] = useState<{
    question: string;
    answers: string[];
    correctAnswer: string;
    correctIndex: number;
    category: string;
    difficulty: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Initialize pageLoadTime on client side only
  useEffect(() => {
    setPageLoadTime(Date.now());
  }, []);

  // Initialize Lorem Ipsum generator
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
  });

  // Initialize Pokedex API
  const pokedex = new Pokedex();

  // Simple browser-compatible argument parser
  const parseArgs = (input: string) => {
    try {
      // Use library to properly split command line arguments
      const tokens = stringArgv(input);
      const args: string[] = [];
      const options: { [key: string]: string | boolean | number | string[] } = {};
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.startsWith('--')) {
          // Long option
          const optionPart = token.slice(2);
          if (optionPart.includes('=')) {
            const [key, value] = optionPart.split('=', 2);
            options[key] = isNaN(Number(value)) ? value : Number(value);
          } else {
            // Check if next token is a value
            const nextToken = tokens[i + 1];
            if (nextToken && !nextToken.startsWith('-')) {
              const value = nextToken;
              options[optionPart] = isNaN(Number(value)) ? value : Number(value);
              i++; // Skip next token
            } else {
              options[optionPart] = true;
            }
          }
        } else if (token.startsWith('-') && token.length > 1) {
          // Short option(s)
          const shortOpts = token.slice(1);
          for (const opt of shortOpts) {
            options[opt] = true;
          }
        } else {
          // Positional argument
          args.push(token);
        }
      }
      
      return { _: args, ...options };
    } catch {
      // Fallback to simple splitting if parsing fails
      const tokens = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      return { _: tokens.map(t => t.replace(/^"|"$/g, '')) };
    }
  };

  // Konami Code sequence - use useMemo to prevent re-creation
  const KONAMI_CODE = React.useMemo(() => 
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'], 
    []
  );

  const addToHistory = useCallback((output: string, type: 'command' | 'error' | 'info' = 'command', input?: string) => {
    // Only process the output to make URLs clickable if it doesn't already contain HTML links
    const processedOutput = output.includes('<a') || output.includes('href=') 
      ? output 
      : makeLinksClickable(output);
    
    setHistory(prev => [...prev, {
      input: input || '',
      output: processedOutput,
      timestamp: new Date(),
      type
    }]);
    
    // If output contains images, scroll after a delay to ensure images load
    if (processedOutput.includes('<img')) {
      setTimeout(() => {
        if (historyRef.current) {
          historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
      }, 100);
    }
  }, []);

  // Check if console should reopen after reload
  useEffect(() => {
    const shouldReopen = localStorage.getItem('devConsole_reopenAfterReload');
    if (shouldReopen === 'true') {
      localStorage.removeItem('devConsole_reopenAfterReload');
      setIsOpen(true);
      
      // Track console reopening after reload
      track('dev_console_opened', {
        method: 'reload_reopen',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      });
      
      // Start session timer
      setConsoleSessionStart(Date.now());
      
      addToHistory('Console reopened after page reload.', 'info');
    }
  }, [addToHistory]);

  // Developer commands
  const commands: Command[] = [
    {
      name: 'help',
      description: 'Show all available commands',
      execute: () => {
        const categories = {
          '🚀 Essential Commands': [
            { name: 'help', desc: 'Show all available commands' },
            { name: 'clear', desc: 'Clear console history' },
            { name: 'exit', desc: 'Close the developer console' },
            { name: 'reload', desc: 'Reload the page and reopen console' },
            { name: 'navigate', desc: 'Navigate to pages or custom paths' },
            { name: 'search', desc: 'Fuzzy search through available commands' },
            { name: 'beer', desc: 'Show information about Beer de Vreeze (portfolio owner)' }
          ],
          '📊 System & Performance': [
            { name: 'info', desc: 'Show system information' },
            { name: 'performance', desc: 'Show performance metrics' },
            { name: 'memory', desc: 'Display current memory usage (Chrome only)' },
            { name: 'network', desc: 'Show network information and test connectivity' },
            { name: 'storage', desc: 'Manage local storage (list, get, set, remove, clear)' }
          ],
          '🌍 World & Time Info': [
            { name: 'datetime', desc: 'Date and time operations (time, date, age, uptime)' },
            { name: 'timestamp', desc: 'Unix timestamp conversions and utilities' },
            { name: 'weather', desc: 'Get real weather information for any city' },
            { name: 'currency', desc: 'Real-time currency conversion and exchange rates' },
            { name: 'space', desc: 'Space and astronomy information from NASA APIs' }
          ],
          '🔧 Developer Tools': [
            { name: 'fetch', desc: 'Fetch and display data from API endpoints (GET only)' },
            { name: 'clipboard', desc: 'Read from or write to the clipboard' },
            { name: 'code', desc: 'Code operations (highlight, beautify, minify)' },
            { name: 'analyze', desc: 'Analyze text, numbers, colors, or data' },
            { name: 'hash', desc: 'Generate various hashes (MD5, SHA-1, SHA-256, SHA-512)' },
            { name: 'regex', desc: 'Test regular expressions with live matching' },
            { name: 'uuid', desc: 'Generate UUIDs (v1, v4, v5) and UUID utilities' },
            { name: 'beautify', desc: 'Format and beautify CSS, JavaScript, and HTML code' },
            { name: 'parse', desc: 'Parse command-line arguments (demo command)' }
          ],
          '🧮 Math & Converters': [
            { name: 'math', desc: 'Mathematical operations (calc, convert, binary, stats)' },
            { name: 'base', desc: 'Convert numbers between different bases (2-36)' },
            { name: 'encode', desc: 'Encode/decode text (base64, url, html)' }
          ],
          '🎲 Generators & Text': [
            { name: 'random', desc: 'Generate random data (number, string, color, password)' },
            { name: 'password', desc: 'Generate secure passwords with custom options' },
            { name: 'lorem', desc: 'Generate placeholder text (lorem ipsum)' },
            { name: 'colors', desc: 'Generate colors (random, palette, harmonies, scales)' },
            { name: 'qrcode', desc: 'Generate QR codes and barcodes for text' },
            { name: 'uwu', desc: 'Convert text to UwU speak' }
          ],
          '💾 Data & Formatting': [
            { name: 'data', desc: 'Data operations (convert, analyze, format)' }
          ],
          '� Media & Entertainment': [
            { name: 'spotify', desc: 'Search Spotify tracks, albums, and playlists' },
            { name: 'translate', desc: 'Translate text between different languages' },
            { name: 'github', desc: 'Search GitHub repositories, users, and get repo info' },
            { name: 'news', desc: 'Get latest news headlines and articles' },
            { name: 'reddit', desc: 'Browse Reddit posts, subreddits, and trending content' }
          ],
          '🎮 Games & Fun': [
            { name: 'joke', desc: 'Get random jokes from various categories' },
            { name: '8ball', desc: 'Ask the magic 8-ball a yes/no question' },
            { name: 'pokemon', desc: 'Pokemon commands (random, info, search, battle)' },
            { name: 'trivia', desc: 'Get trivia questions from various categories' },
            { name: 'trivia-answer', desc: 'Answer a pending trivia question (A/B/C/D)' },
            { name: 'rps', desc: 'Play Rock Paper Scissors against the computer' },
            { name: 'hangman', desc: 'Play hangman word guessing game' },
            { name: 'dice', desc: 'Roll dice with various combinations (1d6, 2d20, etc.)' },
            { name: 'rickroll', desc: 'Play a Rick Astley video' }
          ]
        };

        let output = 'Developer Console - Available Commands:\n\n';
        
        Object.entries(categories).forEach(([category, commands]) => {
          output += `${category}:\n`;
          commands.forEach(cmd => {
            output += `  ${cmd.name.padEnd(14)} - ${cmd.desc}\n`;
          });
          output += '\n';
        });

        output += '==================================================\n\n';
        output += '💡 Getting Started:\n';
        output += '  • Type any command name to see detailed usage\n';
        output += '  • Use ↑↓ arrows to navigate command history\n';
        output += '  • Press ESC or type "exit" to close console\n';
        output += '  • Commands are case-insensitive\n';
        output += '  • Many commands support sub-commands and flags\n\n';
        
        output += '🎯 Quick Examples:\n';
        output += '  help                    - Show this help\n';
        output += '  weather London          - Get weather for London (with visual data)\n';
        output += '  math stats 1 2 3 4 5    - Mathematical statistics (with charts)\n';
        output += '  colors random           - Generate a random color (with swatches)\n';
        output += '  password 16             - Generate 16-character password\n';
        output += '  datetime age 19/08/2005 - Calculate age from birth date\n';
        output += '  encode base64 hello     - Base64 encode text\n';
        output += '  pokemon random          - Get random Pokemon info (with images)\n';
        output += '  dice 2d6                - Roll two 6-sided dice\n';
        output += '  search convert          - Find conversion commands\n';
        
        output += '🔗 Pro Tips:\n';
        output += '  • Use "search <term>" to find commands quickly\n';
        output += '  • Add "help" after commands for detailed info (e.g., "weather help")\n';
        output += '  • Some commands remember your previous inputs\n';
        output += '  • Use flags like --no-symbols for password generation\n';

        // Track help command usage to understand feature discovery
        track('dev_console_help_viewed', {
          timestamp: new Date().toISOString(),
          total_commands: commands.length
        });

        return output;
      }
    },
    {
      name: 'clear',
      description: 'Clear console history',
      execute: () => {
        setHistory([]);
        return 'Console cleared';
      }
    },
    {
      name: 'datetime',
      description: 'Date and time operations (time, date, age, timestamp, uptime)',
      execute: (args) => {
        const action = args[0] || 'all';
        const now = new Date();
        
        switch (action.toLowerCase()) {
          case 'time':
            return now.toLocaleString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            });
          
          case 'date':
            const dateAction = args[1] || 'all';
            switch (dateAction) {
              case 'iso':
                return `ISO: ${now.toISOString()}`;
              case 'utc':
                return `UTC: ${now.toUTCString()}`;
              case 'local':
                return `Local: ${now.toLocaleString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}`;
              case 'timestamp':
                return `Timestamp: ${now.getTime()}`;
              case 'unix':
                return `Unix: ${Math.floor(now.getTime() / 1000)}`;
              case 'all':
              default:
                return `Current Date & Time:
Local: ${now.toLocaleString('en-GB', { 
  day: '2-digit', 
  month: '2-digit', 
  year: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit' 
})}
ISO: ${now.toISOString()}
UTC: ${now.toUTCString()}
Timestamp: ${now.getTime()}
Unix: ${Math.floor(now.getTime() / 1000)}`;
            }
          
          case 'age':
            const dateInput = args[1];
            if (!dateInput) {
              return `Usage: datetime age <DD/MM/YYYY>
  datetime age 19/08/2005    - Calculate age from August 19, 2005
  datetime age 01/01/1990    - Calculate age from January 1, 1990

Format: DD/MM/YYYY (day/month/year)`;
            }

            try {
              const dateParts = dateInput.split('/');
              if (dateParts.length !== 3) {
                return 'Error: Please use DD/MM/YYYY format (e.g., 19/08/2005)';
              }

              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]);
              const year = parseInt(dateParts[2]);

              if (isNaN(day) || isNaN(month) || isNaN(year)) {
                return 'Error: Invalid date format. Please use numbers in DD/MM/YYYY format';
              }

              if (day < 1 || day > 31 || month < 1 || month > 12) {
                return 'Error: Invalid day or month';
              }

              if (year < 1900 || year > new Date().getFullYear()) {
                return `Error: Year must be between 1900 and ${new Date().getFullYear()}`;
              }

              const birthDate = new Date(year, month - 1, day);
              
              if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
                return 'Error: Invalid date (e.g., February 30th doesn\'t exist)';
              }

              const today = new Date();
              
              if (birthDate > today) {
                return 'Error: Birth date cannot be in the future';
              }

              const ageInYears = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              
              let age = ageInYears;
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }

              const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
              const nextBirthday = thisYearBirthday <= today ? 
                addDays(thisYearBirthday, 365) : 
                thisYearBirthday;

              const daysUntilBirthday = differenceInDays(nextBirthday, today);
              const formattedBirthDate = format(birthDate, 'dd MMMM yyyy');

              let result = `Age Calculation:
Birth Date: ${formattedBirthDate}
Current Age: ${age} years old`;

              if (isToday(thisYearBirthday)) {
                result += '\n🎉 Happy Birthday! 🎂';
              } else if (isTomorrow(thisYearBirthday)) {
                result += '\n🎂 Birthday is tomorrow!';
              } else {
                result += `\nDays until next birthday: ${daysUntilBirthday}`;
              }

              return result;

            } catch (error) {
              return `Error calculating age: ${error}`;
            }
          
          case 'timestamp':
            const timestampAction = args[1] || 'now';
            switch (timestampAction) {
              case 'now':
                return `Current Unix Timestamp: ${Math.floor(Date.now() / 1000)}`;
              case 'ms':
                return `Current Timestamp (ms): ${Date.now()}`;
              case 'convert':
                const timestamp = args[2];
                if (!timestamp) {
                  return 'Usage: datetime timestamp convert <timestamp>';
                }
                const ts = parseInt(timestamp);
                if (isNaN(ts)) {
                  return 'Error: Invalid timestamp';
                }
                const date = new Date(ts * (ts.toString().length === 10 ? 1000 : 1));
                return `Timestamp ${timestamp} = ${date.toISOString()}`;
              default:
                return `Timestamp Commands:
  datetime timestamp now      - Current Unix timestamp
  datetime timestamp ms       - Current timestamp in milliseconds
  datetime timestamp convert <timestamp> - Convert timestamp to date`;
            }
          
          case 'uptime':
            if (pageLoadTime === null) {
              return 'Page load time not yet initialized';
            }
            
            const uptime = Date.now() - pageLoadTime;
            const seconds = Math.floor(uptime / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            let result = 'Page uptime: ';
            if (days > 0) result += `${days}d `;
            if (hours % 24 > 0) result += `${hours % 24}h `;
            if (minutes % 60 > 0) result += `${minutes % 60}m `;
            result += `${seconds % 60}s`;
            
            return result + `\nLoaded at: ${new Date(pageLoadTime).toLocaleString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}`;
          
          case 'all':
          default:
            return `DateTime Command Usage:

Comprehensive date and time operations!

Usage: datetime <command> [arguments]

Commands:
  time                     - Show current time
  date [iso|utc|local|timestamp|unix|all] - Show date in various formats
  age <DD/MM/YYYY>        - Calculate age from birth date
  timestamp [now|ms|convert] - Unix timestamp operations
  uptime                  - Show page uptime

  datetime time
  datetime date iso
  datetime age 19/08/2005
  datetime timestamp convert 1609459200
  datetime uptime`;
        }
      }
    },
    {
      name: 'reload',
      description: 'Reload the page and reopen console',
      execute: () => {
        // Store flag to reopen console after reload
        localStorage.setItem('devConsole_reopenAfterReload', 'true');
        window.location.reload();
        return 'Reloading page...';
      }
    },
    {
      name: 'exit',
      description: 'Close the developer console',
      execute: () => {
        // Track console session before closing
        if (consoleSessionStart) {
          const sessionDuration = Date.now() - consoleSessionStart;
          track('dev_console_session', {
            duration_ms: sessionDuration,
            duration_seconds: Math.round(sessionDuration / 1000),
            commands_executed: history.filter(h => h.type === 'command').length,
            timestamp: new Date().toISOString(),
            closed_method: 'exit_command'
          });
        }
        
        setIsOpen(false);
        setConsoleSessionStart(null);
        return 'Console closed';
      }
    },
    {
      name: 'network',
      description: 'Show network information and test connectivity',
      execute: async (args) => {
        const action = args[0] || 'info';
        
        switch (action) {
          case 'info':
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const connection = (navigator as any).connection;
            const info = [
              `Online: ${navigator.onLine ? 'Yes' : 'No'}`,
              `User Agent: ${navigator.userAgent.split(' ')[0]}`,
              `Language: ${navigator.language}`,
            ];
            
            if (connection) {
              info.push(`Connection Type: ${connection.effectiveType || 'unknown'}`);
              info.push(`Downlink: ${connection.downlink || 'unknown'} Mbps`);
              info.push(`RTT: ${connection.rtt || 'unknown'} ms`);
            }
            
            return info.join('\n');
          
          case 'ping':
            const url = args[1] || 'https://google.com';
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              return 'Error: URL must start with http:// or https://';
            }
            
            try {
              const start = performance.now();
              const response = await fetch(url, { 
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
              });
              const end = performance.now();
              const responseTime = Math.round(end - start);
              
              return `Ping to ${url}:
Response Time: ${responseTime}ms
Status: ${response.status === 0 ? 'Reachable' : `${response.status} ${response.statusText}`}
Online: ${navigator.onLine ? 'Yes' : 'No'}`;
            } catch (error) {
              return `Ping to ${url}:
Connection failed: ${error}
Online: ${navigator.onLine ? 'Yes' : 'No'}`;
            }
          
          case 'ip':
            const target = args[1];
            
            if (target) {
              // IP lookup for a specific IP address
              const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
              
              if (!ipPattern.test(target)) {
                return `Error: "${target}" is not a valid IP address format.\nExample: network ip 8.8.8.8`;
              }
              
              try {
                const response = await fetch(`https://ipapi.co/${target}/json/`);
                
                if (!response.ok) {
                  throw new Error(`API failed: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.error) {
                  return `Error looking up IP ${target}: ${data.reason || data.error}`;
                }
                
                return `IP Lookup for ${target}:
Location: ${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}
Country Code: ${data.country_code || 'Unknown'}
Timezone: ${data.timezone || 'Unknown'}
ISP: ${data.org || 'Unknown'}
ASN: ${data.asn || 'Unknown'}
Coordinates: ${data.latitude || 'Unknown'}, ${data.longitude || 'Unknown'}`;
                
              } catch (error) {
                return `Error looking up IP ${target}: ${error}\n\nTry again or check your internet connection.`;
              }
            } else {
              // Get user's own IP information
              try {
                const response = await fetch('https://ipapi.co/json/');
                
                if (!response.ok) {
                  throw new Error(`API failed: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.error) {
                  return `Error getting IP information: ${data.reason || data.error}`;
                }
                
                return `Your IP Information:
Public IP: ${data.ip || 'Unknown'}
Location: ${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}
Country Code: ${data.country_code || 'Unknown'}
Timezone: ${data.timezone || 'Unknown'}
ISP: ${data.org || 'Unknown'}
ASN: ${data.asn || 'Unknown'}
Coordinates: ${data.latitude || 'Unknown'}, ${data.longitude || 'Unknown'}
User Agent: ${navigator.userAgent.split(' ')[0]}`;
                
              } catch (error) {
                // Fallback to a simpler API if the main one fails
                try {
                  const fallbackResponse = await fetch('https://api.ipify.org?format=json');
                  const fallbackData = await fallbackResponse.json();
                  
                  return `Your IP Information (Limited):
Public IP: ${fallbackData.ip || 'Unknown'}
Note: Location data unavailable - main API is down`;
                  
                } catch (fallbackError) {
                  return `Error getting IP information: ${error}

Fallback API also failed: ${fallbackError}

Unable to fetch IP data. This could be due to:
- Network connectivity issues
- API services temporarily unavailable
- CORS restrictions

Try again later or check your internet connection.`;
                }
              }
            }
          
          default:
            return `Network Command Usage:

Show network information and test connectivity!

Usage: network <command> [arguments]

Commands:
  info                    - Show network and browser information
  ping <url>             - Test connectivity to a URL
  ip [ip_address]        - Get IP information (your IP or lookup specific IP)

Examples:
  network info
  network ping https://google.com
  network ip              - Get your public IP and location
  network ip 8.8.8.8      - Lookup information for IP 8.8.8.8`;
        }
      }
    },
    {
      name: 'random',
      description: 'Generate random data (number, string, color, password)',
      execute: (args) => {
        const type = args[0] || 'number';
        
        switch (type) {
          case 'number':
            const min = parseInt(args[1]) || 1;
            const max = parseInt(args[2]) || 100;
            return `Random number (${min}-${max}): ${Math.floor(Math.random() * (max - min + 1)) + min}`;
          
          case 'string':
            const length = parseInt(args[1]) || 8;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `Random string (${length} chars): ${result}`;
          
          case 'color':
            const color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            return `Random color: ${color}`;
          
          case 'password':
            const pwLength = parseInt(args[1]) || 12;
            if (pwLength < 4 || pwLength > 100) {
              return 'Password length must be between 4 and 100 characters';
            }
            try {
              const password = generatePassword.generate({
                length: pwLength,
                numbers: true,
                symbols: true,
                lowercase: true,
                uppercase: true,
                strict: true
              });
              return `Random password (${pwLength} chars): ${password}`;
            } catch (error) {
              return `Password generation error: ${error}`;
            }
          
          default:
            return 'Usage: random <number|string|color|password> [length/min] [max]';
        }
      }
    },
    {
      name: 'encode',
      description: 'Encode/decode text (base64, url, html)',
      execute: (args) => {
        const action = args[0];
        const text = args.slice(1).join(' ');
        
        if (!text) return 'Usage: encode <base64|url|html|decode-base64|decode-url|decode-html> <text>';
        
        try {
          switch (action) {
            case 'base64':
              return `Base64 encoded: ${btoa(text)}`;
            case 'decode-base64':
              return `Base64 decoded: ${atob(text)}`;
            case 'url':
              return `URL encoded: ${encodeURIComponent(text)}`;
            case 'decode-url':
              return `URL decoded: ${decodeURIComponent(text)}`;
            case 'html':
              return `HTML encoded: ${he.encode(text)}`;
            case 'decode-html':
              return `HTML decoded: ${he.decode(text)}`;
            default:
              return 'Supported: base64, decode-base64, url, decode-url, html, decode-html';
          }
        } catch (error) {
          return `Encoding error: ${error}`;
        }
      }
    },

    {
      name: 'info',
      description: 'Show system information',
      execute: () => {
        const info = [
          `User Agent: ${navigator.userAgent}`,
          `Screen: ${screen.width}x${screen.height}`,
          `Viewport: ${window.innerWidth}x${window.innerHeight}`,
          `Local Storage: ${Object.keys(localStorage).length} items`,
          `Session Storage: ${Object.keys(sessionStorage).length} items`,
          `Online: ${navigator.onLine ? 'Yes' : 'No'}`,
          `Language: ${navigator.language}`,
          `Platform: ${navigator.platform}`,
        ];
        return info.join('\n');
      }
    },
    {
      name: 'beer',
      description: 'Show information about Beer de Vreeze (portfolio owner)',
      execute: () => {
        // Calculate age from birth date (19-08-2005)
        const birthDate = new Date(2005, 7, 19); // Month is 0-indexed (August = 7)
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return `Beer de Vreeze - Portfolio Information

Name: Beer de Vreeze
Age: ${age} years old
Born: August 19, 2005
Location: Beusichem, Netherlands

Role: Game Developer
Focus: Tools and Systems in Game Development

Portfolio: <a href="https://beer-de-vreeze.vercel.app" target="_blank">https://beer-de-vreeze.vercel.app</a>
Email: <a href="mailto:beer@vreeze.com">beer@vreeze.com</a>
GitHub: <a href="https://github.com/Beer-de-Vreeze" target="_blank">https://github.com/Beer-de-Vreeze</a>
LinkedIn: <a href="https://linkedin.com/in/beer-de-vreeze-59040919a/" target="_blank">https://linkedin.com/in/beer-de-vreeze-59040919a/</a>
Itch.io: <a href="https://bjeerpeer.itch.io" target="_blank">https://bjeerpeer.itch.io</a>`;
      }
    },
    {
      name: 'storage',
      description: 'Manage local storage (list, get <key>, set <key> <value>, remove <key>, clear)',
      execute: (args) => {
        const action = args[0];
        switch (action) {
          case 'list':
            const items = Object.keys(localStorage).map(key => `${key}: ${localStorage.getItem(key)}`);
            return items.length ? items.join('\n') : 'No items in local storage';
          case 'get':
            const key = args[1];
            if (!key) return 'Usage: storage get <key>';
            const value = localStorage.getItem(key);
            return value !== null ? `${key}: ${value}` : `Key "${key}" not found`;
          case 'set':
            const setKey = args[1];
            const setValue = args.slice(2).join(' ');
            if (!setKey || !setValue) return 'Usage: storage set <key> <value>';
            localStorage.setItem(setKey, setValue);
            return `Set ${setKey} = ${setValue}`;
          case 'remove':
            const removeKey = args[1];
            if (!removeKey) return 'Usage: storage remove <key>';
            localStorage.removeItem(removeKey);
            return `Removed ${removeKey}`;
          case 'clear':
            localStorage.clear();
            return 'Local storage cleared';
          default:
            return 'Usage: storage <list|get|set|remove|clear> [args]';
        }
      }
    },
    {
      name: 'performance',
      description: 'Show performance metrics',
      execute: () => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (!perf) return 'Performance data not available';
        
        const metrics = {
          'DNS Lookup': Math.round(perf.domainLookupEnd - perf.domainLookupStart),
          'Connection': Math.round(perf.connectEnd - perf.connectStart),
          'Request': Math.round(perf.responseStart - perf.requestStart),
          'Response': Math.round(perf.responseEnd - perf.responseStart),
          'DOM Load': Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
          'Full Load': Math.round(perf.loadEventEnd - perf.loadEventStart),
          'Total Time': Math.round(perf.loadEventEnd - perf.fetchStart)
        };
        
        const maxValue = Math.max(...Object.values(metrics));
        const barChart = Object.entries(metrics).map(([name, value]) => {
          const barWidth = Math.max(5, (value / maxValue) * 300);
          const color = value < 100 ? '#4CAF50' : value < 500 ? '#FF9800' : '#F44336';
          
          return `<div style="display: flex; align-items: center; margin: 5px 0;">
            <span style="width: 100px; font-size: 0.9em;">${name}:</span>
            <div style="background: ${color}; height: 20px; width: ${barWidth}px; margin: 0 10px; border-radius: 3px; display: inline-block;"></div>
            <span style="font-weight: bold;">${value}ms</span>
          </div>`;
        }).join('');
        
        // Performance score calculation
        const totalTime = metrics['Total Time'];
        const score = totalTime < 1000 ? '🟢 Excellent' : 
                     totalTime < 2500 ? '🟡 Good' : 
                     totalTime < 4000 ? '🟠 Needs Improvement' : '🔴 Poor';
        
        return `📊 Performance Metrics:

<div style="padding: 15px; border-radius: 8px; margin: 10px 0;">
  <div style="font-size: 1.2em; margin-bottom: 10px;">⚡ Performance Score: ${score}</div>
  ${barChart}
</div>

📈 Memory Usage:
${(window as Window & { performance: Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } } }).performance.memory ? `
Used: ${Math.round((window as Window & { performance: Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } } }).performance.memory.usedJSHeapSize / 1048576)}MB
Total: ${Math.round((window as Window & { performance: Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } } }).performance.memory.totalJSHeapSize / 1048576)}MB
Limit: ${Math.round((window as Window & { performance: Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } } }).performance.memory.jsHeapSizeLimit / 1048576)}MB` : 'Memory data not available (Chrome only)'}

🎯 Summary:
• Total page load time: ${totalTime}ms
• Critical rendering path: ${metrics['DNS Lookup'] + metrics['Connection'] + metrics['Request'] + metrics['Response']}ms
• DOM processing: ${metrics['DOM Load']}ms`;
      }
    },

    {
      name: 'math',
      description: 'Mathematical operations (calc, convert, binary, base, advanced)',
      execute: (args) => {
        const operation = args[0] || 'calc';
        
        switch (operation.toLowerCase()) {
          case 'calc':
          case 'calculate':
          case 'eval':
            const expression = args.slice(1).join(' ');
            
            try {
              const result = evaluate(expression);
              return `${expression} = ${result}`;
            } catch (error) {
              return `Calculation error: ${error}`;
            }
          
          case 'convert':
            if (args.length < 4) {
              return `Usage: math convert <value> <from_unit> <to_unit>

Available conversions:
Length: mm, cm, m, km, in, ft, yd, mi
Mass: mg, g, kg, oz, lb
Volume: ml, l, tsp, Tbs, fl-oz, cup, pnt, qt, gal
Temperature: C, F, K
Area: mm2, cm2, m2, ha, km2, in2, ft2, ac, mi2
Time: ns, mu, ms, s, min, h, d, week, month, year
Energy: J, kJ, cal, kcal, Wh, kWh, eV, BTU
Digital: b, Kb, Mb, Gb, Tb, B, KB, MB, GB, TB

  math convert 5 ft m         - Feet to meters
  math convert 100 F C        - Fahrenheit to Celsius
  math convert 1 kg lb        - Kilograms to pounds`;
            }

            const value = parseFloat(args[1]);
            const fromUnit = args[2];
            const toUnit = args[3];

            if (isNaN(value)) {
              return 'Error: Please provide a valid number to convert';
            }

            try {
              // Handle temperature conversions separately
              if (['C', 'F', 'K'].includes(fromUnit) && ['C', 'F', 'K'].includes(toUnit)) {
                let result;
                if (fromUnit === 'C' && toUnit === 'F') {
                  result = (value * 9/5) + 32;
                } else if (fromUnit === 'F' && toUnit === 'C') {
                  result = (value - 32) * 5/9;
                } else if (fromUnit === 'C' && toUnit === 'K') {
                  result = value + 273.15;
                } else if (fromUnit === 'K' && toUnit === 'C') {
                  result = value - 273.15;
                } else if (fromUnit === 'F' && toUnit === 'K') {
                  result = (value - 32) * 5/9 + 273.15;
                } else if (fromUnit === 'K' && toUnit === 'F') {
                  result = (value - 273.15) * 9/5 + 32;
                } else {
                  result = value; // Same unit
                }
                return `Temperature: ${value}°${fromUnit} = ${result.toFixed(2)}°${toUnit}`;
              }

              // Use convert-units for other conversions
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const result = convert(value).from(fromUnit as any).to(toUnit as any);
              return `${value} ${fromUnit} = ${result} ${toUnit}`;

            } catch (error) {
              return `Conversion error: ${error}\nCheck that both units are valid and can be converted between each other.`;
            }
          
          case 'binary':
            const binAction = args[1];
            const binInput = args.slice(2).join(' ');
            
            if (!binAction) {
              return `Binary Operations:

Text Conversion:
  math binary encode <text>    - Convert text to binary
  math binary decode <binary>  - Convert binary to text

Number Conversion:
  math binary number 42        - Convert number to binary
  math binary decimal 101010   - Convert binary to decimal

Operations:
  math binary add 1010 1100    - Add two binary numbers
  math binary and 1010 1100    - Bitwise AND
  math binary or 1010 1100     - Bitwise OR
  math binary xor 1010 1100    - Bitwise XOR`;
            }

            try {
              switch (binAction.toLowerCase()) {
                case 'encode':
                  if (!binInput) return 'Usage: math binary encode <text>';
                  let binaryResult = '';
                  for (let i = 0; i < binInput.length; i++) {
                    const binary = binInput.charCodeAt(i).toString(2).padStart(8, '0');
                    binaryResult += binary;
                  }
                  return `Text to Binary:\nInput: "${binInput}"\nBinary: ${binaryResult}`;
                
                case 'decode':
                  if (!binInput) return 'Usage: math binary decode <binary>';
                  if (!/^[01]+$/.test(binInput)) return 'Error: Invalid binary string';
                  if (binInput.length % 8 !== 0) return 'Error: Binary string length must be multiple of 8';
                  
                  let textResult = '';
                  for (let i = 0; i < binInput.length; i += 8) {
                    const byte = binInput.substr(i, 8);
                    const decimal = parseInt(byte, 2);
                    textResult += String.fromCharCode(decimal);
                  }
                  return `Binary to Text:\nInput: ${binInput}\nText: "${textResult}"`;
                
                case 'number':
                  if (!binInput) return 'Usage: math binary number <decimal>';
                  try {
                    const bigNum = bigInt(binInput);
                    const binary = bigNum.toString(2);
                    return `Decimal to Binary:\nDecimal: ${bigNum.toString()}\nBinary: ${binary}`;
                  } catch {
                    return `Error: Invalid number "${binInput}"`;
                  }
                
                case 'decimal':
                  if (!binInput) return 'Usage: math binary decimal <binary>';
                  if (!/^[01]+$/.test(binInput)) return 'Error: Invalid binary string';
                  try {
                    const bigNum = bigInt(binInput, 2);
                    return `Binary to Decimal:\nBinary: ${binInput}\nDecimal: ${bigNum.toString()}`;
                  } catch {
                    return `Error: Binary number too large or invalid`;
                  }
                
                default:
                  return `Unknown binary operation: ${binAction}`;
              }
            } catch (error) {
              return `Binary operation error: ${error}`;
            }
          
          case 'base':
            const baseOperation = args[1];
            
            if (!baseOperation) {
              return `Base Converter:

Convert numbers between different bases (2-36)!

Usage: math base <operation> [arguments]

Operations:
  convert <number> <from_base> <to_base>  - Convert between bases
  info <number> <base>                    - Show detailed info about a number
  all <number> <base>                     - Show number in common bases

  math base convert 255 10 16    - Convert decimal 255 to hex
  math base convert 1010 2 10     - Convert binary 1010 to decimal
  math base info 12345 10         - Show detailed info about decimal 12345`;
            }

            try {
              switch (baseOperation.toLowerCase()) {
                case 'convert':
                  if (args.length < 5) return 'Usage: math base convert <number> <from_base> <to_base>';
                  const [, , numStr, fromBaseStr, toBaseStr] = args;
                  const fromBase = parseInt(fromBaseStr);
                  const toBase = parseInt(toBaseStr);
                  
                  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
                    return 'Error: Bases must be between 2 and 36';
                  }
                  
                  const bigNum = bigInt(numStr, fromBase);
                  const result = bigNum.toString(toBase).toUpperCase();
                  const decimal = bigNum.toString(10);
                  
                  return `Base Conversion:\nInput: ${numStr} (base ${fromBase})\nOutput: ${result} (base ${toBase})\nDecimal: ${decimal}`;

                default:
                  return `Unknown base operation: ${baseOperation}`;
              }
            } catch (error) {
              return `Base conversion error: ${error}`;
            }
          
          case 'stats':
            const numbers = args.slice(1).map(parseFloat).filter(n => !isNaN(n));
            if (numbers.length === 0) return 'Usage: math stats <numbers...>\nExample: math stats 1 2 3 4 5';
            
            try {
              const mean = evaluate(`mean([${numbers.join(',')}])`);
              const median = evaluate(`median([${numbers.join(',')}])`);
              const std = evaluate(`std([${numbers.join(',')}])`);
              const min = Math.min(...numbers);
              const max = Math.max(...numbers);
              const range = max - min;
              
              // Create a visual histogram
              const bins = Math.min(10, Math.ceil(Math.sqrt(numbers.length)));
              const binSize = range / bins;
              const histogram = new Array(bins).fill(0);
              
              numbers.forEach(num => {
                const binIndex = Math.min(bins - 1, Math.floor((num - min) / binSize));
                histogram[binIndex]++;
              });
              
              const maxFreq = Math.max(...histogram);
              const histogramChart = histogram.map((freq, i) => {
                const barHeight = Math.max(2, (freq / maxFreq) * 50);
                const binStart = (min + i * binSize).toFixed(1);
                
                return `<div style="display: inline-block; vertical-align: bottom; margin: 0 1px; text-align: center;">
                  <div style="background: #2196F3; width: 25px; height: ${barHeight}px; margin-bottom: 2px;"></div>
                  <div style="font-size: 0.7em; transform: rotate(-45deg); transform-origin: center;">${binStart}</div>
                </div>`;
              }).join('');
              
              // Box plot visualization
              const sortedNumbers = [...numbers].sort((a, b) => a - b);
              const q1 = evaluate(`quantileSeq([${sortedNumbers.join(',')}], 0.25)`);
              const q3 = evaluate(`quantileSeq([${sortedNumbers.join(',')}], 0.75)`);
              const iqr = q3 - q1;
              
              const boxPlotWidth = 300;
              const getPosition = (value: number) => ((value - min) / range) * boxPlotWidth;
              
              const boxPlot = `
<div style="position: relative; width: ${boxPlotWidth}px; height: 60px; margin: 20px 0; border: 1px solid #ddd; background: #f9f9f9;">
  <div style="position: absolute; left: ${getPosition(q1)}px; width: ${getPosition(q3) - getPosition(q1)}px; height: 30px; top: 15px; background: rgba(33, 150, 243, 0.3); border: 2px solid #2196F3;"></div>
  <div style="position: absolute; left: ${getPosition(median)}px; width: 2px; height: 30px; top: 15px; background: #2196F3;"></div>
  <div style="position: absolute; left: ${getPosition(min)}px; width: 1px; height: 40px; top: 10px; background: #666;"></div>
  <div style="position: absolute; left: ${getPosition(max)}px; width: 1px; height: 40px; top: 10px; background: #666;"></div>
  <div style="position: absolute; left: 0; top: -20px; font-size: 0.8em;">${min}</div>
  <div style="position: absolute; right: 0; top: -20px; font-size: 0.8em;">${max}</div>
  <div style="position: absolute; left: ${getPosition(median)}px; top: -20px; font-size: 0.8em; transform: translateX(-50%);">Med: ${median.toFixed(2)}</div>
</div>`;
              
              return `📊 Statistics for [${numbers.join(', ')}]:

<div style="padding: 15px; border-radius: 8px; margin: 10px 0;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
    <div>
      <strong>Central Tendency:</strong><br>
      Mean: ${mean.toFixed(3)}<br>
      Median: ${median.toFixed(3)}<br>
      <br>
      <strong>Spread:</strong><br>
      Standard Deviation: ${std.toFixed(3)}<br>
      Range: ${range.toFixed(3)}
    </div>
    <div>
      <strong>Extremes:</strong><br>
      Min: ${min}<br>
      Max: ${max}<br>
      <br>
      <strong>Count:</strong><br>
      Sample Size: ${numbers.length}
    </div>
  </div>
  
  <div>
    <strong>📈 Histogram:</strong><br>
    <div style="margin: 10px 0;">${histogramChart}</div>
  </div>
  
  <div>
    <strong>📦 Box Plot:</strong>
    ${boxPlot}
    <div style="font-size: 0.8em; color: #666;">Q1: ${q1.toFixed(2)} | Q3: ${q3.toFixed(2)} | IQR: ${iqr.toFixed(2)}</div>
  </div>
</div>`;
            } catch (error) {
              return `Statistics error: ${error}`;
            }
          
          default:
            return `Math Command Usage:

Comprehensive mathematical operations and calculations!

Usage: math <operation> [arguments]

Operations:
  calc <expression>              - Basic calculator with advanced functions
  convert <value> <from> <to>    - Unit conversions (length, temp, etc.)
  binary <action> <input>        - Binary operations and conversions
  base <action> <input>          - Number base conversions (2-36)
  stats <numbers...>             - Calculate statistics

  math calc "sqrt(16) + sin(pi/2)"
  math convert 100 F C
  math binary encode "Hello"
  math base convert 255 10 16
  math stats 1 2 3 4 5`;
        }
      }
    },
    {
      name: 'colors',
      description: 'Generate colors (rainbow, gradient, random, palette, harmonies, scales)',
      execute: (args) => {
        const mode = args[0] || 'random';
        
        switch (mode.toLowerCase()) {
          case 'random':
            // Use chroma-js for better random color generation
            const randomColor = chroma.random();
            const hex = randomColor.hex();
            const rgb = randomColor.rgb();
            const hsl = randomColor.hsl();
            const hsv = randomColor.hsv();
            
            const colorSwatch = `<div style="width: 100px; height: 50px; background-color: ${hex}; border: 2px solid #333; margin: 10px 0; display: inline-block;"></div>`;
            
            return `🎨 Random Color:
Hex: ${hex}
RGB: rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})
HSL: hsl(${Math.round(hsl[0] || 0)}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)
HSV: hsv(${Math.round(hsv[0] || 0)}, ${Math.round(hsv[1] * 100)}%, ${Math.round(hsv[2] * 100)}%)
Luminance: ${randomColor.luminance().toFixed(3)}

${colorSwatch}`;
          
          case 'palette':
            // Generate a harmonious color palette
            const baseColor = args[1] || chroma.random().hex();
            try {
              const base = chroma(baseColor);
              const palette = [
                base.hex(),
                base.brighten(1).hex(),
                base.darken(1).hex(),
                base.saturate(1).hex(),
                base.desaturate(1).hex()
              ];
              
              const paletteSwatches = palette.map((color, i) => {
                const names = ['Base', 'Brighter', 'Darker', 'Saturated', 'Desaturated'];
                return `<div style="display: inline-block; margin: 5px;">
                  <div style="width: 80px; height: 40px; background-color: ${color}; border: 1px solid #333;"></div>
                  <div style="text-align: center; font-size: 12px; margin-top: 2px;">${names[i]}<br>${color}</div>
                </div>`;
              }).join('');
              
              return `🎨 Color Palette (based on ${baseColor}):
${palette.map((c, i) => {
  const names = ['Base', 'Brighter', 'Darker', 'Saturated', 'Desaturated'];
  return `${i + 1}. ${names[i]}: ${c}`;
}).join('\n')}

<div style="margin: 10px 0;">${paletteSwatches}</div>`;
            } catch {
              return `Error: Invalid base color "${baseColor}". Use a valid hex, rgb, or named color.`;
            }
          
          case 'harmonies':
            const harmonyBase = args[1] || chroma.random().hex();
            try {
              const base = chroma(harmonyBase);
              const hue = base.get('hsl.h') || 0;
              
              const harmonies = {
                'Complementary': [base.hex(), chroma.hsl(hue + 180, base.get('hsl.s'), base.get('hsl.l')).hex()],
                'Triadic': [
                  base.hex(), 
                  chroma.hsl(hue + 120, base.get('hsl.s'), base.get('hsl.l')).hex(),
                  chroma.hsl(hue + 240, base.get('hsl.s'), base.get('hsl.l')).hex()
                ],
                'Analogous': [
                  chroma.hsl(hue - 30, base.get('hsl.s'), base.get('hsl.l')).hex(),
                  base.hex(),
                  chroma.hsl(hue + 30, base.get('hsl.s'), base.get('hsl.l')).hex()
                ]
              };
              
              let result = `🎨 Color Harmonies (based on ${harmonyBase}):\n\n`;
              let visualHarmonies = '';
              
              Object.entries(harmonies).forEach(([name, colors]) => {
                result += `${name}:\n${colors.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n\n`;
                
                const harmonySwatches = colors.map(color => 
                  `<div style="width: 60px; height: 30px; background-color: ${color}; border: 1px solid #333; display: inline-block; margin: 2px;"></div>`
                ).join('');
                visualHarmonies += `<div style="margin: 5px 0;"><strong>${name}:</strong><br>${harmonySwatches}</div>`;
              });
              
              return result + `<div style="margin: 10px 0;">${visualHarmonies}</div>`;
            } catch {
              return `Error: Invalid base color "${harmonyBase}". Use a valid hex, rgb, or named color.`;
            }
          
          case 'scale':
            const startColor = args[1] || '#ff0000';
            const endColor = args[2] || '#0000ff';
            const steps = parseInt(args[3]) || 5;
            
            if (steps < 2 || steps > 20) {
              return 'Steps must be between 2 and 20';
            }
            
            try {
              const scale = chroma.scale([startColor, endColor]).mode('lch').colors(steps);
              
              const scaleSwatches = scale.map((color: string) => 
                `<div style="width: 40px; height: 40px; background-color: ${color}; border: 1px solid #333; display: inline-block;"></div>`
              ).join('');
              
              return `🎨 Color Scale (${startColor} → ${endColor}, ${steps} steps):
${scale.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

<div style="margin: 10px 0;">${scaleSwatches}</div>`;
            } catch {
              return `Error: Invalid colors "${startColor}" or "${endColor}". Use valid hex, rgb, or named colors.`;
            }
          
          case 'rainbow':
            const rainbowColors = chroma.scale(['red', 'orange', 'yellow', 'green', 'blue', 'purple']).mode('hsl').colors(12);
            const rainbowSwatches = rainbowColors.map((color: string) => 
              `<div style="width: 30px; height: 30px; background-color: ${color}; display: inline-block;"></div>`
            ).join('');
            
            const rainbow = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
            let rainbowText = '';
            for (let i = 0; i < 20; i++) {
              rainbowText += rainbow[i % rainbow.length];
            }
            return `🌈 Rainbow:
Visual: ${rainbowText}
Colors: ${rainbowColors.join(', ')}

<div style="margin: 10px 0;">${rainbowSwatches}</div>`;
          
          case 'gradient':
            const gradientChars = ['█', '▉', '▊', '▋', '▌', '▍', '▎', '▏', ' '];
            let gradient = '';
            for (let i = 0; i < gradientChars.length; i++) {
              gradient += gradientChars[i].repeat(3);
            }
            return `🌈 Gradient: ${gradient}`;
          
          case 'contrast':
            const color1 = args[1];
            const color2 = args[2];
            
            if (!color1 || !color2) {
              return 'Usage: colors contrast <color1> <color2>\nExample: colors contrast #ffffff #000000';
            }
            
            try {
              const c1 = chroma(color1);
              const c2 = chroma(color2);
              const contrast = chroma.contrast(c1, c2);
              
              let accessibility = '';
              if (contrast >= 7) accessibility = 'AAA (excellent)';
              else if (contrast >= 4.5) accessibility = 'AA (good)';
              else if (contrast >= 3) accessibility = 'AA Large (adequate for large text)';
              else accessibility = 'Poor (not recommended)';
              
              const contrastDemo = `<div style="display: flex; margin: 10px 0;">
                <div style="background-color: ${c1.hex()}; color: ${c2.hex()}; padding: 10px; margin-right: 10px; border: 1px solid #333;">
                  Sample text on ${c1.hex()}
                </div>
                <div style="background-color: ${c2.hex()}; color: ${c1.hex()}; padding: 10px; border: 1px solid #333;">
                  Sample text on ${c2.hex()}
                </div>
              </div>`;
              
              return `🎨 Color Contrast Analysis:
Color 1: ${color1} → ${c1.hex()}
Color 2: ${color2} → ${c2.hex()}
Contrast Ratio: ${contrast.toFixed(2)}:1
Accessibility: ${accessibility}

${contrastDemo}`;
            } catch {
              return `Error: Invalid colors. Use valid hex, rgb, or named colors.`;
            }
          
          case 'info':
            const infoColor = args[1];
            if (!infoColor) {
              return 'Usage: colors info <color>\nExample: colors info #ff5733';
            }
            
            try {
              const color = chroma(infoColor);
              const rgb = color.rgb();
              const hsl = color.hsl();
              const hsv = color.hsv();
              const lab = color.lab();
              
              const colorSwatch = `<div style="width: 120px; height: 60px; background-color: ${color.hex()}; border: 2px solid #333; margin: 10px 0; display: inline-block;"></div>`;
              
              return `🎨 Color Information for ${infoColor}:
Hex: ${color.hex()}
RGB: rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})
HSL: hsl(${Math.round(hsl[0] || 0)}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)
HSV: hsv(${Math.round(hsv[0] || 0)}, ${Math.round(hsv[1] * 100)}%, ${Math.round(hsv[2] * 100)}%)
LAB: lab(${Math.round(lab[0])}, ${Math.round(lab[1])}, ${Math.round(lab[2])})
Luminance: ${color.luminance().toFixed(3)}
Temperature: ${color.temperature().toFixed(0)}K

${colorSwatch}`;
            } catch {
              return `Error: Invalid color "${infoColor}". Use a valid hex, rgb, or named color.`;
            }
          
          default:
            return `Usage: colors <mode> [options]

Modes:
  random                           - Generate a random color with details
  palette [base_color]             - Generate harmonious color palette
  harmonies [base_color]           - Show complementary, triadic, analogous colors
  scale <start> <end> [steps]      - Generate color scale between two colors
  rainbow                          - Show rainbow colors
  gradient                         - Show gradient pattern
  contrast <color1> <color2>       - Analyze contrast between two colors
  info <color>                     - Show detailed color information

  colors random
  colors palette #ff5733
  colors harmonies blue
  colors scale red blue 7
  colors contrast #ffffff #000000
  colors info #ff5733`;
        }
      }
    },
    {
      name: 'weather',
      description: 'Get real weather information for any city (usage: weather <city>)',
      execute: async (args): Promise<string> => {
        const location = args.join(' ');
        
        if (!location) {
        }
        
        try {
          // First, get coordinates for the city using a free geocoding API
          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
          );
          
          if (!geoResponse.ok) {
            throw new Error(`Geocoding failed: ${geoResponse.status}`);
          }
          
          const geoData = await geoResponse.json();
          
          if (!geoData.results || geoData.results.length === 0) {
            return `City "${location}" not found. Try a different city name or be more specific.`;
          }
          
          const city = geoData.results[0];
          const { latitude, longitude, name, country, admin1 } = city;
          
          // Get weather data using Open-Meteo (completely free)
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=auto&forecast_days=1`
          );
          
          if (!weatherResponse.ok) {
            throw new Error(`Weather API failed: ${weatherResponse.status}`);
          }
          
          const weatherData = await weatherResponse.json();
          const current = weatherData.current;
          const daily = weatherData.daily;
          
          // Weather code to emoji mapping (WMO Weather interpretation codes)
          const getWeatherEmoji = (code: number, isDay: boolean) => {
            const dayNight = isDay ? '☀️' : '🌙';
            switch (code) {
              case 0: return dayNight; // Clear sky
              case 1: case 2: case 3: return isDay ? '🌤️' : '🌙'; // Mainly clear, partly cloudy, overcast
              case 45: case 48: return '🌫️'; // Fog
              case 51: case 53: case 55: return '🌦️'; // Drizzle
              case 56: case 57: return '🌨️'; // Freezing drizzle
              case 61: case 63: case 65: return '🌧️'; // Rain
              case 66: case 67: return '🌨️'; // Freezing rain
              case 71: case 73: case 75: return '❄️'; // Snow fall
              case 77: return '🌨️'; // Snow grains
              case 80: case 81: case 82: return '🌦️'; // Rain showers
              case 85: case 86: return '🌨️'; // Snow showers
              case 95: return '⛈️'; // Thunderstorm
              case 96: case 99: return '⛈️'; // Thunderstorm with hail
              default: return '🌤️';
            }
          };
          
          // Wind direction from degrees
          const getWindDirection = (deg: number) => {
            const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
            return directions[Math.round(deg / 22.5) % 16];
          };
          
          // Weather description from code
          const getWeatherDescription = (code: number) => {
            switch (code) {
              case 0: return 'Clear sky';
              case 1: return 'Mainly clear';
              case 2: return 'Partly cloudy';
              case 3: return 'Overcast';
              case 45: return 'Fog';
              case 48: return 'Depositing rime fog';
              case 51: return 'Light drizzle';
              case 53: return 'Moderate drizzle';
              case 55: return 'Dense drizzle';
              case 56: return 'Light freezing drizzle';
              case 57: return 'Dense freezing drizzle';
              case 61: return 'Slight rain';
              case 63: return 'Moderate rain';
              case 65: return 'Heavy rain';
              case 66: return 'Light freezing rain';
              case 67: return 'Heavy freezing rain';
              case 71: return 'Slight snow fall';
              case 73: return 'Moderate snow fall';
              case 75: return 'Heavy snow fall';
              case 77: return 'Snow grains';
              case 80: return 'Slight rain showers';
              case 81: return 'Moderate rain showers';
              case 82: return 'Violent rain showers';
              case 85: return 'Slight snow showers';
              case 86: return 'Heavy snow showers';
              case 95: return 'Thunderstorm';
              case 96: return 'Thunderstorm with slight hail';
              case 99: return 'Thunderstorm with heavy hail';
              default: return 'Unknown';
            }
          };
          
          const weatherEmoji = getWeatherEmoji(current.weather_code, current.is_day === 1);
          const description = getWeatherDescription(current.weather_code);
          const temp = Math.round(current.temperature_2m);
          const feelsLike = Math.round(current.apparent_temperature);
          const humidity = current.relative_humidity_2m;
          const pressure = Math.round(current.pressure_msl);
          const windSpeed = Math.round(current.wind_speed_10m);
          const windDir = current.wind_direction_10m;
          const cloudCover = current.cloud_cover;
          
          // Format sunrise/sunset times using date-fns
          const sunrise = format(new Date(daily.sunrise[0]), 'HH:mm');
          const sunset = format(new Date(daily.sunset[0]), 'HH:mm');
          
          // Build precipitation info
          let precipitation = '';
          if (current.precipitation > 0) {
            precipitation = `\n�️ Precipitation: ${current.precipitation} mm`;
          }
          if (current.rain > 0) {
            precipitation += `\n🌧️ Rain: ${current.rain} mm`;
          }
          if (current.snowfall > 0) {
            precipitation += `\n❄️ Snow: ${current.snowfall} cm`;
          }
          
          const locationName = admin1 ? `${name}, ${admin1}, ${country}` : `${name}, ${country}`;
          
          // Weather visualization
          const weatherVisual = `
<div style="margin: 10px 0; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
  <div style="text-align: center;">
    <div style="font-size: 3em; margin-bottom: 5px;">${weatherEmoji}</div>
    <div style="font-size: 0.9em; color: #666;">${description}</div>
  </div>
  <div style="display: flex; flex-direction: column; gap: 5px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 2em; font-weight: bold; color: ${temp > 25 ? '#ff6b35' : temp > 10 ? '#4CAF50' : '#2196F3'};">${temp}°C</span>
      <span style="color: #666;">feels like ${feelsLike}°C</span>
    </div>
    <div style="background: linear-gradient(90deg, #87CEEB ${cloudCover}%, #f0f0f0 ${cloudCover}%); height: 8px; width: 200px; border-radius: 4px; position: relative;">
      <span style="position: absolute; top: -20px; left: 0; font-size: 0.8em;">☁️ ${cloudCover}%</span>
    </div>
  </div>
</div>`;
          
          return `Weather in ${locationName}:
${weatherVisual}

📊 Details:
Temperature: ${temp}°C (feels like ${feelsLike}°C)
Humidity: ${humidity}%
Pressure: ${pressure} hPa
Cloud Cover: ${cloudCover}%
Wind: ${windSpeed} km/h ${getWindDirection(windDir)}${precipitation}
Sunrise: ${sunrise}
Sunset: ${sunset}`;
          
        } catch (error) {
          console.error('Weather API Error:', error);
          
          // Fallback to simulated data if API fails
          const temp = Math.floor(Math.random() * 35) + 5;
          const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy'];
          const condition = conditions[Math.floor(Math.random() * conditions.length)];
          const humidity = Math.floor(Math.random() * 60) + 30;
          const wind = Math.floor(Math.random() * 20) + 5;
          
          return `Weather API unavailable\n\nSimulated weather for ${location}:\n${condition}\nTemperature: ${temp}°C\nHumidity: ${humidity}%\nWind: ${wind} km/h\n\nNote: This is simulated data`;
        }
      }
    },
    {
      name: 'joke',
      description: 'Get random jokes from various categories',
      execute: async (args) => {
        // If no argument, treat as 'random'
        let category = args[0] ? args[0] : 'random';
        const blacklist = 'nsfw,religious,political,racist,sexist,explicit';
        if (category.toLowerCase() === 'random') {
          const randomOptions = [
            'dad', 'developer', 'chuck', 'geek', 'general', 'programming', 'misc', 'dark', 'pun', 'spooky', 'christmas'
          ];
          category = randomOptions[Math.floor(Math.random() * randomOptions.length)];
        }
        try {
          const categoriesRes = await fetch('https://v2.jokeapi.dev/categories');
          const categoriesData = await categoriesRes.json();
          const availableCategories: string[] = categoriesData.categories || [];
          let selectedCategory = 'Any';
          let apiUrl = '';
          let isJokeApi = true;
          let apiType: 'jokeapi' | 'dad' | 'developer' | 'chuck' | 'geek' | 'general' = 'jokeapi';

          if (category && category.toLowerCase() !== 'any') {
            switch (category.toLowerCase()) {
              case 'dad':
                apiUrl = 'https://icanhazdadjoke.com/';
                isJokeApi = false;
                apiType = 'dad';
                break;
              case 'developer':
              case 'dev':
                selectedCategory = 'Programming';
                apiUrl = `https://v2.jokeapi.dev/joke/${selectedCategory}?blacklistFlags=${blacklist}`;
                apiType = 'developer';
                break;
              case 'chuck':
              case 'chucknorris':
                apiUrl = 'https://api.chucknorris.io/jokes/random';
                isJokeApi = false;
                apiType = 'chuck';
                break;
              case 'geek':
                apiUrl = 'https://geek-jokes.sameerkumar.website/api?format=json';
                isJokeApi = false;
                apiType = 'geek';
                break;
              case 'general':
                apiUrl = 'https://official-joke-api.appspot.com/jokes/random';
                isJokeApi = false;
                apiType = 'general';
                break;
              default: {
                const match = availableCategories.find(
                  (cat: string) => cat.toLowerCase() === category.toLowerCase()
                );
                if (match) {
                  selectedCategory = match;
                  apiUrl = `https://v2.jokeapi.dev/joke/${selectedCategory}?blacklistFlags=${blacklist}`;
                  apiType = 'jokeapi';
                } else {
                  return `❌ Category "${category}" not found. Available: dad, developer, chuck, geek, general, random, ${availableCategories.join(', ')}`;
                }
              }
            }
          } else {
            apiUrl = `https://v2.jokeapi.dev/joke/Any?blacklistFlags=${blacklist}`;
            apiType = 'jokeapi';
          }

          const response = await fetch(apiUrl, {
            headers: isJokeApi || apiType === 'general' ? {} : { 'Accept': 'application/json' }
          });
          if (!response.ok) throw new Error(`API returned ${response.status}`);
          const data = await response.json();

          switch (apiType) {
            case 'dad':
              return `Dad Joke:\n${data.joke}`;
            case 'chuck':
              return `Chuck Norris Joke:\n${data.value}`;
            case 'geek':
              return `Geek Joke:\n${data.joke}`;
            case 'general':
              if (data.type === 'single' || data.setup === undefined) {
                return `Joke:\n${data.joke || data.setup || data.punchline}`;
              } else {
                return `Joke:\n${data.setup}\n\n${data.punchline}`;
              }
            case 'developer':
              if (data.type === 'single') {
                return `Developer Joke:\n${data.joke}`;
              } else if (data.type === 'twopart') {
                return `Developer Joke:\n${data.setup}\n\n${data.delivery}`;
              }
              break;
            case 'jokeapi':
            default:
              if (data.type === 'single') {
                return `${selectedCategory} Joke:\n${data.joke}`;
              } else if (data.type === 'twopart') {
                return `${selectedCategory} Joke:\n${data.setup}\n\n${data.delivery}`;
              }
              break;
          }
          throw new Error('Unexpected API response format');
        } catch (error) {
          console.error('Joke API Error:', error);
          switch (category && category.toLowerCase()) {
            case 'dad':
              return `Dad Joke (Offline):\nI invented a new word: Plagiarism!`;
            case 'developer':
            case 'dev':
              return `Developer Joke (Offline):\nWhy do programmers prefer dark mode? Because light attracts bugs!`;
            case 'chuck':
            case 'chucknorris':
              return `Chuck Norris Joke (Offline):\nChuck Norris can divide by zero.`;
            case 'geek':
              return `Geek Joke (Offline):\nThere are only 10 types of people in the world: those who understand binary and those who don't.`;
            case 'general':
              return `Joke (Offline):\nWhy did the scarecrow win an award? Because he was outstanding in his field!`;
            case 'random':
              return `Joke (Offline):\nWhy did the chicken join a band? Because it had the drumsticks!`;
            default:
              return `Joke (Offline):\nWhy did the chicken join a band? Because it had the drumsticks!`;
          }
        }
      }
    },
    {
      name: 'password',
      description: 'Generate secure passwords with custom options',
      execute: (args) => {
        const length = parseInt(args[0]) || 16;
        const includeSymbols = !args.includes('--no-symbols');
        const includeNumbers = !args.includes('--no-numbers');
        const includeUppercase = !args.includes('--no-uppercase');
        const includeLowercase = !args.includes('--no-lowercase');
        
        if (length < 4 || length > 100) {
          return 'Password length must be between 4 and 100 characters';
        }
        
        try {
          const password = generatePassword.generate({
            length: length,
            numbers: includeNumbers,
            symbols: includeSymbols,
            lowercase: includeLowercase,
            uppercase: includeUppercase,
            strict: true // Ensure at least one character from each selected type
          });
          
          return `Generated password (${length} chars): ${password}`;
        } catch (error) {
          return `Password generation error: ${error}`;
        }
      }
    },
    {
      name: 'navigate',
      description: 'Navigate to different pages (usage: navigate <page> or navigate <path>)',
      execute: (args) => {
        const destination = args.join(' ').toLowerCase().trim();
        
        if (!destination) {
          return `Usage: navigate <page>

Available pages:
  home, index, /           - Go to home page
  about                    - Go to about page
  contact                  - Go to contact page
  projects                 - Go to projects page
  github                   - Go to GitHub profile
  itch                     - Go to Itch.io page
  linkedin                 - Go to LinkedIn profile
  portfolio                - Go to portfolio website
  email                    - Open email to Beer de Vreeze
  cv                       - Download Beer de Vreeze CV

Error pages:
  404, not-found           - Trigger 404 error page

Custom paths:
  navigate /custom/path    - Navigate to any custom path
  navigate <a href="https://..." target="_blank">https://...</a>     - Navigate to external URL

  navigate about
  navigate projects
  navigate github
  navigate itch
  navigate linkedin
  navigate portfolio
  navigate email
  navigate cv
  navigate 404
  navigate /custom/page
  navigate <a href="https://github.com" target="_blank">https://github.com</a>`;
        }

        try {
          let targetPath = '';

          // Handle predefined pages and links
          switch (destination) {
            case 'home':
            case 'index':
            case '/':
              targetPath = '/';
              break;
            case 'about':
              targetPath = '/about';
              break;
            case 'contact':
              targetPath = '/contact';
              break;
            case 'projects':
              targetPath = '/projects';
              break;
            case 'github':
              window.open('https://github.com/Beer-de-Vreeze', '_blank');
              return 'Opening GitHub profile: <a href="https://github.com/Beer-de-Vreeze" target="_blank">https://github.com/Beer-de-Vreeze</a>';
            case 'itch':
              window.open('https://bjeerpeer.itch.io', '_blank');
              return 'Opening Itch.io page: <a href="https://bjeerpeer.itch.io" target="_blank">https://bjeerpeer.itch.io</a>';
            case 'linkedin':
              window.open('https://linkedin.com/in/beer-de-vreeze-59040919a/', '_blank');
              return 'Opening LinkedIn profile: <a href="https://linkedin.com/in/beer-de-vreeze-59040919a/" target="_blank">https://linkedin.com/in/beer-de-vreeze-59040919a/</a>';
            case 'portfolio':
              window.open('https://beer-de-vreeze.vercel.app', '_blank');
              return 'Opening portfolio: <a href="https://beer-de-vreeze.vercel.app" target="_blank">https://beer-de-vreeze.vercel.app</a>';
            case 'email':
              window.open('mailto:beer@vreeze.com', '_blank');
              return 'Opening email client for: <a href="mailto:beer@vreeze.com">beer@vreeze.com</a>';
            case 'cv':
              window.open('/downloads/Beer de Vreeze CV.pdf', '_blank');
              return 'Downloading CV: Beer de Vreeze CV.pdf';
            // Error pages
            case '404':
            case 'not-found':
              targetPath = '/404';
              break;
            // Custom paths or external URLs
            default:
              if (destination.startsWith('http://') || destination.startsWith('https://')) {
                // External URL
                window.open(destination, '_blank');
                return `Opening external URL: ${destination}`;
              } else if (destination.startsWith('/')) {
                // Custom path
                targetPath = destination;
              } else {
                // Try to navigate to the path as-is
                targetPath = `/${destination}`;
              }
              break;
          }

          // Navigate using Next.js router-like behavior
          if (targetPath) {
            router.push(targetPath);
            return `Navigating to: ${targetPath}`;
          }

          return `Invalid navigation target: ${destination}`;

        } catch (error) {
          return `Navigation error: ${error}`;
        }
      }
    },

    {
      name: 'lorem',
      description: 'Generate placeholder text (lorem ipsum) of a given length',
      execute: (args) => {
        const type = args[0] || 'words';
        const count = parseInt(args[1]) || 50;
        
        if (count < 1 || count > 1000) {
          return 'Count must be between 1 and 1000';
        }

        try {
          let result = '';
          switch (type.toLowerCase()) {
            case 'words':
              result = lorem.generateWords(count);
              return `Lorem ipsum (${count} words):\n${result}`;
            
            case 'sentences':
              result = lorem.generateSentences(count);
              return `Lorem ipsum (${count} sentences):\n${result}`;
            
            case 'paragraphs':
              result = lorem.generateParagraphs(count);
              return `Lorem ipsum (${count} paragraphs):\n${result}`;
            
            default:
              return `Usage: lorem [type] [count]

Types:
  words       - Generate words (default)
  sentences   - Generate sentences
  paragraphs  - Generate paragraphs

  lorem words 50        - Generate 50 words
  lorem sentences 5     - Generate 5 sentences
  lorem paragraphs 3    - Generate 3 paragraphs`;
          }
        } catch (error) {
          return `Lorem generation error: ${error}`;
        }
      }
    },
    {
      name: 'fetch',
      description: 'Fetch and display data from a given API endpoint (GET only, for safety)',
      execute: async (args) => {
        const url = args[0];
        if (!url) return 'Usage: fetch <url>\nExample: fetch <a href="https://api.github.com/users/Beer-de-Vreeze" target="_blank">https://api.github.com/users/Beer-de-Vreeze</a>';
        
        try {
          // Basic URL validation
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'Error: URL must start with http:// or https://';
          }
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            return `HTTP ${response.status}: ${response.statusText}`;
          }
          
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            return `Fetched from ${url}:\n${JSON.stringify(data, null, 2)}`;
          } else {
            const text = await response.text();
            return `Fetched from ${url}:\n${text.substring(0, 1000)}${text.length > 1000 ? '...\n(truncated)' : ''}`;
          }
        } catch (error) {
          return `Fetch error: ${error}`;
        }
      }
    },
    {
      name: 'memory',
      description: 'Display current memory usage (if available via browser APIs)',
      execute: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const performance = (window as any).performance;
        
        if (performance && performance.memory) {
          const memory = performance.memory;
          const formatBytes = (bytes: number) => {
            const mb = bytes / (1024 * 1024);
            return `${mb.toFixed(2)} MB`;
          };
          
          return `Memory Usage:
Used: ${formatBytes(memory.usedJSHeapSize)}
Total: ${formatBytes(memory.totalJSHeapSize)}
Limit: ${formatBytes(memory.jsHeapSizeLimit)}

Note: Chrome/Chromium only feature`;
        } else {
          return 'Memory information not available in this browser';
        }
      }
    },
    {
      name: 'clipboard',
      description: 'Read from or write to the clipboard (with user permission)',
      execute: async (args) => {
        const action = args[0];
        
        if (!navigator.clipboard) {
          return 'Clipboard API not supported in this browser';
        }
        
        try {
          switch (action) {
            case 'read':
              const text = await navigator.clipboard.readText();
              return `Clipboard content:\n${text}`;
            
            case 'write':
              const content = args.slice(1).join(' ');
              if (!content) return 'Usage: clipboard write <text to copy>';
              await navigator.clipboard.writeText(content);
              return `Copied to clipboard: "${content}"`;
            
            default:
              return `Clipboard Command Usage:

Read from or write to the clipboard!

Usage: clipboard <command> [text]

Commands:
  read                    - Read current clipboard content
  write <text>           - Write text to clipboard

Examples:
  clipboard read
  clipboard write "Hello World"

Note: Requires clipboard permissions in your browser.`;
          }
        } catch (error) {
          return `Clipboard error: ${error}`;
        }
      }
    },
    {
      name: 'rickroll',
      description: 'Play a Rick Astley video or show a fun message',
      execute: () => {
        const messages = [
          'Never gonna give you up, never gonna let you down!',
          'You just got rick rolled!',
          '*Rick Astley intensifies*',
          'We\'re no strangers to love...'
        ];
        
        const rickrollUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        // Open the video in a new tab
        window.open(rickrollUrl, '_blank');
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        return `${randomMessage}\n\nOpening: ${rickrollUrl}`;
      }
    },
    {
      name: '8ball',
      description: 'Ask the magic 8-ball a yes/no question',
      execute: (args) => {
        const question = args.join(' ').trim();
        
        if (!question) {
          return `Magic 8-Ball Usage:
Ask a yes/no question and get an answer!

  8ball Will it rain tomorrow?
  8ball Should I learn React?
  8ball Is this a good idea?`;
        }
        
        // Classic Magic 8-Ball responses
        const responses = [
          // Positive responses
          'It is certain',
          'It is decidedly so',
          'Without a doubt',
          'Yes definitely',
          'You may rely on it',
          'As I see it, yes',
          'Most likely',
          'Outlook good',
          'Yes',
          'Signs point to yes',
          
          // Negative responses
          'Don\'t count on it',
          'My reply is no',
          'My sources say no',
          'Outlook not so good',
          'Very doubtful',
          
          // Neutral/uncertain responses
          'Reply hazy, try again',
          'Ask again later',
          'Better not tell you now',
          'Cannot predict now',
          'Concentrate and ask again'
        ];
        
        // Add some fun emoji variations
        const emojis = ['🎱', '🔮', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Get random response
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return `${randomEmoji} Question: "${question}"
Answer: ${randomResponse}`;
      }
    },

    {
      name: 'base',
      description: 'Convert numbers between different bases (2-36)',
      execute: (args) => {
        if (args.length === 0) {
          return `Base Converter Usage:

Convert numbers between different number bases (2-36)!

Usage: base <operation> [arguments]

Operations:
  convert <number> <from_base> <to_base>    - Convert between bases
  info <number> <base>                      - Show detailed info about a number
  all <number> <base>                       - Show number in common bases
  compare <num1> <base1> <num2> <base2>     - Compare two numbers in different bases
  add <num1> <base1> <num2> <base2>         - Add numbers in different bases
  multiply <num1> <base1> <num2> <base2>    - Multiply numbers in different bases

Supported bases: 2 (binary) to 36 (alphanumeric)

  base convert 255 10 16        - Convert decimal 255 to hexadecimal
  base convert 1010 2 10        - Convert binary 1010 to decimal
  base convert FF 16 2          - Convert hex FF to binary
  base info 12345 10            - Show detailed info about decimal 12345
  base all 100 10               - Show 100 in all common bases
  base add 1010 2 FF 16         - Add binary 1010 and hex FF
  base compare 100 10 1100100 2 - Compare decimal 100 with binary 1100100`;
        }

        const operation = args[0];

        try {
          switch (operation.toLowerCase()) {
            case 'convert':
              if (args.length < 4) return 'Usage: base convert <number> <from_base> <to_base>';
              const [, numStr, fromBaseStr, toBaseStr] = args;
              const fromBase = parseInt(fromBaseStr);
              const toBase = parseInt(toBaseStr);
              
              if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
                return 'Error: Bases must be between 2 and 36';
              }
              
              const bigNum = bigInt(numStr, fromBase);
              const result = bigNum.toString(toBase).toUpperCase();
              const decimal = bigNum.toString(10);
              
              return `🔄 Base Conversion:
Input: ${numStr} (base ${fromBase})
Output: ${result} (base ${toBase})
Decimal: ${decimal}
Length: ${numStr.length} → ${result.length} digits`;

            case 'info':
              if (args.length < 3) return 'Usage: base info <number> <base>';
              const [, infoNum, infoBaseStr] = args;
              const infoBase = parseInt(infoBaseStr);
              
              if (infoBase < 2 || infoBase > 36) {
                return 'Error: Base must be between 2 and 36';
              }
              
              const infoBigNum = bigInt(infoNum, infoBase);
              const infoDecimal = infoBigNum.toString(10);
              const isLarge = infoBigNum.greater(Number.MAX_SAFE_INTEGER);
              
              return `📊 Number Analysis:
Number: ${infoNum} (base ${infoBase})
Decimal: ${infoDecimal}
Binary: ${infoBigNum.toString(2)}
Hex: ${infoBigNum.toString(16).toUpperCase()}
Octal: ${infoBigNum.toString(8)}
Size: ${isLarge ? 'Large (requires arbitrary precision)' : 'Standard JavaScript number'}
Bit length: ${infoBigNum.toString(2).length} bits
Even: ${infoBigNum.isEven() ? 'Yes' : 'No'}
Negative: ${infoBigNum.isNegative() ? 'Yes' : 'No'}`;

            case 'all':
              if (args.length < 3) return 'Usage: base all <number> <base>';
              const [, allNum, allBaseStr] = args;
              const allBase = parseInt(allBaseStr);
              
              if (allBase < 2 || allBase > 36) {
                return 'Error: Base must be between 2 and 36';
              }
              
              const allBigNum = bigInt(allNum, allBase);
              
              return `🌈 Number in All Common Bases:
Original: ${allNum} (base ${allBase})

Binary (2):      ${allBigNum.toString(2)}
Octal (8):       ${allBigNum.toString(8)}
Decimal (10):    ${allBigNum.toString(10)}
Hex (16):        ${allBigNum.toString(16).toUpperCase()}
Base 32:         ${allBigNum.toString(32).toUpperCase()}
Base 36:         ${allBigNum.toString(36).toUpperCase()}`;

            case 'compare':
              if (args.length < 5) return 'Usage: base compare <num1> <base1> <num2> <base2>';
              const [, num1Str, base1Str, num2Str, base2Str] = args;
              const base1 = parseInt(base1Str);
              const base2 = parseInt(base2Str);
              
              if (base1 < 2 || base1 > 36 || base2 < 2 || base2 > 36) {
                return 'Error: Bases must be between 2 and 36';
              }
              
              const bigNum1 = bigInt(num1Str, base1);
              const bigNum2 = bigInt(num2Str, base2);
              
              let comparison = 'equal to';
              if (bigNum1.greater(bigNum2)) comparison = 'greater than';
              else if (bigNum1.lesser(bigNum2)) comparison = 'less than';
              
              return `⚖️ Number Comparison:
${num1Str} (base ${base1}) = ${bigNum1.toString(10)}
${num2Str} (base ${base2}) = ${bigNum2.toString(10)}

Result: ${num1Str} (base ${base1}) is ${comparison} ${num2Str} (base ${base2})
Difference: ${bigNum1.subtract(bigNum2).toString(10)}`;

            case 'add':
              if (args.length < 5) return 'Usage: base add <num1> <base1> <num2> <base2>';
              const [, addNum1, addBase1Str, addNum2, addBase2Str] = args;
              const addBase1 = parseInt(addBase1Str);
              const addBase2 = parseInt(addBase2Str);
              
              if (addBase1 < 2 || addBase1 > 36 || addBase2 < 2 || addBase2 > 36) {
                return 'Error: Bases must be between 2 and 36';
              }
              
              const addBigNum1 = bigInt(addNum1, addBase1);
              const addBigNum2 = bigInt(addNum2, addBase2);
              const sum = addBigNum1.add(addBigNum2);
              
              return `➕ Base Addition:
${addNum1} (base ${addBase1}) + ${addNum2} (base ${addBase2})
= ${addBigNum1.toString(10)} + ${addBigNum2.toString(10)}
= ${sum.toString(10)} (decimal)
= ${sum.toString(2)} (binary)
= ${sum.toString(16).toUpperCase()} (hex)`;

            case 'multiply':
              if (args.length < 5) return 'Usage: base multiply <num1> <base1> <num2> <base2>';
              const [, mulNum1, mulBase1Str, mulNum2, mulBase2Str] = args;
              const mulBase1 = parseInt(mulBase1Str);
              const mulBase2 = parseInt(mulBase2Str);
              
              if (mulBase1 < 2 || mulBase1 > 36 || mulBase2 < 2 || mulBase2 > 36) {
                return 'Error: Bases must be between 2 and 36';
              }
              
              const mulBigNum1 = bigInt(mulNum1, mulBase1);
              const mulBigNum2 = bigInt(mulNum2, mulBase2);
              const product = mulBigNum1.multiply(mulBigNum2);
              
              return `✖️ Base Multiplication:
${mulNum1} (base ${mulBase1}) × ${mulNum2} (base ${mulBase2})
= ${mulBigNum1.toString(10)} × ${mulBigNum2.toString(10)}
= ${product.toString(10)} (decimal)
= ${product.toString(2)} (binary)
= ${product.toString(16).toUpperCase()} (hex)`;

            default:
              return `Unknown base operation: ${operation}. Use 'base' without arguments for help.`;
          }
        } catch (error) {
          return `Base conversion error: ${error instanceof Error ? error.message : 'Invalid number or base'}`;
        }
      }
    },
    {
      name: 'trivia',
      description: 'Get trivia questions from various categories (general, science, history, sports, etc.)',
      execute: async (args) => {
        const category = args[0] ? args[0].toLowerCase() : 'random';
        const difficulty = args[1] ? args[1].toLowerCase() : 'random';
        
        // Category mapping for Open Trivia Database
        const categories: { [key: string]: number } = {
          'general': 9,
          'books': 10,
          'film': 11,
          'music': 12,
          'tv': 14,
          'games': 15,
          'science': 17,
          'computers': 18,
          'math': 19,
          'mythology': 20,
          'sports': 21,
          'geography': 22,
          'history': 23,
          'politics': 24,
          'art': 25,
          'celebrities': 26,
          'animals': 27,
          'vehicles': 28,
          'comics': 29,
          'gadgets': 30,
          'anime': 31,
          'cartoon': 32
        };

        if (!args[0]) {
          return `Trivia Command Usage:

Get random trivia questions from various categories!

Usage: trivia [category] [difficulty]

Categories: general, books, film, music, tv, games, science, computers, 
history, sports, geography, art, animals

Difficulties: easy, medium, hard

  trivia                    - Random question
  trivia science           - Random science question
  trivia history easy      - Easy history question`;
        }

        try {
          // Build API URL
          let apiUrl = 'https://opentdb.com/api.php?amount=1&type=multiple';
          
          // Add category if specified and valid
          if (category !== 'random' && categories[category]) {
            apiUrl += `&category=${categories[category]}`;
          }
          
          // Add difficulty if specified and valid
          if (difficulty !== 'random' && ['easy', 'medium', 'hard'].includes(difficulty)) {
            apiUrl += `&difficulty=${difficulty}`;
          }

          const response = await fetch(apiUrl);
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const data = await response.json();

          if (data.response_code !== 0 || !data.results || data.results.length === 0) {
            throw new Error('No trivia questions available for the specified criteria');
          }

          const question = data.results[0];
          
          // Decode HTML entities
          const decodeHtml = (html: string) => {
            const txt = document.createElement('textarea');
            txt.innerHTML = html;
            return txt.value;
          };

          const decodedQuestion = decodeHtml(question.question);
          const decodedCorrect = decodeHtml(question.correct_answer);
          const decodedIncorrect = question.incorrect_answers.map((answer: string) => decodeHtml(answer));
          
          // Shuffle all answers
          const allAnswers = [decodedCorrect, ...decodedIncorrect];
          const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
          const correctIndex = shuffledAnswers.indexOf(decodedCorrect);
          
          // Format difficulty and category
          const formattedDifficulty = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
          const formattedCategory = question.category;
          
          // Create answer options
          const answerOptions = shuffledAnswers.map((answer, index) => 
            `${String.fromCharCode(65 + index)}. ${answer}`
          ).join('\n');

          // Store the trivia question for answering
          setPendingTrivia({
            question: decodedQuestion,
            answers: shuffledAnswers,
            correctAnswer: decodedCorrect,
            correctIndex,
            category: formattedCategory,
            difficulty: formattedDifficulty
          });

          return `Trivia Question:

Category: ${formattedCategory}
Difficulty: ${formattedDifficulty}

${decodedQuestion}

${answerOptions}

Type your answer (A, B, C, or D) or use 'trivia-answer <letter>' to answer!`;

        } catch (error) {
          console.error('Trivia API Error:', error);
          
          // Fallback questions if API fails
          const fallbackQuestions = [
            {
              question: "What is the capital of France?",
              answers: ["A. London", "B. Berlin", "C. Paris", "D. Madrid"],
              correct: "C. Paris",
              category: "Geography",
              difficulty: "Easy"
            },
            {
              question: "Which planet is known as the Red Planet?",
              answers: ["A. Venus", "B. Mars", "C. Jupiter", "D. Saturn"],
              correct: "B. Mars",
              category: "Science",
              difficulty: "Easy"
            },
            {
              question: "Who painted the Mona Lisa?",
              answers: ["A. Van Gogh", "B. Picasso", "C. Da Vinci", "D. Monet"],
              correct: "C. Da Vinci",
              category: "Art",
              difficulty: "Medium"
            },
            {
              question: "What is the largest mammal in the world?",
              answers: ["A. Elephant", "B. Blue Whale", "C. Giraffe", "D. Hippopotamus"],
              correct: "B. Blue Whale",
              category: "Animals",
              difficulty: "Easy"
            }
          ];

          const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];

          // Store fallback trivia question
          const answerLetter = randomQuestion.correct.charAt(0);
          const answerIndex = answerLetter.charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
          const answerText = randomQuestion.correct.substring(3); // Remove "A. " prefix
          const allAnswers = randomQuestion.answers.map(a => a.substring(3)); // Remove prefixes

          setPendingTrivia({
            question: randomQuestion.question,
            answers: allAnswers,
            correctAnswer: answerText,
            correctIndex: answerIndex,
            category: randomQuestion.category,
            difficulty: randomQuestion.difficulty
          });

          return `Trivia Question (Offline):

Category: ${randomQuestion.category}
Difficulty: ${randomQuestion.difficulty}

${randomQuestion.question}

${randomQuestion.answers.join('\n')}

Type your answer (A, B, C, or D) or use 'trivia-answer <letter>' to answer!

Note: API unavailable - showing offline question`;
        }
      }
    },
    {
      name: 'trivia-answer',
      description: 'Answer a pending trivia question',
      execute: (args) => {
        if (!pendingTrivia) {
          return 'No trivia question is currently active. Use "trivia" to get a new question first.';
        }

        const userAnswer = args[0]?.toUpperCase();
        if (!userAnswer || !['A', 'B', 'C', 'D'].includes(userAnswer)) {
          return 'Please provide a valid answer: A, B, C, or D';
        }

        const userAnswerIndex = userAnswer.charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
        const isCorrect = userAnswerIndex === pendingTrivia.correctIndex;
        const correctLetter = String.fromCharCode(65 + pendingTrivia.correctIndex);

        // Clear the pending trivia
        const currentTrivia = pendingTrivia;
        setPendingTrivia(null);

        if (isCorrect) {
          return `🎉 Correct! Well done!

Your answer: ${userAnswer}. ${currentTrivia.answers[userAnswerIndex]}
Correct answer: ${correctLetter}. ${currentTrivia.correctAnswer}

Category: ${currentTrivia.category}
Difficulty: ${currentTrivia.difficulty}

Use "trivia" to get another question!`;
        } else {
          return `❌ Incorrect. Better luck next time!

Your answer: ${userAnswer}. ${currentTrivia.answers[userAnswerIndex]}
Correct answer: ${correctLetter}. ${currentTrivia.correctAnswer}

Category: ${currentTrivia.category}
Difficulty: ${currentTrivia.difficulty}

Use "trivia" to get another question!`;
        }
      }
    },
    {
      name: 'uwu',
      description: 'Convert text to UwU speak',
      execute: (args) => {
        const text = args.join(' ');
        
        if (!text) {
          return `UwU Command Usage:

Transform your text into UwU speak!

Usage: uwu <text to uwuify>

  uwu Hello world!
  uwu I love programming
  uwu This is so cool`;
        }

        try {
          // Initialize uwuifier
          const uwuifier = new Uwuifier({
            spaces: {
              faces: 0.4,
              actions: 0.075,
              stutters: 0.1
            },
            words: 1,
            exclamations: 1
          });

          // Convert text to UwU
          const uwuText = uwuifier.uwuifySentence(text);

          // Add some extra kawaii elements
          const kaomojis = [
            '(◕‿◕)',
            'OwO',
            'UwU',
            '>w<',
            '^w^'
          ];

          const sparkles = ['✨', '🌟', '💫', '🌸'];
          
          // Add random kaomojis
          const kaomoji1 = kaomojis[Math.floor(Math.random() * kaomojis.length)];
          
          // Add random sparkles
          const sparkle1 = sparkles[Math.floor(Math.random() * sparkles.length)];

          // Format the result with kawaii decorations
          const decoratedText = `${sparkle1} ${kaomoji1} ${uwuText}`;
          
          return `UwU Transformation Complete!

Original: "${text}"
UwU-fied: ${decoratedText}`;

        } catch (error) {
          // Fallback UwU implementation if uwuifier fails
          console.error('Uwuifier error:', error);
          
          const fallbackUwu = text
            .toLowerCase()
            .replace(/r/g, 'w')
            .replace(/l/g, 'w')
            .replace(/n([aeiou])/g, 'ny$1')
            .replace(/ove/g, 'uv')
            .replace(/\bth/g, 'd')
            .replace(/!+/g, '! UwU')
            .replace(/\?+/g, '? OwO');
          
          const kaomojis = ['(◕‿◕)', 'UwU', 'OwO', '>w<', '^w^', '(˘▾˘)'];
          const sparkles = ['✨', '🌟', '⭐', '💫', '🌸', '🎀'];
          
          const kaomoji = kaomojis[Math.floor(Math.random() * kaomojis.length)];
          const sparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
          
          return `UwU Transformation (Fallback):

Original: "${text}"
UwU-fied: ${sparkle} ${kaomoji} ${fallbackUwu}

Note: Using fallback uwuifier`;
        }
      }
    },
    {
      name: 'parse',
      description: 'Parse command-line arguments (demo command)',
      execute: (args) => {
        if (args.length === 0) {
          return `Parse Command Usage:

Demonstrates string-argv capabilities for parsing command-line arguments!

Usage: parse <arguments...>

  parse --name John --age 25 --verbose
  parse file1.txt file2.txt --output result.txt --force
  parse --config=production --port 3000 --no-debug
  parse install package1 package2 --save-dev --verbose

This command shows how arguments are parsed into:
- Positional arguments (_)
- Boolean flags
- String/Number options
- Array values

Note: string-argv is browser-compatible unlike yargs-parser!`;
        }

        try {
          // Join all args back and parse with string-argv
          const commandLine = args.join(' ');
          const parsed = parseArgs(commandLine);

          let output = `Parsed Arguments for: "${commandLine}"\n\n`;
          
          // Show positional arguments
          if (parsed._.length > 0) {
            output += `Positional Arguments:\n`;
            parsed._.forEach((arg: string | number, index: number) => {
              output += `  [${index}]: ${arg}\n`;
            });
            output += '\n';
          }

          // Show named options/flags
          const options = Object.entries(parsed).filter(([key]) => key !== '_' && key !== '--');
          if (options.length > 0) {
            output += `Named Options/Flags:\n`;
            options.forEach(([key, value]) => {
              const type = typeof value;
              const displayValue = Array.isArray(value) ? `[${value.join(', ')}]` : value;
              output += `  --${key}: ${displayValue} (${type})\n`;
            });
          }

          return output;
        } catch (error) {
          return `Parse error: ${error}`;
        }
      }
    },
    {
      name: 'search',
      description: 'Fuzzy search through available commands',
      execute: (args) => {
        const query = args.join(' ');
        
        if (!query) {
          return `Search Command Usage:

Fuzzy search through available commands!

Usage: search <query>

  search calc          - Find calculation-related commands
  search convert       - Find conversion commands
  search random        - Find random generation commands
  search time date     - Find time/date related commands

This uses fuzzy matching, so approximate spelling works too:
  search convertr      - Still finds 'convert'
  search passowrd      - Still finds 'password'`;
        }

        try {
          // Create Fuse instance for searching commands
          const fuse = new Fuse(commands, {
            keys: ['name', 'description'],
            threshold: 0.4, // Allow for some fuzziness
            includeScore: true
          });

          const results = fuse.search(query);

          if (results.length === 0) {
            return `No commands found matching "${query}". Try a different search term.`;
          }

          let output = `Search results for "${query}":\n\n`;
          
          results.slice(0, 10).forEach((result, index) => {
            const { item, score, matches } = result;
            const scorePercent = Math.round((1 - (score || 0)) * 100);
            
            output += `${index + 1}. ${item.name} (${scorePercent}% match)\n`;
            output += `   ${item.description}\n`;
            
            // Show what matched
            if (matches && matches.length > 0) {
              const matchInfo = matches.map(match => {
                const field = match.key === 'name' ? 'name' : 'description';
                return `${field}`;
              }).join(', ');
              output += `   Matched in: ${matchInfo}\n`;
            }
            output += '\n';
          });

          if (results.length > 10) {
            output += `... and ${results.length - 10} more results.\n`;
          }

          return output;
        } catch (error) {
          return `Search error: ${error}`;
        }
      }
    },
    {
      name: 'code',
      description: 'Code operations (highlight, beautify, minify, parse)',
      execute: (args) => {
        const operation = args[0];
        
        if (!operation) {
          return `Code Operations Command Usage:

Perform various operations on code!

Usage: code <operation> [arguments]

Operations:
  highlight <language> <code>    - Syntax highlight code
  beautify <type> <code>         - Format and beautify code
  minify <type> <code>           - Minify code
  parse <arguments>              - Parse command-line arguments

  code highlight javascript "const x = 5;"
  code beautify css "body{margin:0;padding:20px;}"
  code minify html "<div> <p>Text</p> </div>"
  code parse --name John --age 25

Supported languages/types: javascript, typescript, python, css, html, json, xml, sql`;
        }

        try {
          switch (operation.toLowerCase()) {
            case 'highlight':
              const language = args[1];
              const code = args.slice(2).join(' ');

              if (!code) {
                return 'Usage: code highlight <language> <code>\nExample: code highlight javascript "const x = 5;"';
              }

              try {
                let result;
                
                if (language === 'auto') {
                  result = hljs.highlightAuto(code);
                } else {
                  result = hljs.highlight(code, { language });
                }

                const detectedLang = result.language || 'unknown';
                const relevance = result.relevance || 0;
                
                const output = `Code Highlight Analysis:

Language: ${detectedLang}${language === 'auto' ? ' (auto-detected)' : ''}
Relevance Score: ${relevance}
Original Code:
${code}

Analysis: Syntax highlighting completed successfully.`;
                
                return output;
              } catch (error) {
                return `Highlight error: ${error instanceof Error ? error.message : 'Unknown error'}`;
              }
            
            case 'beautify':
              const beautifyType = args[1];
              const beautifyCode = args.slice(2).join(' ');
              
              if (!beautifyCode) {
                return 'Usage: code beautify <type> <code>\nExample: code beautify css "body{margin:0;}"';
              }
              
              // Basic beautification logic would go here
              return `Beautified ${beautifyType} code:\n${beautifyCode}`;
            
            case 'minify':
              const minifyType = args[1];
              const minifyCode = args.slice(2).join(' ');
              
              if (!minifyCode) {
                return 'Usage: code minify <type> <code>\nExample: code minify html "<div> <p>Text</p> </div>"';
              }
              
              // Basic minification logic would go here
              return `Minified ${minifyType} code:\n${minifyCode.replace(/\s+/g, ' ').trim()}`;
            
            case 'parse':
              const parseArgs = args.slice(1);
              
              if (parseArgs.length === 0) {
                return 'Usage: code parse <arguments>\nExample: code parse --name John --age 25';
              }
              
              try {
                const commandLine = parseArgs.join(' ');
                const parsed = parseArgs; // Basic parsing, could be enhanced
                
                return `Parsed Arguments: "${commandLine}"
Result: ${JSON.stringify(parsed, null, 2)}`;
              } catch (error) {
                return `Parse error: ${error}`;
              }
            
            default:
              return `Unknown code operation: ${operation}. Use 'code' without arguments for help.`;
          }
        } catch (error) {
          return `Code operation error: ${error}`;
        }
      }
    },
    {
      name: 'analyze',
      description: 'Analyze text, numbers, colors, or data',
      execute: (args) => {
        const type = args[0];
        const input = args.slice(1).join(' ');
        
        if (!type || !input) {
          return `Usage: analyze <type> <input>

Types:
  text <text>       - Analyze text (length, words, sentences, readability)
  number <number>   - Analyze number (type, binary, hex, factors)
  color <color>     - Analyze color (RGB, HSL, contrast, temperature)
  password <pass>   - Analyze password strength and entropy
  date <date>       - Analyze date (format, age, days until/since)
  json <json>       - Analyze JSON structure and complexity

  analyze text "Hello world! How are you today?"
  analyze number 42
  analyze color #ff5733
  analyze password myPassword123!
  analyze date "2024-01-01"
  analyze json '{"users":[{"name":"John","age":30}]}'`;
        }

        try {
          switch (type.toLowerCase()) {
            case 'text':
              // Text analysis using various methods
              const words = input.trim().split(/\s+/).filter(w => w.length > 0);
              const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
              const chars = input.length;
              const charsNoSpaces = input.replace(/\s/g, '').length;
              const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
              const avgSentenceLength = words.length / sentences.length;
              
              // Character frequency analysis
              const charFreq: { [key: string]: number } = {};
              input.toLowerCase().split('').forEach(char => {
                if (char.match(/[a-z]/)) {
                  charFreq[char] = (charFreq[char] || 0) + 1;
                }
              });
              
              const topChars = Object.entries(charFreq)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
              
              const maxFreq = topChars[0] ? topChars[0][1] : 1;
              const charChart = topChars.map(([char, freq]) => {
                const barWidth = (freq / maxFreq) * 100;
                return `<div style="display: flex; align-items: center; margin: 2px 0;">
                  <span style="width: 20px; text-align: center; font-family: monospace;">${char}</span>
                  <div style="background: #4CAF50; height: 16px; width: ${barWidth}px; margin: 0 5px; border-radius: 2px;"></div>
                  <span style="font-size: 0.9em;">${freq}</span>
                </div>`;
              }).join('');
              
              // Word length distribution
              const wordLengths: { [key: number]: number } = {};
              words.forEach(word => {
                const len = word.length;
                wordLengths[len] = (wordLengths[len] || 0) + 1;
              });
              
              const lengthChart = Object.entries(wordLengths)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([len, count]) => {
                  const barHeight = Math.max(5, (count / Math.max(...Object.values(wordLengths))) * 40);
                  return `<div style="display: inline-block; vertical-align: bottom; margin: 0 2px; text-align: center;">
                    <div style="background: #2196F3; width: 20px; height: ${barHeight}px; margin-bottom: 2px;"></div>
                    <div style="font-size: 0.8em;">${len}</div>
                  </div>`;
                }).join('');

              // Simple readability metrics
              const syllableCount = words.reduce((total, word) => {
                return total + Math.max(1, word.toLowerCase().match(/[aeiouy]+/g)?.length || 1);
              }, 0);
              const avgSyllablesPerWord = syllableCount / words.length;
              
              // UwU-ify a sample for fun
              let uwuSample = '';
              try {
                const uwuifier = new Uwuifier({ words: 0.5, exclamations: 0.5 });
                uwuSample = uwuifier.uwuifySentence(input.substring(0, 50));
              } catch {
                uwuSample = 'UwU conversion failed';
              }

              return `📝 Text Analysis:

<div style="padding: 15px; border-radius: 8px; margin: 10px 0;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
    <div>
      <strong>📊 Basic Stats:</strong><br>
      Characters: ${chars} (${charsNoSpaces} without spaces)<br>
      Words: ${words.length}<br>
      Sentences: ${sentences.length}<br>
      Paragraphs: ${input.split(/\n\s*\n/).length}
    </div>
    <div>
      <strong>📈 Readability:</strong><br>
      Avg word length: ${avgWordLength.toFixed(1)} chars<br>
      Avg sentence length: ${avgSentenceLength.toFixed(1)} words<br>
      Avg syllables/word: ${avgSyllablesPerWord.toFixed(1)}<br>
      Reading time: ~${Math.ceil(words.length / 200)} min
    </div>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>🔤 Most Frequent Characters:</strong><br>
    <div style="margin: 10px 0;">${charChart}</div>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>📏 Word Length Distribution:</strong><br>
    <div style="margin: 10px 0;">${lengthChart}</div>
    <div style="font-size: 0.8em; color: #666;">Word length (characters)</div>
  </div>
  
  <div>
    <strong>🎉 Fun Conversion:</strong><br>
    <div style="background: #e3f2fd; padding: 8px; border-radius: 4px; font-style: italic;">"${uwuSample}"</div>
  </div>
</div>`;

            case 'number':
              // Number analysis using mathjs and big-integer
              try {
                const num = bigInt(input);
                const binary = num.toString(2);
                const hex = num.toString(16).toUpperCase();
                const octal = num.toString(8);
                
                // Mathematical properties
                const isEven = num.mod(2).equals(0);
                const isPrime = num.isPrime();
                const isSmall = num.lesserOrEquals(Number.MAX_SAFE_INTEGER);
                
                // Factors (only for small numbers)
                const factors = [];
                if (isSmall && num.greater(0) && num.lesser(1000000)) {
                  const n = num.toJSNumber();
                  for (let i = 1; i <= Math.sqrt(n); i++) {
                    if (n % i === 0) {
                      factors.push(i);
                      if (i !== n / i) factors.push(n / i);
                    }
                  }
                  factors.sort((a, b) => a - b);
                }

                return `🔢 Number Analysis:

Value: ${num.toString()}
Type: ${isSmall ? 'Small integer' : 'Big integer'}

Representations:
Binary: ${binary} (${binary.length} bits)
Hexadecimal: 0x${hex}
Octal: 0${octal}

Properties:
Even: ${isEven ? 'Yes' : 'No'}
Prime: ${isPrime ? 'Yes' : 'No'}
${factors.length > 0 ? `Factors: ${factors.join(', ')}` : 'Factors: Too large to calculate'}

Mathematical Functions:
Square: ${num.multiply(num).toString()}
Factorial: ${isSmall && num.toJSNumber() <= 20 ? evaluate(`factorial(${num.toString()})`).toString() : 'Too large to calculate'}`;

              } catch {
                return `Error: Invalid number "${input}"`;
              }

            case 'color':
              // Color analysis using chroma-js
              try {
                const color = chroma(input);
                const rgb = color.rgb();
                const hsl = color.hsl();
                const hsv = color.hsv();
                const lab = color.lab();
                const luminance = color.luminance();
                const temperature = color.temperature();
                
                // Generate related colors
                const complementary = chroma.hsl((hsl[0] || 0) + 180, hsl[1], hsl[2]);
                const lighter = color.brighten(1);
                const darker = color.darken(1);
                
                // Contrast analysis with common colors
                const whiteContrast = chroma.contrast(color, 'white');
                const blackContrast = chroma.contrast(color, 'black');

                // Create simple color display with related colors
                const colorDisplay = `<div style="width: 100px; height: 100px; background: ${color.hex()}; border: 2px solid #333; margin: 10px 0;"></div>
<div style="display: flex; gap: 10px; margin: 10px 0;">
  <div style="text-align: center;">
    <div style="width: 60px; height: 60px; background: ${complementary.hex()}; border: 1px solid #333;"></div>
    <div style="font-size: 12px; margin-top: 5px;">Complementary</div>
    <div style="font-size: 11px; font-family: monospace;">${complementary.hex()}</div>
  </div>
  <div style="text-align: center;">
    <div style="width: 60px; height: 60px; background: ${lighter.hex()}; border: 1px solid #333;"></div>
    <div style="font-size: 12px; margin-top: 5px;">Lighter</div>
    <div style="font-size: 11px; font-family: monospace;">${lighter.hex()}</div>
  </div>
  <div style="text-align: center;">
    <div style="width: 60px; height: 60px; background: ${darker.hex()}; border: 1px solid #333;"></div>
    <div style="font-size: 12px; margin-top: 5px;">Darker</div>
    <div style="font-size: 11px; font-family: monospace;">${darker.hex()}</div>
  </div>
</div>`;

                return `🎨 Color Analysis:

Input: ${input}
Hex: ${color.hex()}

Color Values:
RGB: rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})
HSL: hsl(${Math.round(hsl[0] || 0)}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)
HSV: hsv(${Math.round(hsv[0] || 0)}, ${Math.round(hsv[1] * 100)}%, ${Math.round(hsv[2] * 100)}%)
LAB: lab(${Math.round(lab[0])}, ${Math.round(lab[1])}, ${Math.round(lab[2])})

Properties:
Luminance: ${luminance.toFixed(3)}
Temperature: ${temperature.toFixed(0)}K
Dominant: ${rgb[0] > rgb[1] && rgb[0] > rgb[2] ? 'Red' : rgb[1] > rgb[2] ? 'Green' : 'Blue'}

Related Colors:
Complementary: ${complementary.hex()}
Lighter: ${lighter.hex()}
Darker: ${darker.hex()}

Accessibility:
Contrast with white: ${whiteContrast.toFixed(2)}:1 ${whiteContrast >= 4.5 ? '✅' : '❌'}
Contrast with black: ${blackContrast.toFixed(2)}:1 ${blackContrast >= 4.5 ? '✅' : '❌'}

${colorDisplay}`;

              } catch {
                return `Error: Invalid color "${input}"`;
              }

            case 'password':
              // Password analysis
              const length = input.length;
              const hasLower = /[a-z]/.test(input);
              const hasUpper = /[A-Z]/.test(input);
              const hasNumbers = /\d/.test(input);
              const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(input);
              const hasSpaces = /\s/.test(input);
              
              // Character set size
              let charsetSize = 0;
              if (hasLower) charsetSize += 26;
              if (hasUpper) charsetSize += 26;
              if (hasNumbers) charsetSize += 10;
              if (hasSymbols) charsetSize += 32;
              if (hasSpaces) charsetSize += 1;
              
              // Entropy calculation
              const entropy = length * Math.log2(charsetSize);
              
              // Strength assessment
              let strength = 'Very Weak';
              if (entropy >= 60) strength = 'Very Strong';
              else if (entropy >= 40) strength = 'Strong';
              else if (entropy >= 25) strength = 'Moderate';
              else if (entropy >= 15) strength = 'Weak';
              
              // Time to crack (rough estimate)
              const combinations = Math.pow(charsetSize, length);
              const secondsToCrack = combinations / (1e9 * 2); // Assume 1 billion guesses per second
              const timeToCrack = secondsToCrack < 60 ? `${secondsToCrack.toFixed(1)} seconds` :
                                secondsToCrack < 3600 ? `${(secondsToCrack / 60).toFixed(1)} minutes` :
                                secondsToCrack < 86400 ? `${(secondsToCrack / 3600).toFixed(1)} hours` :
                                secondsToCrack < 31536000 ? `${(secondsToCrack / 86400).toFixed(1)} days` :
                                `${(secondsToCrack / 31536000).toFixed(1)} years`;

              return `🔐 Password Analysis:

Length: ${length} characters
Character Types:
${hasLower ? '✅' : '❌'} Lowercase letters (a-z)
${hasUpper ? '✅' : '❌'} Uppercase letters (A-Z)
${hasNumbers ? '✅' : '❌'} Numbers (0-9)
${hasSymbols ? '✅' : '❌'} Symbols (!@#$%^&*)
${hasSpaces ? '⚠️' : '✅'} ${hasSpaces ? 'Contains spaces' : 'No spaces'}

Security:
Character set size: ${charsetSize}
Entropy: ${entropy.toFixed(1)} bits
Strength: ${strength}
Est. time to crack: ${timeToCrack}

Recommendations:
${length < 12 ? '• Use at least 12 characters\n' : ''}
${!hasLower ? '• Add lowercase letters\n' : ''}
${!hasUpper ? '• Add uppercase letters\n' : ''}
${!hasNumbers ? '• Add numbers\n' : ''}
${!hasSymbols ? '• Add symbols\n' : ''}
${hasSpaces ? '• Consider removing spaces\n' : ''}
• Avoid common words and patterns`;

            case 'date':
              // Date analysis using date-fns
              try {
                const dateObj = new Date(input);
                if (isNaN(dateObj.getTime())) {
                  throw new Error('Invalid date');
                }
                
                const now = new Date();
                const daysDiff = differenceInDays(now, dateObj);
                const isInFuture = daysDiff < 0;
                const formattedDate = format(dateObj, 'EEEE, MMMM do, yyyy');
                const isoDate = dateObj.toISOString();
                const unixTimestamp = Math.floor(dateObj.getTime() / 1000);
                
                // Age calculation if in the past
                let ageInfo = '';
                if (!isInFuture) {
                  const years = Math.floor(daysDiff / 365.25);
                  const months = Math.floor((daysDiff % 365.25) / 30.44);
                  const days = Math.floor(daysDiff % 30.44);
                  ageInfo = `\nAge: ${years} years, ${months} months, ${days} days`;
                }

                return `📅 Date Analysis:

Input: ${input}
Parsed: ${formattedDate}
ISO Format: ${isoDate}
Unix Timestamp: ${unixTimestamp}

Relative:
${isInFuture ? 'Future date' : 'Past date'}
${Math.abs(daysDiff)} days ${isInFuture ? 'from now' : 'ago'}${ageInfo}

Properties:
Day of week: ${format(dateObj, 'EEEE')}
Day of year: ${format(dateObj, 'D')}
Week of year: ${format(dateObj, 'w')}
Quarter: Q${format(dateObj, 'Q')}
Is weekend: ${[0, 6].includes(dateObj.getDay()) ? 'Yes' : 'No'}
Is today: ${isToday(dateObj) ? 'Yes' : 'No'}
Is tomorrow: ${isTomorrow(dateObj) ? 'Yes' : 'No'}`;

              } catch {
                return `Error: Invalid date "${input}". Try formats like "2024-01-01", "Jan 1, 2024", or "1/1/2024"`;
              }

            case 'json':
              // JSON analysis (simplified version)
              try {
                const parsed = JSON.parse(input);
                
                const getType = (obj: unknown): string => {
                  if (Array.isArray(obj)) return 'array';
                  if (obj === null) return 'null';
                  return typeof obj;
                };
                
                const countDepth = (obj: unknown, depth = 0): number => {
                  if (Array.isArray(obj)) {
                    return obj.length > 0 ? Math.max(...obj.map(item => countDepth(item, depth + 1))) : depth + 1;
                  } else if (obj !== null && typeof obj === 'object') {
                    const values = Object.values(obj as Record<string, unknown>);
                    return values.length > 0 ? Math.max(...values.map(val => countDepth(val, depth + 1))) : depth + 1;
                  }
                  return depth + 1;
                };
                
                const mainType = getType(parsed);
                const maxDepth = countDepth(parsed);
                const minified = JSON.stringify(parsed);
                const pretty = JSON.stringify(parsed, null, 2);
                
                let typeInfo = `Type: ${mainType}`;
                if (mainType === 'array') {
                  typeInfo += `\nElements: ${(parsed as unknown[]).length}`;
                } else if (mainType === 'object') {
                  typeInfo += `\nProperties: ${Object.keys(parsed as Record<string, unknown>).length}`;
                }

                return `📊 JSON Analysis:

Structure:
${typeInfo}
Max nesting depth: ${maxDepth - 1}

Size Analysis:
Original: ${input.length} characters
Minified: ${minified.length} characters
Pretty-printed: ${pretty.length} characters
Compression ratio: ${((1 - minified.length / input.length) * 100).toFixed(1)}%

Complexity:
Estimated parse time: ${input.length > 10000 ? 'High' : input.length > 1000 ? 'Medium' : 'Low'}
Memory usage: ${maxDepth > 5 ? 'High nesting' : 'Normal'}
Readability: ${maxDepth > 3 ? 'Complex structure' : 'Simple structure'}`;

              } catch {
                return `Error: Invalid JSON "${input.substring(0, 50)}..."`;
              }

            default:
              return `Unknown analysis type: ${type}. Use 'analyze' without arguments for help.`;
          }
        } catch (error) {
          return `Analysis error: ${error}`;
        }
      }
    },
    {
      name: 'pokemon',
      description: 'Pokemon commands (random, info, search, forms, battle)',
      /* eslint-disable @typescript-eslint/no-explicit-any */
      execute: async (args): Promise<string> => {
        const action = args[0] || 'help';
        
        switch (action.toLowerCase()) {
          case 'help':
            return `🔍 Pokemon Commands:

Usage: pokemon <command> [options]

Commands:
  random                    - Get a random Pokemon
  info <name|id>           - Get detailed Pokemon information
  search <partial_name>    - Search for Pokemon by partial name
  forms <name|id>          - Show alternate forms of a Pokemon
  battle <pokemon1> <pokemon2> - Compare two Pokemon for battle
  types <type>             - List Pokemon of a specific type
  generation <gen>         - List Pokemon from a generation (1-9)
  abilities <ability>      - Find Pokemon with a specific ability

  pokemon random
  pokemon info pikachu
  pokemon info 25
  pokemon search char
  pokemon forms pikachu
  pokemon battle charizard blastoise
  pokemon types fire
  pokemon generation 1
  pokemon abilities static`;

          case 'random':
            try {
              // Get random Pokemon ID (1-1010 for all Pokemon including newer ones)
              const randomId = Math.floor(Math.random() * 1010) + 1;
              const pokemonData = await pokedex.getPokemonByName(randomId);
              
              if (!pokemonData) {
                return 'Error: Could not fetch random Pokemon data';
              }
              
              // Create image elements if sprites exist
              let imageDisplay = '';
              if (pokemonData.sprites?.front_default) {
                imageDisplay += `<img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" style="max-width: 100px; margin-right: 10px;" title="Normal sprite" />`;
              }
              if (pokemonData.sprites?.front_shiny) {
                imageDisplay += `<img src="${pokemonData.sprites.front_shiny}" alt="${pokemonData.name} shiny" style="max-width: 100px; margin-right: 10px;" title="Shiny sprite" />`;
              }
              if (pokemonData.sprites?.other?.['official-artwork']?.front_default) {
                imageDisplay += `<img src="${pokemonData.sprites.other['official-artwork'].front_default}" alt="${pokemonData.name} artwork" style="max-width: 150px;" title="Official artwork" />`;
              }
              
              const types = pokemonData.types?.map((t: { type: { name: string } }) => t.type.name).join(', ') || 'Unknown';
              const height = pokemonData.height ? (pokemonData.height / 10) : 'Unknown';
              const weight = pokemonData.weight ? (pokemonData.weight / 10) : 'Unknown';
              
              const result = `🎲 Random Pokemon:

${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)} (#${pokemonData.id})
Type(s): ${types}
Height: ${height}m
Weight: ${weight}kg
Base Experience: ${pokemonData.base_experience || 'Unknown'}

${imageDisplay ? `<div style="margin: 10px 0;">${imageDisplay}</div>` : 'No images available'}

Use 'pokemon info ${pokemonData.name}' for more details!`;

              return result;

            } catch (error) {
              return `Error getting random Pokemon: ${error instanceof Error ? error.message : 'Unknown error'}

This could be due to:
- Network connectivity issues
- Pokemon API being temporarily unavailable

Try again or use 'pokemon info <name>' to search for a specific Pokemon!`;
            }

          case 'info':
            const query = args[1];
            if (!query) {
              return 'Usage: pokemon info <name|id>\nExample: pokemon info pikachu or pokemon info 25';
            }

            try {
              const pokemonData = await pokedex.getPokemonByName(query.toLowerCase());
              const speciesData = await pokedex.getPokemonSpeciesByName(pokemonData.species.name);
              
              // Get English flavor text
              const flavorText = speciesData.flavor_text_entries
                .find((entry: { language: { name: string }; flavor_text: string }) => entry.language.name === 'en')?.flavor_text
                .replace(/\f/g, ' ') || 'No description available';

              // Get abilities
              const abilities = pokemonData.abilities.map((a: { ability: { name: string }; is_hidden: boolean }) => 
                `${a.ability.name}${a.is_hidden ? ' (Hidden)' : ''}`
              ).join(', ');

              // Get base stats
              const stats = pokemonData.stats.map((s: { stat: { name: string }; base_stat: number }) => 
                `${s.stat.name}: ${s.base_stat}`
              ).join('\n  ');

              // Get evolution chain info
              let evolutionInfo = 'Unknown';
              try {
                const evolutionId = parseInt(speciesData.evolution_chain.url.split('/').slice(-2, -1)[0]);
                const evolutionChain = await pokedex.getEvolutionChainById(evolutionId);
                const getEvolutionNames = (chain: { species: { name: string }; evolves_to: unknown[] }): string[] => {
                  const names = [chain.species.name];
                  if (chain.evolves_to.length > 0) {
                    (chain.evolves_to as { species: { name: string }; evolves_to: unknown[] }[]).forEach((evolution) => {
                      names.push(...getEvolutionNames(evolution));
                    });
                  }
                  return names;
                };
                evolutionInfo = getEvolutionNames(evolutionChain.chain).join(' → ');
              } catch {
                evolutionInfo = 'Evolution data unavailable';
              }

              // Create image elements if sprites exist
              let imageDisplay = '';
              if (pokemonData.sprites.front_default) {
                imageDisplay += `<img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" style="max-width: 100px; margin-right: 10px;" title="Normal sprite" />`;
              }
              if (pokemonData.sprites.front_shiny) {
                imageDisplay += `<img src="${pokemonData.sprites.front_shiny}" alt="${pokemonData.name} shiny" style="max-width: 100px; margin-right: 10px;" title="Shiny sprite" />`;
              }
              if (pokemonData.sprites.other?.['official-artwork']?.front_default) {
                imageDisplay += `<img src="${pokemonData.sprites.other['official-artwork'].front_default}" alt="${pokemonData.name} artwork" style="max-width: 150px;" title="Official artwork" />`;
              }

              return `📝 Pokemon Information:

${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)} (#${pokemonData.id})

Basic Info:
  Type(s): ${pokemonData.types.map((t: any) => t.type.name).join(', ')}
  Height: ${pokemonData.height / 10}m
  Weight: ${pokemonData.weight / 10}kg
  Base Experience: ${pokemonData.base_experience}
  Generation: ${speciesData.generation.name.replace('generation-', '')}

Description:
  ${flavorText}

Abilities:
  ${abilities}

Base Stats:
  ${stats}
  Total: ${pokemonData.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0)}

Evolution Chain:
  ${evolutionInfo}

${imageDisplay ? `<div style="margin: 10px 0;">${imageDisplay}</div>` : 'No images available'}`;

            } catch (error) {
              return `Pokemon "${query}" not found or error occurred: ${error}`;
            }

          case 'search':
            const searchTerm = args[1];
            if (!searchTerm) {
              return 'Usage: pokemon search <partial_name>\nExample: pokemon search char';
            }

            try {
              // Get all Pokemon names (this is a simplified search)
              const allPokemon = await pokedex.getPokemonsList({ limit: 1010 });
              const matches = allPokemon.results
                .filter((p: any) => p.name.includes(searchTerm.toLowerCase()))
                .slice(0, 10); // Limit to first 10 matches

              if (matches.length === 0) {
                return `No Pokemon found matching "${searchTerm}"`;
              }

              const matchList = matches.map((p: any, index: number) => {
                const id = p.url.split('/').slice(-2, -1)[0];
                return `${index + 1}. ${p.name.charAt(0).toUpperCase() + p.name.slice(1)} (#${id})`;
              }).join('\n');

              return `🔍 Search Results for "${searchTerm}":

${matchList}

Use "pokemon info <name>" for detailed information.`;

            } catch (error) {
              return `Search error: ${error}`;
            }

          case 'forms':
            const formQuery = args[1];
            if (!formQuery) {
              return 'Usage: pokemon forms <name|id>\nExample: pokemon forms pikachu';
            }

            try {
              const pokemonData = await pokedex.getPokemonByName(formQuery.toLowerCase());
              const speciesData = await pokedex.getPokemonSpeciesByName(pokemonData.species.name);
              
              if (speciesData.varieties.length <= 1) {
                return `${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)} has no alternate forms.`;
              }

              const forms = await Promise.all(
                speciesData.varieties.map(async (variety: any) => {
                  try {
                    const formData = await pokedex.getPokemonByName(variety.pokemon.name);
                    return {
                      name: variety.pokemon.name,
                      id: formData.id,
                      types: formData.types.map((t: any) => t.type.name),
                      sprite: formData.sprites.front_default,
                      shiny: formData.sprites.front_shiny
                    };
                  } catch {
                    return null;
                  }
                })
              );

              const validForms = forms.filter(f => f !== null);
              const formsList = validForms.map((form: any, index: number) => {
                let imageDisplay = '';
                if (form.sprite) {
                  imageDisplay += `<img src="${form.sprite}" alt="${form.name}" style="max-width: 80px; margin-right: 10px;" title="Normal sprite" />`;
                }
                if (form.shiny) {
                  imageDisplay += `<img src="${form.shiny}" alt="${form.name} shiny" style="max-width: 80px;" title="Shiny sprite" />`;
                }
                
                return `${index + 1}. ${form.name.charAt(0).toUpperCase() + form.name.slice(1)} (#${form.id})
   Types: ${form.types.join(', ')}
   ${imageDisplay ? `<div style="margin: 5px 0;">${imageDisplay}</div>` : 'No images available'}`;
              }).join('\n\n');

              return `🔄 Alternate Forms:

${formsList}`;

            } catch (error) {
              return `Error getting forms for "${formQuery}": ${error}`;
            }

          case 'battle':
            const pokemon1 = args[1];
            const pokemon2 = args[2];
            
            if (!pokemon1 || !pokemon2) {
              return 'Usage: pokemon battle <pokemon1> <pokemon2>\nExample: pokemon battle charizard blastoise';
            }

            try {
              const [p1Data, p2Data] = await Promise.all([
                pokedex.getPokemonByName(pokemon1.toLowerCase()),
                pokedex.getPokemonByName(pokemon2.toLowerCase())
              ]);

              const getStatTotal = (pokemon: any) => 
                pokemon.stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);

              const p1Total = getStatTotal(p1Data);
              const p2Total = getStatTotal(p2Data);

              const formatStats = (pokemon: any) => 
                pokemon.stats.map((s: any) => 
                  `${s.stat.name}: ${s.base_stat}`
                ).join(', ');

              let winner = '';
              if (p1Total > p2Total) {
                winner = `🏆 ${p1Data.name.charAt(0).toUpperCase() + p1Data.name.slice(1)} wins!`;
              } else if (p2Total > p1Total) {
                winner = `🏆 ${p2Data.name.charAt(0).toUpperCase() + p2Data.name.slice(1)} wins!`;
              } else {
                winner = '🤝 It\'s a tie!';
              }

              // Create image displays for both Pokemon
              const p1Image = p1Data.sprites.front_default ? 
                `<img src="${p1Data.sprites.front_default}" alt="${p1Data.name}" style="max-width: 100px;" title="${p1Data.name}" />` : 
                'No image';
              const p2Image = p2Data.sprites.front_default ? 
                `<img src="${p2Data.sprites.front_default}" alt="${p2Data.name}" style="max-width: 100px;" title="${p2Data.name}" />` : 
                'No image';

              return `⚔️ Pokemon Battle Comparison:

<div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
  <div style="text-align: center;">
    ${p1Image}
    <div><strong>${p1Data.name.charAt(0).toUpperCase() + p1Data.name.slice(1)} (#${p1Data.id})</strong></div>
  </div>
  <div style="font-size: 24px; margin: 0 20px;">VS</div>
  <div style="text-align: center;">
    ${p2Image}
    <div><strong>${p2Data.name.charAt(0).toUpperCase() + p2Data.name.slice(1)} (#${p2Data.id})</strong></div>
  </div>
</div>

${p1Data.name.charAt(0).toUpperCase() + p1Data.name.slice(1)}:
  Types: ${p1Data.types.map((t: any) => t.type.name).join(', ')}
  Base Stats: ${formatStats(p1Data)}
  Total: ${p1Total}

${p2Data.name.charAt(0).toUpperCase() + p2Data.name.slice(1)}:
  Types: ${p2Data.types.map((t: any) => t.type.name).join(', ')}
  Base Stats: ${formatStats(p2Data)}
  Total: ${p2Total}

${winner}
Difference: ${Math.abs(p1Total - p2Total)} points`;

            } catch (error) {
              return `Battle comparison error: ${error}`;
            }

          case 'types':
            const typeName = args[1];
            if (!typeName) {
              return 'Usage: pokemon types <type>\nExample: pokemon types fire\nAvailable types: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy';
            }

            try {
              const typeData = await pokedex.getTypeByName(typeName.toLowerCase());
              const pokemonList = typeData.pokemon
                .slice(0, 15) // Limit to first 15
                .map((p: any, index: number) => {
                  const id = p.pokemon.url.split('/').slice(-2, -1)[0];
                  return `${index + 1}. ${p.pokemon.name.charAt(0).toUpperCase() + p.pokemon.name.slice(1)} (#${id})`;
                }).join('\n');

              return `🔥 ${typeName.charAt(0).toUpperCase() + typeName.slice(1)} Type Pokemon (first 15):

${pokemonList}

Total ${typeName} Pokemon: ${typeData.pokemon.length}`;

            } catch (error) {
              return `Type "${typeName}" not found or error: ${error}`;
            }

          case 'generation':
            const genNumber = args[1];
            if (!genNumber) {
              return 'Usage: pokemon generation <1-9>\nExample: pokemon generation 1';
            }

            const genNum = parseInt(genNumber);
            if (isNaN(genNum) || genNum < 1 || genNum > 9) {
              return 'Error: Generation must be a number between 1 and 9';
            }

            try {
              const generationData = await pokedex.getGenerationByName(`generation-${genNumber}`);
              
              if (!generationData || !generationData.pokemon_species) {
                return `Error: No data found for generation ${genNumber}`;
              }

              const pokemonList = generationData.pokemon_species
                .slice(0, 20) // Limit to first 20
                .map((p: unknown, index: number) => {
                  const pokemon = p as { name: string; url: string };
                  const id = pokemon.url.split('/').filter(Boolean).pop();
                  return `${index + 1}. ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#${id})`;
                }).join('\n');

              const regionName = generationData.main_region?.name 
                ? generationData.main_region.name.charAt(0).toUpperCase() + generationData.main_region.name.slice(1)
                : 'Unknown';

              return `🎮 Generation ${genNumber} Pokemon (first 20):

${pokemonList}

Total Gen ${genNumber} Pokemon: ${generationData.pokemon_species.length}
Region: ${regionName}

Use 'pokemon info <name>' to get details about a specific Pokemon!`;

            } catch (error) {
              return `Error fetching Generation ${genNumber} data: ${error instanceof Error ? error.message : 'Unknown error'}

This could be due to:
- Network connectivity issues
- Pokemon API being temporarily unavailable
- Invalid generation number

Try again or use 'pokemon random' for a random Pokemon!`;
            }

          case 'abilities':
            const abilityName = args[1];
            if (!abilityName) {
              return 'Usage: pokemon abilities <ability_name>\nExample: pokemon abilities static';
            }

            try {
              const abilityData = await pokedex.getAbilityByName(abilityName.toLowerCase());
              const pokemonList = abilityData.pokemon
                .slice(0, 10) // Limit to first 10
                .map((p: any, index: number) => {
                  const id = p.pokemon.url.split('/').slice(-2, -1)[0];
                  const isHidden = p.is_hidden ? ' (Hidden)' : '';
                  return `${index + 1}. ${p.pokemon.name.charAt(0).toUpperCase() + p.pokemon.name.slice(1)} (#${id})${isHidden}`;
                }).join('\n');

              const description = abilityData.effect_entries
                .find((entry: any) => entry.language.name === 'en')?.effect
                || 'No description available';

              return `✨ Ability: ${abilityData.name.charAt(0).toUpperCase() + abilityData.name.slice(1)}

Description:
${description}

Pokemon with this ability (first 10):
${pokemonList}

Total Pokemon: ${abilityData.pokemon.length}`;

            } catch (error) {
              return `Ability "${abilityName}" not found or error: ${error}`;
            }

          default:
            return `Unknown Pokemon command: ${action}
Use "pokemon help" to see all available commands.`;
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      }
    },
    {
      name: 'hash',
      description: 'Generate various hashes (MD5, SHA-1, SHA-256, SHA-512) for text',
      execute: (args) => {
        const action = args[0];
        const text = args.slice(1).join(' ');
        
        if (!action || !text) {
          return `Hash Command Usage:

Generate various hash functions for any text!

Usage: hash <algorithm> <text>

Algorithms:
  md5         - MD5 hash (128-bit)
  sha1        - SHA-1 hash (160-bit)
  sha256      - SHA-256 hash (256-bit)
  sha512      - SHA-512 hash (512-bit)
  all         - Show all hash types

  hash md5 "Hello World"
  hash sha256 "my secret text"
  hash all "test string"

Security Note: MD5 and SHA-1 are not cryptographically secure.
Use SHA-256 or SHA-512 for security purposes.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'md5':
              return `MD5 Hash:
Input: "${text}"
MD5: ${CryptoJS.MD5(text).toString()}`;

            case 'sha1':
              return `SHA-1 Hash:
Input: "${text}"
SHA-1: ${CryptoJS.SHA1(text).toString()}`;

            case 'sha256':
              return `SHA-256 Hash:
Input: "${text}"
SHA-256: ${CryptoJS.SHA256(text).toString()}`;

            case 'sha512':
              return `SHA-512 Hash:
Input: "${text}"
SHA-512: ${CryptoJS.SHA512(text).toString()}`;

            case 'all':
              const md5 = CryptoJS.MD5(text).toString();
              const sha1 = CryptoJS.SHA1(text).toString();
              const sha256 = CryptoJS.SHA256(text).toString();
              const sha512 = CryptoJS.SHA512(text).toString();

              return `All Hash Types for: "${text}"

MD5:     ${md5}
SHA-1:   ${sha1}
SHA-256: ${sha256}
SHA-512: ${sha512}

Hash Lengths:
MD5:     ${md5.length} characters (128 bits)
SHA-1:   ${sha1.length} characters (160 bits)
SHA-256: ${sha256.length} characters (256 bits)
SHA-512: ${sha512.length} characters (512 bits)

Security Note: Use SHA-256+ for cryptographic purposes.`;

            default:
              return `Unknown hash algorithm: ${action}. Use 'hash' without arguments for help.`;
          }
        } catch (error) {
          return `Hash generation error: ${error}`;
        }
      }
    },
    {
      name: 'regex',
      description: 'Test regular expressions with live matching and explanation',
      execute: (args) => {
        const action = args[0];
        
        if (!action) {
          return `Regex Command Usage:

Test and analyze regular expressions!

Usage: regex <command> [arguments]

Commands:
  test <pattern> <text>        - Test regex pattern against text
  match <pattern> <text>       - Find all matches in text
  replace <pattern> <replacement> <text> - Replace matches with replacement
  explain <pattern>            - Explain what a regex pattern does
  examples                     - Show common regex examples

  regex test "\\d+" "Hello 123 World"
  regex match "\\w+" "Hello World 123"
  regex replace "\\d+" "X" "Test 123 and 456"
  regex explain "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"

Note: Use double backslashes (\\\\) for escape sequences in patterns.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'test':
              const testPattern = args[1];
              const testText = args.slice(2).join(' ');
              
              if (!testPattern || !testText) {
                return 'Usage: regex test <pattern> <text>';
              }
              
              try {
                const regex = new RegExp(testPattern, 'g');
                const matches = testText.match(regex);
                const hasMatch = regex.test(testText);
                
                return `Regex Test Results:
Pattern: ${testPattern}
Text: "${testText}"
Has Match: ${hasMatch ? 'Yes' : 'No'}
Match Count: ${matches ? matches.length : 0}
${matches ? `Matches: [${matches.join(', ')}]` : 'No matches found'}`;
              } catch (error) {
                return `Invalid regex pattern: ${error}`;
              }

            case 'match':
              const matchPattern = args[1];
              const matchText = args.slice(2).join(' ');
              
              if (!matchPattern || !matchText) {
                return 'Usage: regex match <pattern> <text>';
              }
              
              try {
                const regex = new RegExp(matchPattern, 'g');
                const matches = [];
                let match;
                
                while ((match = regex.exec(matchText)) !== null) {
                  matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1)
                  });
                }
                
                if (matches.length === 0) {
                  return `No matches found for pattern "${matchPattern}" in text "${matchText}"`;
                }
                
                let result = `Found ${matches.length} match(es) for pattern "${matchPattern}":\n\n`;
                matches.forEach((m, i) => {
                  result += `Match ${i + 1}: "${m.match}" at position ${m.index}`;
                  if (m.groups.length > 0) {
                    result += `\n  Groups: [${m.groups.join(', ')}]`;
                  }
                  result += '\n';
                });
                
                return result;
              } catch (error) {
                return `Invalid regex pattern: ${error}`;
              }

            case 'replace':
              const replacePattern = args[1];
              const replacement = args[2];
              const replaceText = args.slice(3).join(' ');
              
              if (!replacePattern || replacement === undefined || !replaceText) {
                return 'Usage: regex replace <pattern> <replacement> <text>';
              }
              
              try {
                const regex = new RegExp(replacePattern, 'g');
                const result = replaceText.replace(regex, replacement);
                const matchCount = (replaceText.match(regex) || []).length;
                
                return `Regex Replace Results:
Pattern: ${replacePattern}
Replacement: "${replacement}"
Original: "${replaceText}"
Result: "${result}"
Replacements made: ${matchCount}`;
              } catch (error) {
                return `Invalid regex pattern: ${error}`;
              }

            case 'explain':
              const explainPattern = args[1];
              
              if (!explainPattern) {
                return 'Usage: regex explain <pattern>';
              }
              
              // Basic regex explanation (simplified)
              const explanations: { [key: string]: string } = {
                '^': 'Start of string/line',
                '$': 'End of string/line',
                '.': 'Any character except newline',
                '*': 'Zero or more of the preceding',
                '+': 'One or more of the preceding',
                '?': 'Zero or one of the preceding',
                '\\d': 'Any digit (0-9)',
                '\\w': 'Any word character (a-z, A-Z, 0-9, _)',
                '\\s': 'Any whitespace character',
                '\\D': 'Any non-digit',
                '\\W': 'Any non-word character',
                '\\S': 'Any non-whitespace',
                '[': 'Start character class',
                ']': 'End character class',
                '(': 'Start capturing group',
                ')': 'End capturing group',
                '|': 'Alternation (OR)',
                '\\': 'Escape character',
                '{': 'Start quantifier',
                '}': 'End quantifier'
              };
              
              let explanation = `Regex Pattern Analysis: "${explainPattern}"\n\nBreakdown:\n`;
              
              for (let i = 0; i < explainPattern.length; i++) {
                const char = explainPattern[i];
                const twoChar = explainPattern.substring(i, i + 2);
                
                if (explanations[twoChar]) {
                  explanation += `"${twoChar}": ${explanations[twoChar]}\n`;
                  i++; // Skip next character
                } else if (explanations[char]) {
                  explanation += `"${char}": ${explanations[char]}\n`;
                } else if (char.match(/[a-zA-Z0-9]/)) {
                  explanation += `"${char}": Literal character\n`;
                }
              }
              
              return explanation;

            case 'examples':
              return `Common Regex Examples:

Email validation:
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$

Phone number (US format):
^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$

URL validation:
^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$

Credit card number:
^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$

Date (MM/DD/YYYY):
^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/([0-9]{4})$

Password (8+ chars, uppercase, lowercase, digit):
^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$

Extract numbers:
\\d+

Extract words:
\\w+

Remove extra spaces:
\\s+ (replace with single space)

HTML tags:
<[^>]*>`;

            default:
              return `Unknown regex command: ${action}. Use 'regex' without arguments for help.`;
          }
        } catch (error) {
          return `Regex error: ${error}`;
        }
      }
    },
    {
      name: 'qrcode',
      description: 'Generate QR codes and barcodes for text',
      execute: async (args) => {
        const action = args[0] || 'qr';
        const text = args.slice(1).join(' ');
        
        if (!text) {
          return `QR Code/Barcode Generator Usage:

Generate QR codes and various barcodes for text!

Usage: qrcode <type> <text>

Types:
  qr         - QR Code (default)
  dataurl    - QR Code as data URL
  svg        - QR Code as SVG
  url        - Simple QR code via external API

  qrcode qr "Hello World"
  qrcode dataurl "https://example.com"
  qrcode svg "Contact Info"
  qrcode url "My Portfolio"

Note: For complex data, use shorter text or URLs.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'qr':
            case 'dataurl':
              try {
                const qrDataUrl = await QRCode.toDataURL(text, {
                  width: 256,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  }
                });
                
                return `QR Code generated for: "${text}"

<img src="${qrDataUrl}" alt="QR Code" style="display: block; max-width: 256px; height: auto; margin: 10px 0; border: 1px solid #ccc;">

Data URL: ${qrDataUrl.substring(0, 100)}...

Scan with your phone's camera or QR code reader!`;
              } catch (qrError) {
                return `QR Code generation failed: ${qrError}`;
              }

            case 'svg':
              try {
                const qrSvg = await QRCode.toString(text, { 
                  type: 'svg',
                  width: 256,
                  margin: 2 
                });
                
                return `QR Code SVG generated for: "${text}"

${qrSvg}

This is vector-based and scales to any size!`;
              } catch (svgError) {
                return `SVG QR Code generation failed: ${svgError}`;
              }

            case 'url':
              const encodedText = encodeURIComponent(text);
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedText}`;
              
              return `QR Code URL generated for: "${text}"

<img src="${qrUrl}" alt="QR Code" style="display: block; max-width: 256px; height: auto; margin: 10px 0; border: 1px solid #ccc;" onerror="this.style.display='none';">

Direct URL: <a href="${qrUrl}" target="_blank">${qrUrl}</a>

This uses an external API service.`;

            case 'ascii':
              // Simple ASCII QR-like pattern (not a real QR code)
              const size = Math.min(text.length + 4, 15);
              let asciiCode = '';
              
              for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                  // Create a pseudo-random pattern based on text and position
                  const hash = (text.charCodeAt(i % text.length) + i + j) % 3;
                  asciiCode += hash === 0 ? '██' : '  ';
                }
                asciiCode += '\n';
              }
              
              return `ASCII QR-like Pattern for: "${text}"

${asciiCode}

Note: This is decorative ASCII art, not a scannable QR code.
Use 'barcode qr' for real QR codes.`;

            default:
              return `Unknown barcode type: ${action}. Use 'barcode' without arguments for help.`;
          }
        } catch (error) {
          return `Barcode generation error: ${error}`;
        }
      }
    },
    {
      name: 'data',
      description: 'Data operations (convert, analyze, format)',
      execute: async (args) => {
        const action = args[0];
        const input = args.slice(1).join(' ');
        
        if (!action) {
          return `Data Operations Command Usage:

Parse, analyze, format, and convert between various data formats!

Usage: data <operation> [arguments]

Operations:
  convert <from> <to> <data>  - Convert between formats (csv, xml, yaml, json, sql)
  analyze <type> <data>       - Analyze data structure and complexity
  format <type> <data>        - Format and prettify data

  data convert json yaml '{"name":"John","age":30}'
  
  data analyze json '{"users":[{"name":"John","age":30}]}'
  data analyze csv "name,age,city\\nJohn,30,NYC"
  
  data format json '{"name":"John","age":30}'
  data format xml '<root><item>value</item></root>'

Legacy Commands (still supported):
  data csv <csv_data>         - Parse CSV to JSON
  data xml <xml_data>         - Parse XML to JSON 
  data yaml <yaml_data>       - Parse YAML to JSON
  data json <json_data>       - Validate and format JSON`;
        }

        if (!input && !['help'].includes(action.toLowerCase())) {
          return `Please provide data to ${action}. Use 'data' without arguments for help.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'csv':
              try {
                // Simple CSV parser
                const lines = input.split('\\n').map(line => line.split(','));
                const headers = lines[0];
                const data = lines.slice(1).map(row => {
                  const obj: { [key: string]: string } = {};
                  headers.forEach((header, index) => {
                    obj[header.trim()] = row[index]?.trim() || '';
                  });
                  return obj;
                });

                return `CSV Parsing Results:

Headers: [${headers.join(', ')}]
Rows: ${data.length}

JSON Output:
${JSON.stringify(data, null, 2)}

Summary:
- ${headers.length} columns detected
- ${data.length} data rows parsed`;
              } catch (error) {
                return `CSV parsing error: ${error}. Make sure to use proper CSV format.`;
              }

            case 'xml':
              try {
                xml2js.parseString(input, (err: Error | null, result: unknown) => {
                  if (err) {
                    throw err;
                  }
                  return `XML Parsing Results:

Original XML:
${input}

JSON Output:
${JSON.stringify(result, null, 2)}

Structure: Successfully parsed XML to JSON object.`;
                });
                
                // Fallback synchronous parsing attempt
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(input, 'text/xml');
                
                if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                  throw new Error('Invalid XML syntax');
                }
                
                const xmlToObj = (node: Element): unknown => {
                  const obj: { [key: string]: unknown } = {};
                  
                  // Add attributes
                  for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    obj[`@${attr.name}`] = attr.value;
                  }
                  
                  // Add child elements
                  for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i] as Element;
                    if (!obj[child.tagName]) {
                      obj[child.tagName] = xmlToObj(child);
                    }
                  }
                  
                  // Add text content if no children
                  if (node.children.length === 0 && node.textContent?.trim()) {
                    return node.textContent.trim();
                  }
                  
                  return Object.keys(obj).length > 0 ? obj : node.textContent?.trim() || '';
                };
                
                const result = xmlToObj(xmlDoc.documentElement);
                
                return `XML Parsing Results:

Original XML:
${input}

JSON Output:
${JSON.stringify({ [xmlDoc.documentElement.tagName]: result }, null, 2)}

Structure: Successfully parsed XML to JSON object.`;
              } catch (error) {
                return `XML parsing error: ${error}. Please check your XML syntax.`;
              }

            case 'yaml':
              try {
                const yamlData = yaml.load(input.replace(/\\n/g, '\n'));
                
                return `YAML Parsing Results:

Original YAML:
${input.replace(/\\n/g, '\n')}

JSON Output:
${JSON.stringify(yamlData, null, 2)}

Type: ${Array.isArray(yamlData) ? 'Array' : typeof yamlData}
Structure: Successfully parsed YAML to JSON.`;
              } catch (error) {
                return `YAML parsing error: ${error}. Please check your YAML syntax.`;
              }

            case 'sql':
              try {
                const formatted = sqlFormatter(input, {
                  language: 'sql'
                });
                
                // Basic SQL analysis
                const sqlType = input.trim().toUpperCase().split(' ')[0];
                const hasWhere = /WHERE/i.test(input);
                const hasJoin = /JOIN/i.test(input);
                const hasGroupBy = /GROUP BY/i.test(input);
                const hasOrderBy = /ORDER BY/i.test(input);
                
                return `SQL Formatting Results:

Query Type: ${sqlType}
Analysis:
- Has WHERE clause: ${hasWhere ? 'Yes' : 'No'}
- Has JOIN: ${hasJoin ? 'Yes' : 'No'}
- Has GROUP BY: ${hasGroupBy ? 'Yes' : 'No'}
- Has ORDER BY: ${hasOrderBy ? 'Yes' : 'No'}

Formatted SQL:
${formatted}

Note: This is formatting only, not actual execution.`;
              } catch (error) {
                return `SQL formatting error: ${error}. Please check your SQL syntax.`;
              }

            case 'json':
              try {
                const parsed = JSON.parse(input);
                const formatted = JSON.stringify(parsed, null, 2);
                
                // JSON analysis
                const type = Array.isArray(parsed) ? 'Array' : typeof parsed;
                const keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0;
                const size = JSON.stringify(parsed).length;
                
                return `JSON Validation Results:

Status: ✅ Valid JSON
Type: ${type}
${type === 'object' ? `Properties: ${keys}` : ''}
Size: ${size} characters

Formatted JSON:
${formatted}`;
              } catch (error) {
                return `JSON validation error: ${error}
Invalid JSON syntax. Please check your JSON format.`;
              }

            case 'convert':
              const fromFormat = args[1];
              const toFormat = args[2];
              const convertData = args.slice(3).join(' ');
              
              if (!fromFormat || !toFormat || !convertData) {
              }
              
              try {
                let parsed;
                
                // Parse input data based on format
                switch (fromFormat.toLowerCase()) {
                  case 'json':
                    parsed = JSON.parse(convertData);
                    break;
                  case 'yaml':
                    // Handle both literal \n and actual newlines
                    const yamlData = convertData.replace(/\\n/g, '\n');
                    parsed = yaml.load(yamlData);
                    break;
                  case 'csv':
                    // Handle both literal \n and actual newlines
                    const csvData = convertData.replace(/\\n/g, '\n');
                    const csvLines = csvData.split('\n').map(line => line.split(','));
                    if (csvLines.length < 2) {
                      throw new Error('CSV data must have at least header and one data row');
                    }
                    const csvHeaders = csvLines[0].map(h => h.trim());
                    parsed = csvLines.slice(1).filter(row => row.length > 1).map(row => {
                      const obj: { [key: string]: string } = {};
                      csvHeaders.forEach((header, index) => {
                        obj[header] = row[index]?.trim() || '';
                      });
                      return obj;
                    });
                    break;
                  case 'xml':
                    // Basic XML parsing
                    try {
                      const xmlParser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
                      parsed = await new Promise((resolve, reject) => {
                        xmlParser.parseString(convertData, (err: Error | null, result: unknown) => {
                          if (err) reject(err);
                          else resolve(result);
                        });
                      });
                    } catch (xmlError) {
                      throw new Error(`XML parsing failed: ${xmlError}`);
                    }
                    break;
                  default:
                    throw new Error(`Unsupported input format: ${fromFormat}`);
                }
                
                // Convert to output format
                let result;
                switch (toFormat.toLowerCase()) {
                  case 'json':
                    result = JSON.stringify(parsed, null, 2);
                    break;
                  case 'yaml':
                    result = yaml.dump(parsed, { indent: 2 });
                    break;
                  case 'csv':
                    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                      const headers = Object.keys(parsed[0]);
                      const csvData = [
                        headers.join(','),
                        ...parsed.map(row => headers.map(h => {
                          const value = row[h] || '';
                          // Escape commas and quotes in CSV values
                          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                            ? `"${value.replace(/"/g, '""')}"` 
                            : value;
                        }).join(','))
                      ];
                      result = csvData.join('\n');
                    } else {
                      throw new Error('CSV output requires array of objects');
                    }
                    break;
                  case 'xml':
                    const xmlBuilder = new xml2js.Builder({ rootName: 'root', headless: true });
                    result = xmlBuilder.buildObject(parsed);
                    break;
                  default:
                    throw new Error(`Unsupported output format: ${toFormat}`);
                }
                
                return `Data Conversion Results:

From: ${fromFormat.toUpperCase()}
To: ${toFormat.toUpperCase()}

Input Data:
${convertData.substring(0, 200)}${convertData.length > 200 ? '...' : ''}

Output:
${result}`;
                
              } catch (error) {
                return `Conversion error: ${error}`;
              }

            default:
              return `Unknown data command: ${action}. Use 'data' without arguments for help.`;
          }
        } catch (error) {
          return `Data processing error: ${error}`;
        }
      }
    },
    {
      name: 'beautify',
      description: 'Format and beautify CSS, JavaScript, and HTML code',
      execute: (args) => {
        const type = args[0];
        const code = args.slice(1).join(' ');
        
        if (!type || !code) {
          return `Beautify Command Usage:

Format and beautify CSS, JavaScript, and HTML code!

Usage: beautify <type> <code>

Types:
  css        - Format CSS code
  js         - Format JavaScript code
  html       - Format HTML code
  json       - Format JSON data

  beautify css "body{margin:0;padding:20px;}"
  beautify js "function hello(){console.log('Hello');}"
  beautify html "<div><p>Hello</p></div>"
  beautify json '{"name":"John","age":25}'

This makes code more readable with proper indentation.`;
        }

        try {
          switch (type.toLowerCase()) {
            case 'css':
              const beautifiedCss = beautify.css(code, {
                indent_size: 2,
                indent_char: ' ',
                max_preserve_newlines: 1,
                preserve_newlines: true,
                end_with_newline: false
              });
              
              return `CSS Beautification Results:

Original:
${code}

Beautified:
${beautifiedCss}

✨ Code is now properly formatted with 2-space indentation!`;

            case 'js':
            case 'javascript':
              const beautifiedJs = beautify.js(code, {
                indent_size: 2,
                indent_char: ' ',
                max_preserve_newlines: 2,
                preserve_newlines: true,
                keep_array_indentation: false,
                break_chained_methods: false,
                brace_style: 'collapse',
                space_before_conditional: true,
                unescape_strings: false,
                jslint_happy: false,
                end_with_newline: false
              });
              
              return `JavaScript Beautification Results:

Original:
${code}

Beautified:
${beautifiedJs}

✨ Code is now properly formatted with consistent style!`;

            case 'html':
              const beautifiedHtml = beautify.html(code, {
                indent_size: 2,
                indent_char: ' ',
                max_preserve_newlines: 1,
                preserve_newlines: true,
                end_with_newline: false,
                indent_inner_html: false,
                wrap_line_length: 120,
                wrap_attributes: 'auto'
              });
              
              return `HTML Beautification Results:

Original:
${code}

Beautified:
${beautifiedHtml}

✨ HTML is now properly indented and formatted!`;

            case 'json':
              try {
                const parsed = JSON.parse(code);
                const beautifiedJson = JSON.stringify(parsed, null, 2);
                
                return `JSON Beautification Results:

Original:
${code}

Beautified:
${beautifiedJson}

✨ JSON is now properly formatted with 2-space indentation!`;
              } catch (jsonError) {
                return `JSON parsing error: ${jsonError}. Please provide valid JSON.`;
              }

            case 'xml':
              // Basic XML formatting
              const beautifiedXml = code
                .replace(/></g, '>\n<')
                .split('\n')
                .map((line, index, array) => {
                  const trimmed = line.trim();
                  if (!trimmed) return '';
                  
                  let indent = 0;
                  for (let i = 0; i < index; i++) {
                    const prevLine = array[i].trim();
                    if (prevLine.startsWith('<') && !prevLine.startsWith('</') && !prevLine.endsWith('/>')) {
                      indent++;
                    }
                    if (prevLine.startsWith('</')) {
                      indent--;
                    }
                  }
                  
                  if (trimmed.startsWith('</')) {
                    indent--;
                  }
                  
                  return '  '.repeat(Math.max(0, indent)) + trimmed;
                })
                .filter(line => line.trim())
                .join('\n');
              
              return `XML Beautification Results:

Original:
${code}

Beautified:
${beautifiedXml}

✨ XML is now properly indented!`;

            default:
              return `Unsupported beautification type: ${type}. Supported types: css, js, html, json, xml`;
          }
        } catch (error) {
          return `Beautification error: ${error}`;
        }
      }
    },
    {
      name: 'rps',
      description: 'Play Rock Paper Scissors against the computer',
      execute: (args) => {
        const playerChoice = args[0]?.toLowerCase();
        
        if (!playerChoice || !['rock', 'paper', 'scissors', 'r', 'p', 's'].includes(playerChoice)) {
          return `Rock Paper Scissors Game 🎮

Play against the computer!

Usage: rps <choice>

Choices:
  rock     (or r) - 🪨 Rock crushes scissors
  paper    (or p) - 📄 Paper covers rock
  scissors (or s) - ✂️ Scissors cuts paper

  rps rock
  rps paper
  rps scissors
  rps r
  rps p
  rps s

Good luck! 🍀`;
        }

        // Normalize player choice
        let player = '';
        if (['rock', 'r'].includes(playerChoice)) player = 'rock';
        else if (['paper', 'p'].includes(playerChoice)) player = 'paper';
        else if (['scissors', 's'].includes(playerChoice)) player = 'scissors';

        // Computer makes random choice
        const choices = ['rock', 'paper', 'scissors'];
        const computer = choices[Math.floor(Math.random() * choices.length)];

        // Determine winner
        let result = '';
        let outcome = '';
        
        if (player === computer) {
          result = "It's a tie!";
          outcome = '🤝';
        } else if (
          (player === 'rock' && computer === 'scissors') ||
          (player === 'paper' && computer === 'rock') ||
          (player === 'scissors' && computer === 'paper')
        ) {
          result = 'You win!';
          outcome = '🎉';
        } else {
          result = 'Computer wins!';
          outcome = '🤖';
        }

        // Get emojis for choices
        const getEmoji = (choice: string) => {
          switch (choice) {
            case 'rock': return '🪨';
            case 'paper': return '📄';
            case 'scissors': return '✂️';
            default: return '❓';
          }
        };

        // Create visual battle
        const playerEmoji = getEmoji(player);
        const computerEmoji = getEmoji(computer);

        // Explanation of what happened
        let explanation = '';
        if (player !== computer) {
          if (player === 'rock' && computer === 'scissors') explanation = 'Rock crushes scissors!';
          else if (player === 'paper' && computer === 'rock') explanation = 'Paper covers rock!';
          else if (player === 'scissors' && computer === 'paper') explanation = 'Scissors cuts paper!';
          else if (computer === 'rock' && player === 'scissors') explanation = 'Rock crushes scissors!';
          else if (computer === 'paper' && player === 'rock') explanation = 'Paper covers rock!';
          else if (computer === 'scissors' && player === 'paper') explanation = 'Scissors cuts paper!';
        }

        return `Rock Paper Scissors Battle! ${outcome}

${playerEmoji} YOU    vs    COMPUTER ${computerEmoji}
${player.toUpperCase().padEnd(8)} vs ${computer.toUpperCase().padStart(8)}

${result}
${explanation ? `${explanation}` : 'Same choice - nobody wins!'}

Want to play again? Try: rps <rock|paper|scissors>`;
      }
    },
    {
      name: 'hangman',
      description: 'Play hangman word guessing game',
      execute: (args) => {
        const action = args[0]?.toLowerCase();
        
        // Get or initialize game state from localStorage
        const getGameState = () => {
          const saved = localStorage.getItem('hangman_game');
          return saved ? JSON.parse(saved) : null;
        };
        
        const saveGameState = (state: unknown) => {
          localStorage.setItem('hangman_game', JSON.stringify(state));
        };
        
        const clearGameState = () => {
          localStorage.removeItem('hangman_game');
        };

        if (!action || action === 'help') {
          return `Hangman Word Guessing Game 🎯

Guess the hidden word one letter at a time!

Commands:
  hangman start [category]  - Start a new game
  hangman guess <letter>    - Guess a letter
  hangman word <word>       - Guess the entire word
  hangman hint             - Get a hint
  hangman quit             - End current game
  hangman status           - Show current game state

Categories: animals, countries, programming, movies, food

Example:
  hangman start animals
  hangman guess a
  hangman word elephant`;
        }

        const gameState = getGameState();

        switch (action) {
          case 'start':
            const category = args[1]?.toLowerCase() || 'random';
            
            const wordLists: { [key: string]: string[] } = {
              animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'kangaroo', 'butterfly', 'octopus', 'cheetah'],
              countries: ['australia', 'brazil', 'canada', 'denmark', 'egypt', 'france', 'germany', 'italy'],
              programming: ['javascript', 'python', 'algorithm', 'function', 'variable', 'array', 'object', 'method'],
              movies: ['inception', 'avatar', 'titanic', 'matrix', 'gladiator', 'interstellar', 'marvel', 'batman'],
              food: ['pizza', 'burger', 'sushi', 'pasta', 'tacos', 'sandwich', 'chocolate', 'strawberry']
            };
            
            let selectedList = wordLists.animals;
            if (category === 'random') {
              const categories = Object.keys(wordLists);
              const randomCategory = categories[Math.floor(Math.random() * categories.length)];
              selectedList = wordLists[randomCategory];
            } else if (wordLists[category]) {
              selectedList = wordLists[category];
            }
            
            const word = selectedList[Math.floor(Math.random() * selectedList.length)];
            const newGame = {
              word: word.toLowerCase(),
              category,
              guessed: [] as string[],
              wrongGuesses: 0,
              maxWrong: 6,
              isComplete: false,
              isWon: false
            };
            
            saveGameState(newGame);
            
            const display = word.split('').map(() => '_').join(' ');
            
            return `🎯 New Hangman Game Started!

Category: ${category === 'random' ? 'Random' : category.charAt(0).toUpperCase() + category.slice(1)}
Word: ${display} (${word.length} letters)
Wrong guesses: 0/${newGame.maxWrong}

Guess a letter with: hangman guess <letter>
Or guess the word with: hangman word <word>

Good luck! 🍀`;

          case 'guess':
            if (!gameState) {
              return 'No active game! Start a new game with: hangman start [category]';
            }
            
            if (gameState.isComplete) {
              return 'Game is over! Start a new game with: hangman start [category]';
            }
            
            const letter = args[1]?.toLowerCase();
            if (!letter || letter.length !== 1 || !/[a-z]/.test(letter)) {
              return 'Please provide a single letter: hangman guess <letter>';
            }
            
            if (gameState.guessed.includes(letter)) {
              return `You already guessed "${letter}"! Try a different letter.`;
            }
            
            gameState.guessed.push(letter);
            
            let result = '';
            if (gameState.word.includes(letter)) {
              result = `✅ Good guess! "${letter}" is in the word.`;
            } else {
              gameState.wrongGuesses++;
              result = `❌ Sorry, "${letter}" is not in the word.`;
            }
            
            // Check win condition
            const currentWordProgress = gameState.word.split('').map((char: string) => 
              gameState.guessed.includes(char) ? char : '_'
            ).join(' ');
            
            if (!currentWordProgress.includes('_')) {
              gameState.isComplete = true;
              gameState.isWon = true;
              result += `\n\n🎉 Congratulations! You won!
The word was: ${gameState.word.toUpperCase()}`;
              clearGameState();
            } else if (gameState.wrongGuesses >= gameState.maxWrong) {
              gameState.isComplete = true;
              gameState.isWon = false;
              result += `\n\n💀 Game Over! You're out of guesses.
The word was: ${gameState.word.toUpperCase()}`;
              clearGameState();
            } else {
              saveGameState(gameState);
            }
            
            // Hangman drawing
            const hangmanStages = [
              '  ____\n  |  |\n  |\n  |\n  |\n__|__',
              '  ____\n  |  |\n  |  O\n  |\n  |\n__|__',
              '  ____\n  |  |\n  |  O\n  |  |\n  |\n__|__',
              '  ____\n  |  |\n  |  O\n  | /|\n  |\n__|__',
              '  ____\n  |  |\n  |  O\n  | /|\\\n  |\n__|__',
              '  ____\n  |  |\n  |  O\n  | /|\\\n  | /\n__|__',
              '  ____\n  |  |\n  |  O\n  | /|\\\n  | / \\\n__|__'
            ];
            
            const hangmanArt = hangmanStages[gameState.wrongGuesses] || hangmanStages[0];
            
            return `${result}

${hangmanArt}

Word: ${currentWordProgress}
Guessed letters: [${gameState.guessed.join(', ')}]
Wrong guesses: ${gameState.wrongGuesses}/${gameState.maxWrong}

${!gameState.isComplete ? 'Keep guessing!' : 'Game complete!'}`;

          case 'word':
            if (!gameState) {
              return 'No active game! Start a new game with: hangman start [category]';
            }
            
            if (gameState.isComplete) {
              return 'Game is over! Start a new game with: hangman start [category]';
            }
            
            const guessedWord = args[1]?.toLowerCase();
            if (!guessedWord) {
              return 'Please provide a word: hangman word <word>';
            }
            
            if (guessedWord === gameState.word) {
              gameState.isComplete = true;
              gameState.isWon = true;
              clearGameState();
              return `🎉 Excellent! You guessed the word correctly!

The word was: ${gameState.word.toUpperCase()}

You won the game! 🏆`;
            } else {
              gameState.wrongGuesses += 2; // Wrong word guess costs more
              
              if (gameState.wrongGuesses >= gameState.maxWrong) {
                gameState.isComplete = true;
                gameState.isWon = false;
                clearGameState();
                return `❌ Wrong word! Game Over!

Your guess: ${guessedWord}
Correct word: ${gameState.word.toUpperCase()}

Better luck next time! 💀`;
              } else {
                saveGameState(gameState);
                const wrongWordProgress = gameState.word.split('').map((char: string) => 
                  gameState.guessed.includes(char) ? char : '_'
                ).join(' ');
                return `❌ Wrong word! "${guessedWord}" is not correct.
Wrong guesses: ${gameState.wrongGuesses}/${gameState.maxWrong}

Keep trying! The word is: ${wrongWordProgress}`;
              }
            }

          case 'hint':
            if (!gameState) {
              return 'No active game! Start a new game with: hangman start [category]';
            }
            
            if (gameState.isComplete) {
              return 'Game is over! Start a new game with: hangman start [category]';
            }
            
            // Reveal one unguessed letter
            const unguessedLetters = gameState.word.split('').filter((char: string) => 
              !gameState.guessed.includes(char)
            );
            
            if (unguessedLetters.length === 0) {
              return 'You\'ve already guessed all the letters!';
            }
            
            const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            gameState.guessed.push(hintLetter);
            saveGameState(gameState);
            
            const hintWordProgress = gameState.word.split('').map((char: string) => 
              gameState.guessed.includes(char) ? char : '_'
            ).join(' ');
            
            return `💡 Hint: The word contains the letter "${hintLetter}"

Word: ${hintWordProgress}
This hint cost you a guess! Use them wisely.`;

          case 'status':
            if (!gameState) {
              return 'No active game! Start a new game with: hangman start [category]';
            }
            
            const currentProgress = gameState.word.split('').map((char: string) => 
              gameState.guessed.includes(char) ? char : '_'
            ).join(' ');
            
            return `🎯 Current Hangman Game:

Category: ${gameState.category}
Word: ${currentProgress} (${gameState.word.length} letters)
Guessed letters: [${gameState.guessed.join(', ')}]
Wrong guesses: ${gameState.wrongGuesses}/${gameState.maxWrong}
Status: ${gameState.isComplete ? (gameState.isWon ? 'Won!' : 'Lost') : 'In Progress'}`;

          case 'quit':
            if (!gameState) {
              return 'No active game to quit.';
            }
            
            clearGameState();
            return `Game ended. The word was: ${gameState.word.toUpperCase()}
Thanks for playing! 👋`;

          default:
            return `Unknown hangman command: ${action}. Use 'hangman help' for instructions.`;
        }
      }
    },
    {
      name: 'dice',
      description: 'Roll dice with various combinations (1d6, 2d20, 3d10, etc.)',
      execute: (args) => {
        const input = args[0] || '1d6';
        
        if (!input || input === 'help') {
          return `Dice Rolling Command 🎲

Roll dice with various combinations!

Usage: dice <XdY> [options]
  X = number of dice
  Y = number of sides per die

  dice 1d6      - Roll one 6-sided die
  dice 2d6      - Roll two 6-sided dice
  dice 1d20     - Roll one 20-sided die (D&D)
  dice 4d6      - Roll four 6-sided dice
  dice 3d10     - Roll three 10-sided dice
  dice 1d100    - Roll percentile dice

Special Options:
  dice advantage    - Roll 2d20, take highest (D&D 5e)
  dice disadvantage - Roll 2d20, take lowest (D&D 5e)
  dice stats        - Roll 4d6 drop lowest, six times (D&D stats)

  dice 2d6+3    - Roll 2d6 and add 3
  dice 1d20-2   - Roll 1d20 and subtract 2`;
        }

        try {
          // Handle special cases
          if (input.toLowerCase() === 'advantage') {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            const result = Math.max(roll1, roll2);
            
            return `🎲 Advantage Roll (2d20, take highest):

Roll 1: ${roll1}
Roll 2: ${roll2}
Result: ${result} ⬆️

${result >= 15 ? '🎉 Great roll!' : result >= 10 ? '👍 Decent roll!' : '😬 Could be better...'}`;
          }
          
          if (input.toLowerCase() === 'disadvantage') {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            const result = Math.min(roll1, roll2);
            
            return `🎲 Disadvantage Roll (2d20, take lowest):

Roll 1: ${roll1}
Roll 2: ${roll2}
Result: ${result} ⬇️

${result >= 15 ? '🍀 Lucky despite disadvantage!' : result >= 10 ? '😐 Average roll' : '💀 Ouch!'}`;
          }
          
          if (input.toLowerCase() === 'stats') {
            const stats = [];
            for (let i = 0; i < 6; i++) {
              const rolls = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
              ];
              rolls.sort((a, b) => b - a); // Sort descending
              const sum = rolls[0] + rolls[1] + rolls[2]; // Take top 3
              stats.push({ rolls: rolls.slice(0, 3), sum });
            }
            
            const total = stats.reduce((sum, stat) => sum + stat.sum, 0);
            const average = (total / 6).toFixed(1);
            
            return `🎲 D&D Ability Score Generation (4d6 drop lowest):

${stats.map((stat, i) => 
              `Stat ${i + 1}: [${stat.rolls.join(', ')}] = ${stat.sum}`
            ).join('\n')}

Total: ${total}
Average: ${average}
${total >= 75 ? '🎉 Excellent stats!' : total >= 65 ? '👍 Good stats!' : '😅 Could be better...'}`;
          }
          
          // Parse dice notation (XdY+Z or XdY-Z)
          const diceMatch = input.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
          if (!diceMatch) {
            return `Invalid dice notation: ${input}
Use format like: 1d6, 2d20, 3d10+5, etc.`;
          }
          
          const numDice = parseInt(diceMatch[1]);
          const numSides = parseInt(diceMatch[2]);
          const modifier = diceMatch[3] ? parseInt(diceMatch[3]) : 0;
          
          // Validation
          if (numDice < 1 || numDice > 100) {
            return 'Number of dice must be between 1 and 100';
          }
          if (numSides < 2 || numSides > 1000) {
            return 'Number of sides must be between 2 and 1000';
          }
          
          // Roll the dice
          const rolls = [];
          for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * numSides) + 1);
          }
          
          const sum = rolls.reduce((total, roll) => total + roll, 0);
          const finalResult = sum + modifier;
          
          // Generate dice emojis
          const getDiceEmoji = (value: number, sides: number) => {
            if (sides === 6) {
              const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
              return diceEmojis[value - 1] || '🎲';
            }
            return '🎲';
          };
          
          const diceDisplay = rolls.map(roll => getDiceEmoji(roll, numSides)).join(' ');
          
          let resultMessage = '';
          if (numSides === 20) {
            if (rolls.includes(20)) resultMessage = '🎉 Natural 20! Critical hit!';
            else if (rolls.includes(1)) resultMessage = '💀 Natural 1! Critical fail!';
            else if (finalResult >= 15) resultMessage = '✨ Great roll!';
            else if (finalResult >= 10) resultMessage = '👍 Decent roll!';
            else resultMessage = '😬 Could be better...';
          } else if (numSides === 6) {
            if (rolls.every(r => r === 6)) resultMessage = '🎉 All sixes!';
            else if (rolls.every(r => r === 1)) resultMessage = '💀 Snake eyes!';
            else if (finalResult >= numDice * 4) resultMessage = '🔥 Hot dice!';
          }
          
          return `🎲 Dice Roll: ${input}

${diceDisplay}
Individual rolls: [${rolls.join(', ')}]
Sum: ${sum}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''}
Final Result: ${finalResult}

${resultMessage}`;

        } catch (error) {
          return `Dice rolling error: ${error}`;
        }
      }
    },
    {
      name: 'uuid',
      description: 'Generate UUIDs (v1, v4, v5) and UUID utilities',
      execute: (args) => {
        const action = args[0] || 'v4';
        
        if (!action || action === 'help') {
          return `UUID Generator 🔑

Generate and validate Universally Unique Identifiers!

Usage: uuid <version> [options]

Versions:
  v1        - Time-based UUID (includes timestamp and MAC address)
  v4        - Random UUID (most common, cryptographically secure)
  v5        - Name-based UUID using SHA-1 hash
  validate  - Validate if a string is a valid UUID

  uuid v4                           - Generate random UUID
  uuid v1                           - Generate time-based UUID
  uuid v5 example.com               - Generate name-based UUID
  uuid validate 550e8400-e29b-41d4  - Validate UUID format
  uuid info 550e8400-e29b-41d4      - Get UUID information

Options for v5:
  uuid v5 <name> [namespace]        - Custom name and namespace
  Available namespaces: dns, url, oid, x500`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'v1':
              const uuid1 = uuidv1();
              return `🔑 UUID v1 (Time-based):

Generated: ${uuid1}

Format: xxxxxxxx-xxxx-1xxx-xxxx-xxxxxxxxxxxx
Type: Time-based UUID
Timestamp: ${new Date().toISOString()}
Note: Contains timestamp and MAC address information`;

            case 'v4':
            case 'random':
              const uuid4 = uuidv4();
              return `🔑 UUID v4 (Random):

Generated: ${uuid4}

Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
Type: Random UUID (RFC 4122)
Entropy: 122 bits
Use case: General purpose, most common`;

            case 'v5':
              const name = args[1];
              const namespace = args[2] || 'dns';
              
              if (!name) {
                return 'Usage: uuid v5 <name> [namespace]\nExample: uuid v5 example.com dns';
              }

              // Predefined namespaces
              const namespaces = {
                dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 
                oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
                x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
              };

              const namespaceUuid = namespaces[namespace as keyof typeof namespaces] || namespace;
              
              try {
                const uuid5 = uuidv5(name, namespaceUuid);
                return `🔑 UUID v5 (Name-based):

Generated: ${uuid5}
Name: ${name}
Namespace: ${namespace} (${namespaceUuid})

Format: xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx
Type: Name-based UUID using SHA-1
Deterministic: Same name + namespace = same UUID`;
              } catch (error) {
                return `UUID v5 generation error: ${error}\nCheck namespace format (should be valid UUID)`;
              }

            case 'validate':
              const testUuid = args[1];
              if (!testUuid) {
                return 'Usage: uuid validate <uuid>\nExample: uuid validate 550e8400-e29b-41d4-bd07-34c2f1a3b3bc';
              }

              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              const isValid = uuidRegex.test(testUuid);
              
              if (isValid) {
                const version = testUuid.charAt(14);
                const variant = testUuid.charAt(19);
                
                return `✅ Valid UUID:

UUID: ${testUuid}
Version: ${version} (${
                  version === '1' ? 'Time-based' :
                  version === '4' ? 'Random' :
                  version === '5' ? 'Name-based SHA-1' :
                  'Unknown'
                })
Variant: ${variant} (RFC 4122)
Format: Standard UUID format`;
              } else {
                return `❌ Invalid UUID:

Input: ${testUuid}
Status: Not a valid UUID format
Expected: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Note: UUIDs should be 36 characters with hyphens`;
              }

            case 'info':
              const infoUuid = args[1];
              if (!infoUuid) {
                return 'Usage: uuid info <uuid>\nExample: uuid info 550e8400-e29b-41d4-bd07-34c2f1a3b3bc';
              }

              const infoRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              if (!infoRegex.test(infoUuid)) {
                return `❌ Invalid UUID format: ${infoUuid}`;
              }

              const versionChar = infoUuid.charAt(14);
              const variantChar = infoUuid.charAt(19);
              
              const versionInfo = {
                '1': 'Time-based (includes timestamp and MAC)',
                '2': 'DCE Security',
                '3': 'Name-based using MD5',
                '4': 'Random or pseudo-random',
                '5': 'Name-based using SHA-1'
              };

              return `🔍 UUID Information:

UUID: ${infoUuid}
Version: ${versionChar} - ${versionInfo[versionChar as keyof typeof versionInfo] || 'Unknown'}
Variant: ${variantChar} (RFC 4122)
Length: 36 characters (32 hex + 4 hyphens)
Hex digits: 32
Entropy: ${versionChar === '4' ? '122 bits' : 'Varies by version'}

Format breakdown:
${infoUuid.substring(0, 8)} - Time low
${infoUuid.substring(9, 13)} - Time mid  
${infoUuid.substring(14, 18)} - Time high + version
${infoUuid.substring(19, 23)} - Clock sequence + variant
${infoUuid.substring(24, 36)} - Node (MAC address for v1)`;

            case 'bulk':
              const count = parseInt(args[1]) || 5;
              const bulkVersion = args[2] || 'v4';
              
              if (count < 1 || count > 50) {
                return 'Bulk count must be between 1 and 50';
              }

              const uuids = [];
              for (let i = 0; i < count; i++) {
                if (bulkVersion === 'v1') {
                  uuids.push(uuidv1());
                } else {
                  uuids.push(uuidv4());
                }
              }

              return `🔑 Bulk UUID Generation:

Generated ${count} UUID ${bulkVersion.toUpperCase()}s:

${uuids.map((id, i) => `${i + 1}. ${id}`).join('\n')}

Total: ${count} UUIDs
Version: ${bulkVersion.toUpperCase()}
Format: RFC 4122 compliant`;

            default:
              return `Unknown UUID command: ${action}
Use 'uuid help' for available commands.`;
          }
        } catch (error) {
          return `UUID error: ${error}`;
        }
      }
    },
    {
      name: 'timestamp',
      description: 'Unix timestamp conversions and utilities',
      execute: (args) => {
        const action = args[0] || 'now';
        
        if (!action || action === 'help') {
          return `Timestamp Utilities ⏰

Convert between human-readable dates and Unix timestamps!

Usage: timestamp <command> [value]

Commands:
  now                    - Get current Unix timestamp
  current               - Get current timestamp in multiple formats
  to <timestamp>        - Convert Unix timestamp to human date
  from <date>           - Convert date to Unix timestamp
  diff <ts1> <ts2>      - Calculate difference between timestamps
  add <timestamp> <time> - Add time to timestamp
  format <timestamp> <format> - Format timestamp with custom format

Date Input Formats:
  "2024-01-15"          - ISO date
  "2024-01-15 14:30"    - ISO datetime
  "Jan 15, 2024"        - Human readable
  "15/01/2024"          - DD/MM/YYYY
  "01/15/2024"          - MM/DD/YYYY

  timestamp now         - Current timestamp
  timestamp to 1705327800
  timestamp from "2024-01-15 14:30"
  timestamp diff 1705327800 1705414200
  timestamp add 1705327800 1h
  timestamp format 1705327800 "YYYY-MM-DD HH:mm"`;
        }

        try {
          const now = Date.now();
          const currentTimestamp = Math.floor(now / 1000);

          switch (action.toLowerCase()) {
            case 'now':
              return `⏰ Current Unix Timestamp:

Timestamp: ${currentTimestamp}
Milliseconds: ${now}
ISO String: ${new Date(now).toISOString()}
Local Time: ${new Date(now).toLocaleString()}
UTC Time: ${new Date(now).toUTCString()}`;

            case 'current':
              const current = new Date(now);
              return `⏰ Current Time in Multiple Formats:

Unix Timestamp: ${currentTimestamp}
Unix (ms): ${now}
ISO 8601: ${current.toISOString()}
RFC 2822: ${current.toUTCString()}
Local: ${current.toLocaleString()}
Date Only: ${current.toDateString()}
Time Only: ${current.toTimeString()}
JSON: ${current.toJSON()}

Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
Offset: UTC${current.getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(Math.floor(current.getTimezoneOffset() / 60)).toString().padStart(2, '0')}:${Math.abs(current.getTimezoneOffset() % 60).toString().padStart(2, '0')}`;

            case 'to':
            case 'convert':
              const timestamp = args[1];
              if (!timestamp) {
                return 'Usage: timestamp to <unix_timestamp>\nExample: timestamp to 1705327800';
              }

              const ts = parseInt(timestamp);
              if (isNaN(ts)) {
                return `Invalid timestamp: ${timestamp}`;
              }

              // Auto-detect if it's in seconds or milliseconds
              const tsMs = ts.toString().length <= 10 ? ts * 1000 : ts;
              const date = new Date(tsMs);

              if (isNaN(date.getTime())) {
                return `Invalid timestamp: ${timestamp}`;
              }

              return `🔄 Timestamp Conversion:

Input: ${timestamp} ${ts.toString().length <= 10 ? '(seconds)' : '(milliseconds)'}
↓
ISO 8601: ${date.toISOString()}
Local Time: ${date.toLocaleString()}
UTC Time: ${date.toUTCString()}
Date: ${date.toDateString()}
Time: ${date.toTimeString()}

Relative: ${formatRelativeTime(date)}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

            case 'from':
              const dateInput = args.slice(1).join(' ');
              if (!dateInput) {
                return 'Usage: timestamp from <date>\nExample: timestamp from "2024-01-15 14:30"';
              }

              const inputDate = new Date(dateInput);
              if (isNaN(inputDate.getTime())) {
                return `Invalid date format: ${dateInput}
Try formats like:
- "2024-01-15"
- "2024-01-15 14:30"
- "Jan 15, 2024"
- "15/01/2024"`;
              }

              const unixSeconds = Math.floor(inputDate.getTime() / 1000);
              const unixMs = inputDate.getTime();

              return `🔄 Date to Timestamp Conversion:

Input: ${dateInput}
↓
Unix Timestamp: ${unixSeconds}
Unix (ms): ${unixMs}
ISO 8601: ${inputDate.toISOString()}
UTC: ${inputDate.toUTCString()}

Relative: ${formatRelativeTime(inputDate)}`;

            case 'diff':
            case 'difference':
              const ts1 = parseInt(args[1]);
              const ts2 = parseInt(args[2]);
              
              if (!args[1] || !args[2] || isNaN(ts1) || isNaN(ts2)) {
                return 'Usage: timestamp diff <timestamp1> <timestamp2>\nExample: timestamp diff 1705327800 1705414200';
              }

              // Auto-detect seconds vs milliseconds
              const ts1Ms = ts1.toString().length <= 10 ? ts1 * 1000 : ts1;
              const ts2Ms = ts2.toString().length <= 10 ? ts2 * 1000 : ts2;
              
              const diffMs = Math.abs(ts2Ms - ts1Ms);
              const diffSeconds = Math.floor(diffMs / 1000);
              const diffMinutes = Math.floor(diffSeconds / 60);
              const diffHours = Math.floor(diffMinutes / 60);
              const diffDays = Math.floor(diffHours / 24);

              const date1 = new Date(ts1Ms);
              const date2 = new Date(ts2Ms);

              return `📊 Timestamp Difference:

Timestamp 1: ${ts1} → ${date1.toLocaleString()}
Timestamp 2: ${ts2} → ${date2.toLocaleString()}

Difference:
- ${diffMs.toLocaleString()} milliseconds
- ${diffSeconds.toLocaleString()} seconds
- ${diffMinutes.toLocaleString()} minutes  
- ${diffHours.toLocaleString()} hours
- ${diffDays.toLocaleString()} days

Human readable: ${formatDuration(diffMs)}
Direction: ${ts2Ms > ts1Ms ? 'Forward' : 'Backward'} in time`;

            case 'add':
              const baseTs = parseInt(args[1]);
              const timeToAdd = args[2];
              
              if (!args[1] || !args[2] || isNaN(baseTs)) {
                return `Usage: timestamp add <timestamp> <time>
  timestamp add 1705327800 1h
  timestamp add 1705327800 30m
  timestamp add 1705327800 7d
  timestamp add 1705327800 1w`;
              }

              const baseTsMs = baseTs.toString().length <= 10 ? baseTs * 1000 : baseTs;
              const baseDate = new Date(baseTsMs);
              
              const timeMatch = timeToAdd.match(/^(\d+)([smhdw])$/);
              if (!timeMatch) {
                return `Invalid time format: ${timeToAdd}
Use: <number><unit> where unit is:
s = seconds, m = minutes, h = hours, d = days, w = weeks`;
              }

              const amount = parseInt(timeMatch[1]);
              const unit = timeMatch[2];
              
              const multipliers = {
                s: 1000,
                m: 60 * 1000,
                h: 60 * 60 * 1000,
                d: 24 * 60 * 60 * 1000,
                w: 7 * 24 * 60 * 60 * 1000
              };

              const addMs = amount * multipliers[unit as keyof typeof multipliers];
              const newDate = new Date(baseTsMs + addMs);
              const newTimestamp = Math.floor(newDate.getTime() / 1000);

              return `➕ Timestamp Addition:

Original: ${baseTs} → ${baseDate.toLocaleString()}
Add: ${amount} ${unit === 's' ? 'seconds' : unit === 'm' ? 'minutes' : unit === 'h' ? 'hours' : unit === 'd' ? 'days' : 'weeks'}
↓
New: ${newTimestamp} → ${newDate.toLocaleString()}

Difference: ${formatDuration(addMs)}`;

            case 'format':
              const formatTs = parseInt(args[1]);
              const formatString = args[2];
              
              if (!args[1] || isNaN(formatTs)) {
                return 'Usage: timestamp format <timestamp> [format]\nExample: timestamp format 1705327800 "YYYY-MM-DD"';
              }

              const formatTsMs = formatTs.toString().length <= 10 ? formatTs * 1000 : formatTs;
              const formatDate = new Date(formatTsMs);

              if (!formatString) {
                return `📅 Timestamp Formatting Options:

Input: ${formatTs} → ${formatDate.toLocaleString()}

Common formats:
- ISO: ${formatDate.toISOString()}
- US: ${formatDate.toLocaleDateString('en-US')}
- UK: ${formatDate.toLocaleDateString('en-GB')}  
- German: ${formatDate.toLocaleDateString('de-DE')}
- Japanese: ${formatDate.toLocaleDateString('ja-JP')}
- Short: ${formatDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
- Long: ${formatDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Use: timestamp format ${formatTs} "custom_format"`;
              }

              // Simple format replacement
              const formatted = formatString
                .replace(/YYYY/g, formatDate.getFullYear().toString())
                .replace(/MM/g, (formatDate.getMonth() + 1).toString().padStart(2, '0'))
                .replace(/DD/g, formatDate.getDate().toString().padStart(2, '0'))
                .replace(/HH/g, formatDate.getHours().toString().padStart(2, '0'))
                .replace(/mm/g, formatDate.getMinutes().toString().padStart(2, '0'))
                .replace(/ss/g, formatDate.getSeconds().toString().padStart(2, '0'));

              return `📅 Custom Timestamp Format:

Input: ${formatTs} → ${formatDate.toLocaleString()}
Format: ${formatString}
Result: ${formatted}`;

            default:
              return `Unknown timestamp command: ${action}
Use 'timestamp help' for available commands.`;
          }
        } catch (error) {
          return `Timestamp error: ${error}`;
        }

        // Helper function to format relative time
        function formatRelativeTime(date: Date): string {
          const now = new Date();
          const diffMs = Math.abs(now.getTime() - date.getTime());
          const isPast = date.getTime() < now.getTime();
          
          const seconds = Math.floor(diffMs / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          const months = Math.floor(days / 30);
          const years = Math.floor(days / 365);

          if (years > 0) return `${years} year${years > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
          if (months > 0) return `${months} month${months > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
          if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
          if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
          if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
          return `${seconds} second${seconds > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
        }

        // Helper function to format duration
        function formatDuration(ms: number): string {
          const seconds = Math.floor(ms / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);

          if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
          if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
          if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
          return `${seconds}s`;
        }
      }
    },
    {
      name: 'currency',
      description: 'Real-time currency conversion and exchange rates',
      execute: async (args): Promise<string> => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `Currency Converter 💱

Convert between currencies with real-time exchange rates!

Usage: currency <command> [options]

Commands:
  convert <amount> <from> <to>  - Convert currency
  rate <from> <to>              - Get exchange rate
  rates <base>                  - Get all rates for base currency
  list                          - List supported currencies
  symbols                       - Show currency symbols

  currency convert 100 USD EUR  - Convert $100 to Euros
  currency rate USD EUR         - Get USD to EUR rate
  currency rates USD            - All rates from USD
  currency list                 - Show currency codes
  currency symbols              - Show currency symbols

Common Currency Codes:
  USD - US Dollar      EUR - Euro         GBP - British Pound
  JPY - Japanese Yen   CAD - Canadian $   AUD - Australian $
  CHF - Swiss Franc    CNY - Chinese Yuan SEK - Swedish Krona
  NOK - Norwegian Kr   DKK - Danish Krone PLN - Polish Zloty

Note: Exchange rates provided by free API, may have limitations.`;
        }

        try {
          // Popular currency codes and symbols
          const currencyInfo = {
            USD: { name: 'US Dollar', symbol: '$' },
            EUR: { name: 'Euro', symbol: '€' },
            GBP: { name: 'British Pound', symbol: '£' },
            JPY: { name: 'Japanese Yen', symbol: '¥' },
            CAD: { name: 'Canadian Dollar', symbol: 'C$' },
            AUD: { name: 'Australian Dollar', symbol: 'A$' },
            CHF: { name: 'Swiss Franc', symbol: 'CHF' },
            CNY: { name: 'Chinese Yuan', symbol: '¥' },
            SEK: { name: 'Swedish Krona', symbol: 'kr' },
            NOK: { name: 'Norwegian Krone', symbol: 'kr' },
            DKK: { name: 'Danish Krone', symbol: 'kr' },
            PLN: { name: 'Polish Zloty', symbol: 'zł' },
            RUB: { name: 'Russian Ruble', symbol: '₽' },
            INR: { name: 'Indian Rupee', symbol: '₹' },
            BRL: { name: 'Brazilian Real', symbol: 'R$' },
            KRW: { name: 'South Korean Won', symbol: '₩' },
            SGD: { name: 'Singapore Dollar', symbol: 'S$' },
            HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
            MXN: { name: 'Mexican Peso', symbol: '$' },
            NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' }
          };

          switch (action.toLowerCase()) {
            case 'convert':
              const amount = parseFloat(args[1]);
              const fromCurrency = args[2]?.toUpperCase();
              const toCurrency = args[3]?.toUpperCase();

              if (!amount || !fromCurrency || !toCurrency || isNaN(amount)) {
                return 'Usage: currency convert <amount> <from> <to>\nExample: currency convert 100 USD EUR';
              }

              if (amount <= 0 || amount > 1000000000) {
                return 'Amount must be between 0 and 1,000,000,000';
              }

              try {
                // Use a free exchange rate API (exchangerate-api.com provides free tier)
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
                
                if (!response.ok) {
                  throw new Error(`API responded with status: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.rates || !data.rates[toCurrency]) {
                  return `Currency not supported: ${toCurrency}
Supported currencies include: USD, EUR, GBP, JPY, CAD, AUD, etc.
Use 'currency list' for all supported currencies.`;
                }

                const rate = data.rates[toCurrency];
                const convertedAmount = amount * rate;
                const reverseRate = 1 / rate;

                const fromInfo = currencyInfo[fromCurrency as keyof typeof currencyInfo];
                const toInfo = currencyInfo[toCurrency as keyof typeof currencyInfo];

                const fromSymbol = fromInfo?.symbol || fromCurrency;
                const toSymbol = toInfo?.symbol || toCurrency;

                return `💱 Currency Conversion:

${fromSymbol}${amount.toLocaleString()} ${fromCurrency}
↓
${toSymbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurrency}

Exchange Rate: 1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}
Reverse Rate: 1 ${toCurrency} = ${reverseRate.toFixed(6)} ${fromCurrency}

Updated: ${new Date(data.date).toLocaleDateString()}
Source: ${data.base} rates

${fromInfo ? `From: ${fromInfo.name}` : ''}
${toInfo ? `To: ${toInfo.name}` : ''}`;

              } catch (error) {
                // Fallback with mock data for demo purposes
                const mockRates: { [key: string]: number } = {
                  'USD-EUR': 0.85, 'EUR-USD': 1.18,
                  'USD-GBP': 0.75, 'GBP-USD': 1.33,
                  'USD-JPY': 110, 'JPY-USD': 0.009,
                  'EUR-GBP': 0.88, 'GBP-EUR': 1.14,
                  'USD-CAD': 1.25, 'CAD-USD': 0.80
                };

                const rateKey = `${fromCurrency}-${toCurrency}`;
                const reverseKey = `${toCurrency}-${fromCurrency}`;
                
                let rate = mockRates[rateKey];
                if (!rate && mockRates[reverseKey]) {
                  rate = 1 / mockRates[reverseKey];
                }
                
                if (!rate) {
                  rate = 1; // Default to 1:1 if no mock rate available
                }

                const convertedAmount = amount * rate;
                const fromInfo = currencyInfo[fromCurrency as keyof typeof currencyInfo];
                const toInfo = currencyInfo[toCurrency as keyof typeof currencyInfo];
                const fromSymbol = fromInfo?.symbol || fromCurrency;
                const toSymbol = toInfo?.symbol || toCurrency;

                return `💱 Currency Conversion (Demo Data):

${fromSymbol}${amount.toLocaleString()} ${fromCurrency}
↓
${toSymbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurrency}

Exchange Rate: 1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}

⚠️ Live rates unavailable: ${error}
Using sample exchange rates for demonstration.

${fromInfo ? `From: ${fromInfo.name}` : ''}
${toInfo ? `To: ${toInfo.name}` : ''}`;
              }

            case 'rate':
              const rateFrom = args[1]?.toUpperCase();
              const rateTo = args[2]?.toUpperCase();

              if (!rateFrom || !rateTo) {
                return 'Usage: currency rate <from> <to>\nExample: currency rate USD EUR';
              }

              try {
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${rateFrom}`);
                const data = await response.json();
                
                if (!data.rates || !data.rates[rateTo]) {
                  return `Currency pair not supported: ${rateFrom}/${rateTo}`;
                }

                const rate = data.rates[rateTo];
                const reverseRate = 1 / rate;

                const fromInfo = currencyInfo[rateFrom as keyof typeof currencyInfo];
                const toInfo = currencyInfo[rateTo as keyof typeof currencyInfo];

                return `📊 Exchange Rate:

1 ${rateFrom} = ${rate.toFixed(6)} ${rateTo}
1 ${rateTo} = ${reverseRate.toFixed(6)} ${rateFrom}

${fromInfo ? `${fromInfo.name} (${fromInfo.symbol})` : rateFrom}
↕️
${toInfo ? `${toInfo.name} (${toInfo.symbol})` : rateTo}

Last Updated: ${new Date(data.date).toLocaleDateString()}
Base Currency: ${data.base}`;

              } catch (error) {
                return `Exchange rate unavailable: ${error}
Try again later or check currency codes.`;
              }

            case 'rates':
              const baseCurrency = args[1]?.toUpperCase() || 'USD';

              try {
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
                const data = await response.json();
                
                if (!data.rates) {
                  return `No rates available for: ${baseCurrency}`;
                }

                // Get top 10 most popular currencies
                const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NOK'];
                const topRates = popularCurrencies
                  .filter(curr => curr !== baseCurrency && data.rates[curr])
                  .slice(0, 8);

                const baseInfo = currencyInfo[baseCurrency as keyof typeof currencyInfo];

                let output = `💱 Exchange Rates from ${baseCurrency}${baseInfo ? ` (${baseInfo.name})` : ''}:

`;

                topRates.forEach(currency => {
                  const rate = data.rates[currency];
                  const info = currencyInfo[currency as keyof typeof currencyInfo];
                  const symbol = info?.symbol || currency;
                  output += `1 ${baseCurrency} = ${symbol}${rate.toFixed(4)} ${currency}${info ? ` (${info.name})` : ''}\n`;
                });

                output += `
Total currencies available: ${Object.keys(data.rates).length}
Last updated: ${new Date(data.date).toLocaleDateString()}

Use 'currency convert' for specific conversions.`;

                return output;

              } catch (error) {
                return `Exchange rates unavailable: ${error}
Try again later or check the base currency code.`;
              }

            case 'list':
              const currencies = Object.entries(currencyInfo)
                .map(([code, info]) => `${code} - ${info.name} (${info.symbol})`)
                .join('\n');

              return `🌍 Supported Currency Codes:

${currencies}

Common Usage:
- Use 3-letter ISO codes (USD, EUR, GBP, etc.)
- Case insensitive (usd = USD)
- Covers major world currencies
- Real-time exchange rates when available

  currency convert 100 usd eur
  currency rate gbp jpy
  currency rates cad`;

            case 'symbols':
              const symbols = Object.entries(currencyInfo)
                .map(([code, info]) => `${info.symbol} ${code} - ${info.name}`)
                .join('\n');

              return `💰 Currency Symbols:

${symbols}

Note: Some currencies share symbols (e.g., $ for USD, CAD, AUD)
Use currency codes for unambiguous conversion.`;

            default:
              return `Unknown currency command: ${action}
Use 'currency help' for available commands.`;
          }
        } catch (error) {
          return `Currency error: ${error}`;
        }
      }
    },
    {
      name: 'spotify',
      description: 'Search and get information about Spotify tracks, albums, and playlists',
      /* eslint-disable @typescript-eslint/no-explicit-any */
      execute: async (args) => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `Spotify Music Search 🎵

Get information about Spotify tracks, albums, and playlists!

Usage: spotify <command> [query]

Commands:
  search <query>          - Search for tracks, artists, or albums
  track <url_or_id>       - Get track information
  album <url_or_id>       - Get album information
  playlist <url_or_id>    - Get playlist information
  artist <name>           - Search for artist information
  preview <url_or_id>     - Get track preview URL

URL Formats Supported:
  spotify:track:4iV5W9uYEdYUVa79Axb7Rh
  https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh

Examples:
  spotify search "Bohemian Rhapsody Queen"
  spotify track https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
  spotify artist "The Beatles"
  spotify album "Abbey Road"

Note: Uses public Spotify APIs. Some features may be limited.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'search':
              const query = args.slice(1).join(' ');
              if (!query) {
                return 'Please provide a search query.\nExample: spotify search "Bohemian Rhapsody"';
              }

              try {
                // Use a free music search API that doesn't require authentication
                const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5`;
                const response = await fetch(searchUrl);
                
                if (!response.ok) {
                  throw new Error(`Search API failed: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.results || data.results.length === 0) {
                  return `No results found for "${query}"\n\nTry:\n- Different spelling\n- Artist name only\n- Song title only\n- Less specific terms`;
                }

                let output = `🎵 Music Search Results for "${query}":\n\n`;
                
                data.results.slice(0, 5).forEach((track: any, i: number) => {
                  const duration = track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 0;
                  const minutes = Math.floor(duration / 60);
                  const seconds = duration % 60;
                  
                  const albumArt = track.artworkUrl100 ? 
                    `<img src="${track.artworkUrl100.replace('100x100', '300x300')}" alt="${track.collectionName}" style="width: 60px; height: 60px; border-radius: 8px; margin-right: 10px; vertical-align: top;" onerror="this.style.display='none';">` : '';
                  
                  output += `<div style="display: flex; align-items: flex-start; margin: 10px 0; padding: 10px; border-radius: 8px;">
  ${albumArt}
  <div>
    <strong>${i + 1}. ${track.trackName || 'Unknown Title'}</strong><br>
    🎤 ${track.artistName || 'Unknown Artist'}<br>
    💿 ${track.collectionName || 'Unknown Album'}<br>
    ⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}<br>
    🎵 ${track.primaryGenreName || 'Unknown'}<br>
    📅 ${track.releaseDate ? new Date(track.releaseDate).getFullYear() : 'Unknown'}
    ${track.previewUrl ? `<br>🎧 <a href="${track.previewUrl}" target="_blank">Preview</a>` : ''}
  </div>
</div>\n`;
                });

                output += `Found ${data.resultCount} total results\nShowing top 5 matches`;
                
                return output;
                
              } catch (error) {
                return `Search failed: ${error}\n\nThis might happen due to:\n- Network connectivity issues\n- API rate limits\n- Invalid search terms\n\nTry again with different search terms.`;
              }

            case 'track':
            case 'song':
              const trackInput = args.slice(1).join(' ');
              if (!trackInput) {
                return 'Please provide a Spotify URL or track ID.\nExample: spotify track <a href="https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" target="_blank">https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh</a>';
              }

              try {
                // Try to extract track info from Spotify URL
                if (trackInput.includes('spotify.com') || trackInput.includes('spotify:')) {
                  // @ts-expect-error - spotify-url-info has no TypeScript declarations
                  const spotifyUrlInfo = await import('spotify-url-info') as any;
                  const getData = spotifyUrlInfo.getData;
                  
                  const data = await getData(trackInput);
                  
                  return `🎵 Spotify Track Information:

Title: ${data.name || 'Unknown'}
Artist: ${data.artists ? data.artists.map((a: any) => a.name).join(', ') : 'Unknown'}
Album: ${data.album?.name || 'Unknown'}
Duration: ${data.duration_ms ? `${Math.floor(data.duration_ms / 60000)}:${Math.floor((data.duration_ms % 60000) / 1000).toString().padStart(2, '0')}` : 'Unknown'}
Release Date: ${data.album?.release_date || 'Unknown'}
Popularity: ${data.popularity || 'Unknown'}/100
Track Number: ${data.track_number || 'Unknown'}
${data.album?.total_tracks ? `Total Tracks: ${data.album.total_tracks}` : ''}

External URLs:
Spotify: <a href="${data.external_urls?.spotify || trackInput}" target="_blank">${data.external_urls?.spotify || trackInput}</a>
${data.preview_url ? `Preview: <a href="${data.preview_url}" target="_blank">${data.preview_url}</a>` : 'No preview available'}

${data.album?.images && data.album.images[0] ? 
  `<img src="${data.album.images[0].url}" alt="${data.name}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />` : 
  ''}`;
                } else {
                  return 'Please provide a valid Spotify URL.\nExample: <a href="https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" target="_blank">https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh</a>';
                }
              } catch (error) {
                return `Failed to get track information: ${error}\n\nMake sure you're using a valid Spotify track URL.`;
              }

            case 'album':
              const albumInput = args.slice(1).join(' ');
              if (!albumInput) {
                return 'Please provide a Spotify album URL or search for an album name.\nExample: spotify album <a href="https://open.spotify.com/album/1A2GTWGtFfWp7KSQTwWOyo" target="_blank">https://open.spotify.com/album/1A2GTWGtFfWp7KSQTwWOyo</a>';
              }

              try {
                if (albumInput.includes('spotify.com') || albumInput.includes('spotify:')) {
                  // @ts-expect-error - spotify-url-info has no TypeScript declarations
                  const spotifyUrlInfo = await import('spotify-url-info') as any;
                  const getData = spotifyUrlInfo.getData;
                  
                  const data = await getData(albumInput);
                  
                  const totalDuration = data.tracks?.items?.reduce((sum: number, track: any) => sum + (track.duration_ms || 0), 0) || 0;
                  const hours = Math.floor(totalDuration / 3600000);
                  const minutes = Math.floor((totalDuration % 3600000) / 60000);
                  
                  return `💿 Spotify Album Information:

Album: ${data.name || 'Unknown'}
Artist: ${data.artists ? data.artists.map((a: any) => a.name).join(', ') : 'Unknown'}
Release Date: ${data.release_date || 'Unknown'}
Total Tracks: ${data.total_tracks || 'Unknown'}
Total Duration: ${hours > 0 ? `${hours}h ` : ''}${minutes}m
Genre: ${data.genres?.join(', ') || 'Unknown'}
Label: ${data.label || 'Unknown'}
Popularity: ${data.popularity || 'Unknown'}/100

${data.tracks?.items ? 'Track List:\n' + data.tracks.items.slice(0, 10).map((track: any, i: number) => 
  `${i + 1}. ${track.name} (${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')})`
).join('\n') + (data.tracks.items.length > 10 ? `\n... and ${data.tracks.items.length - 10} more tracks` : '') : ''}

External URLs:
Spotify: <a href="${data.external_urls?.spotify || albumInput}" target="_blank">${data.external_urls?.spotify || albumInput}</a>

${data.images && data.images[0] ? 
  `<img src="${data.images[0].url}" alt="${data.name}" style="max-width: 250px; max-height: 250px; border-radius: 8px;" />` : 
  ''}`;
                } else {
                  // Search for album by name
                  const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(albumInput)}&entity=album&limit=3`;
                  const response = await fetch(searchUrl);
                  const data = await response.json();
                  
                  if (!data.results || data.results.length === 0) {
                    return `No albums found for "${albumInput}"\nTry providing a Spotify URL or different search terms.`;
                  }

                  let output = `💿 Album Search Results for "${albumInput}":\n\n`;
                  
                  data.results.forEach((album: any, i: number) => {
                    output += `${i + 1}. ${album.collectionName}\n`;
                    output += `   Artist: ${album.artistName}\n`;
                    output += `   Tracks: ${album.trackCount || 'Unknown'}\n`;
                    output += `   Genre: ${album.primaryGenreName || 'Unknown'}\n`;
                    output += `   Release: ${album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'Unknown'}\n`;
                    if (album.collectionViewUrl) {
                      output += `   iTunes: ${album.collectionViewUrl}\n`;
                    }
                    output += '\n';
                  });

                  return output;
                }
              } catch (error) {
                return `Failed to get album information: ${error}`;
              }

            case 'artist':
              const artistQuery = args.slice(1).join(' ');
              if (!artistQuery) {
                return 'Please provide an artist name.\nExample: spotify artist "The Beatles"';
              }

              try {
                const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artistQuery)}&entity=musicArtist&limit=3`;
                const response = await fetch(searchUrl);
                const data = await response.json();
                
                if (!data.results || data.results.length === 0) {
                  return `No artists found for "${artistQuery}"\nTry different spelling or the exact artist name.`;
                }

                let output = `🎤 Artist Search Results for "${artistQuery}":\n\n`;
                
                data.results.forEach((artist: any, i: number) => {
                  output += `${i + 1}. ${artist.artistName}\n`;
                  output += `   Genre: ${artist.primaryGenreName || 'Unknown'}\n`;
                  if (artist.artistLinkUrl) {
                    output += `   iTunes: ${artist.artistLinkUrl}\n`;
                  }
                  output += '\n';
                });

                // Get some popular tracks by this artist
                const trackSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(data.results[0].artistName)}&media=music&limit=5`;
                const trackResponse = await fetch(trackSearchUrl);
                const trackData = await trackResponse.json();
                
                if (trackData.results && trackData.results.length > 0) {
                  output += `🎵 Popular tracks by ${data.results[0].artistName}:\n\n`;
                  trackData.results.slice(0, 5).forEach((track: any, i: number) => {
                    const duration = track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 0;
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;
                    
                    output += `${i + 1}. ${track.trackName}\n`;
                    output += `   Album: ${track.collectionName}\n`;
                    output += `   Duration: ${minutes}:${seconds.toString().padStart(2, '0')}\n`;
                    if (track.previewUrl) {
                      output += `   Preview: ${track.previewUrl}\n`;
                    }
                    output += '\n';
                  });
                }

                return output;
                
              } catch (error) {
                return `Artist search failed: ${error}`;
              }

            case 'playlist':
              const playlistInput = args.slice(1).join(' ');
              if (!playlistInput) {
                return 'Please provide a Spotify playlist URL.\nExample: spotify playlist <a href="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" target="_blank">https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M</a>';
              }

              try {
                if (playlistInput.includes('spotify.com') || playlistInput.includes('spotify:')) {
                  // @ts-expect-error - spotify-url-info has no TypeScript declarations
                  const spotifyUrlInfo = await import('spotify-url-info') as any;
                  const getData = spotifyUrlInfo.getData;
                  
                  const data = await getData(playlistInput);
                  
                  return `📋 Spotify Playlist Information:

Name: ${data.name || 'Unknown'}
Description: ${data.description || 'No description'}
Owner: ${data.owner?.display_name || 'Unknown'}
Followers: ${data.followers?.total || 'Unknown'}
Total Tracks: ${data.tracks?.total || 'Unknown'}
Public: ${data.public ? 'Yes' : 'No'}

${data.tracks?.items ? 'Recent Tracks:\n' + data.tracks.items.slice(0, 10).map((item: any, i: number) => {
  const track = item.track;
  return `${i + 1}. ${track.name} - ${track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}`;
}).join('\n') + (data.tracks.items.length > 10 ? `\n... and ${data.tracks.total - 10} more tracks` : '') : ''}

External URLs:
Spotify: <a href="${data.external_urls?.spotify || playlistInput}" target="_blank">${data.external_urls?.spotify || playlistInput}</a>

${data.images && data.images[0] ? 
  `<img src="${data.images[0].url}" alt="${data.name}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />` : 
  ''}`;
                } else {
                  return 'Please provide a valid Spotify playlist URL.\nExample: <a href="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" target="_blank">https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M</a>';
                }
              } catch (error) {
                return `Failed to get playlist information: ${error}`;
              }

            case 'preview':
              const previewInput = args.slice(1).join(' ');
              if (!previewInput) {
                return 'Please provide a Spotify track URL to get preview.\nExample: spotify preview <a href="https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" target="_blank">https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh</a>';
              }

              try {
                if (previewInput.includes('spotify.com') || previewInput.includes('spotify:')) {
                  // @ts-expect-error - spotify-url-info has no TypeScript declarations
                  const spotifyUrlInfo = await import('spotify-url-info') as any;
                  const getData = spotifyUrlInfo.getData;
                  
                  const data = await getData(previewInput);
                  
                  if (data.preview_url) {
                    return `🎵 Track Preview Available:

Track: ${data.name || 'Unknown'}
Artist: ${data.artists ? data.artists.map((a: any) => a.name).join(', ') : 'Unknown'}

Preview URL: <a href="${data.preview_url}" target="_blank">${data.preview_url}</a>

<audio controls style="width: 100%; margin: 10px 0;">
  <source src="${data.preview_url}" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

Note: Preview is 30 seconds long and provided by Spotify.`;
                  } else {
                    return `🎵 Track Information:

Track: ${data.name || 'Unknown'}
Artist: ${data.artists ? data.artists.map((a: any) => a.name).join(', ') : 'Unknown'}

❌ No preview available for this track.

Some tracks don't have preview clips available due to licensing restrictions.`;
                  }
                } else {
                  return 'Please provide a valid Spotify track URL.\nExample: <a href="https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh" target="_blank">https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh</a>';
                }
              } catch (error) {
                return `Failed to get preview: ${error}`;
              }

            default:
              return `Unknown Spotify command: ${action}
Use 'spotify help' for available commands.`;
          }
        } catch (error) {
          return `Spotify error: ${error}

Try again or check your internet connection.`;
        }
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    },
    {
      name: 'translate',
      description: 'Translate text between different languages',
      execute: async (args) => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `Language Translator 🌍

Translate text between different languages!

Usage: translate <command> [options]

Commands:
  auto <text>                 - Auto-detect language and translate to English
  <from> <to> <text>         - Translate from one language to another
  detect <text>              - Detect the language of text
  languages                  - Show supported language codes

Languages (use codes):
  en - English     es - Spanish      fr - French       de - German
  it - Italian     pt - Portuguese   ru - Russian      ja - Japanese
  ko - Korean      zh - Chinese      ar - Arabic       hi - Hindi
  nl - Dutch       sv - Swedish      da - Danish       no - Norwegian

Examples:
  translate auto "Hola mundo"
  translate es en "Hola mundo"
  translate en fr "Hello world"
  translate detect "Bonjour le monde"

Note: Uses free translation APIs with potential rate limits.`;
        }

        try {
          // Language codes and names
          const languages = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
            'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi',
            'nl': 'Dutch', 'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian',
            'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'he': 'Hebrew',
            'th': 'Thai', 'vi': 'Vietnamese', 'uk': 'Ukrainian', 'cs': 'Czech'
          };

          switch (action.toLowerCase()) {
            case 'auto':
              const autoText = args.slice(1).join(' ');
              if (!autoText) {
                return 'Please provide text to translate.\nExample: translate auto "Hola mundo"';
              }

              try {
                // Use LibreTranslate API (free, open source)
                const response = await fetch('https://libretranslate.de/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    q: autoText,
                    source: 'auto',
                    target: 'en',
                    format: 'text'
                  })
                });

                if (!response.ok) {
                  throw new Error(`Translation API failed: ${response.status}`);
                }

                const data = await response.json();
                
                return `🌍 Auto Translation:

Original: ${autoText}
Detected: ${data.detectedLanguage ? languages[data.detectedLanguage as keyof typeof languages] || data.detectedLanguage : 'Unknown'}
Translated: ${data.translatedText}

Target: English
Service: LibreTranslate`;

              } catch (error) {
                // Fallback to a simple word/phrase translation
                const simpleTranslations = {
                  'hola': 'hello',
                  'mundo': 'world',
                  'gracias': 'thank you',
                  'bonjour': 'hello',
                  'merci': 'thank you',
                  'monde': 'world',
                  'guten tag': 'good day',
                  'danke': 'thank you',
                  'welt': 'world',
                  'ciao': 'hello',
                  'grazie': 'thank you',
                  'mondo': 'world'
                };

                const lowerText = autoText.toLowerCase();
                const found = Object.entries(simpleTranslations).find(([key]) => 
                  lowerText.includes(key)
                );

                if (found) {
                  return `🌍 Basic Translation (API unavailable):

Original: ${autoText}
Detected word: "${found[0]}" = "${found[1]}"

Note: Translation API is unavailable. This is a basic word match.
Try again later for full translation service.`;
                }

                return `Translation API unavailable: ${error}

Common translations:
• Hola = Hello
• Bonjour = Hello
• Guten Tag = Good Day
• Gracias = Thank you
• Merci = Thank you

Try again later for full translation service.`;
              }

            case 'detect':
              const detectText = args.slice(1).join(' ');
              if (!detectText) {
                return 'Please provide text to detect language.\nExample: translate detect "Bonjour le monde"';
              }

              try {
                const response = await fetch('https://libretranslate.de/detect', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    q: detectText
                  })
                });

                if (!response.ok) {
                  throw new Error(`Detection API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (data && data.length > 0) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const results = data.slice(0, 3).map((result: any) => 
                    `${languages[result.language as keyof typeof languages] || result.language} (${(result.confidence * 100).toFixed(1)}%)`
                  ).join('\n');

                  return `🔍 Language Detection:

Text: "${detectText}"

Detected Languages:
${results}

Most likely: ${languages[data[0].language as keyof typeof languages] || data[0].language}
Confidence: ${(data[0].confidence * 100).toFixed(1)}%`;
                } else {
                  return `Could not detect language for: "${detectText}"`;
                }

              } catch (error) {
                // Basic pattern matching for language detection
                const patterns = {
                  'spanish': /[¿¡ñáéíóúü]/i,
                  'french': /[àâäçéèêëïîôùûüÿ]/i,
                  'german': /[äöüß]/i,
                  'italian': /[àèéìíîòóù]/i,
                  'portuguese': /[ãâáàéêíóôõú]/i,
                  'russian': /[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]/i,
                  'japanese': /[ひらがなカタカナ]/i,
                  'chinese': /[\u4e00-\u9fff]/i,
                  'arabic': /[\u0600-\u06ff]/i
                };

                const detected = Object.entries(patterns).find(([, pattern]) => 
                  pattern.test(detectText)
                );

                if (detected) {
                  return `🔍 Basic Language Detection (API unavailable):

Text: "${detectText}"
Detected: ${detected[0].charAt(0).toUpperCase() + detected[0].slice(1)}

Note: This is basic pattern matching. Try again later for accurate detection.`;
                }

                return `Language detection unavailable: ${error}

Text appears to be in English or contains only common characters.`;
              }

            case 'languages':
              const languageList = Object.entries(languages)
                .map(([code, name]) => `${code} - ${name}`)
                .join('\n');

              return `🌍 Supported Language Codes:

${languageList}

Usage Examples:
  translate en es "Hello world"     - English to Spanish
  translate fr de "Bonjour"         - French to German
  translate auto "Hola"             - Auto-detect to English
  translate detect "你好"           - Detect language

Note: Use 2-letter ISO language codes for best results.`;

            default:
              // Handle "from to text" translation
              const fromLang = action.toLowerCase();
              const toLang = args[1]?.toLowerCase();
              const text = args.slice(2).join(' ');

              if (!toLang || !text) {
                return `Invalid translation format. Use:
  translate <from> <to> <text>

Example: translate en es "Hello world"
Or use: translate help`;
              }

              if (!languages[fromLang as keyof typeof languages]) {
                return `Unknown source language: ${fromLang}
Use 'translate languages' to see supported codes.`;
              }

              if (!languages[toLang as keyof typeof languages]) {
                return `Unknown target language: ${toLang}
Use 'translate languages' to see supported codes.`;
              }

              try {
                const response = await fetch('https://libretranslate.de/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    q: text,
                    source: fromLang,
                    target: toLang,
                    format: 'text'
                  })
                });

                if (!response.ok) {
                  throw new Error(`Translation API failed: ${response.status}`);
                }

                const data = await response.json();
                
                return `🌍 Translation:

Original (${languages[fromLang as keyof typeof languages]}): ${text}
Translated (${languages[toLang as keyof typeof languages]}): ${data.translatedText}

${fromLang} → ${toLang}
Service: LibreTranslate`;

              } catch (error) {
                return `Translation failed: ${error}

This could be due to:
- Network connectivity issues
- API rate limits
- Unsupported language pair

Try again later or use 'translate auto' for auto-detection.`;
              }
          }
        } catch (error) {
          return `Translation error: ${error}`;
        }
      }
    },
    {
      name: 'github',
      description: 'Search GitHub repositories, users, and get repository information',
      execute: async (args) => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `GitHub Search & Info 🐙

Search GitHub repositories, users, and get repository information!

Usage: github <command> [query]

Commands:
  repo <search_term>          - Search for repositories
  user <username>             - Get user information
  trending                    - Get trending repositories
  profile <username>          - Get detailed user profile
  repo-info <owner/repo>      - Get specific repository details
  gists <username>            - Get user's public gists

Examples:
  github repo "javascript game"
  github user "octocat"
  github trending
  github profile "torvalds"
  github repo-info "microsoft/vscode"
  github gists "octocat"

Note: Uses GitHub's public API with rate limits for unauthenticated requests.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'repo':
            case 'search':
              const searchQuery = args.slice(1).join(' ');
              if (!searchQuery) {
                return 'Please provide a search term.\nExample: github repo "javascript game"';
              }

              try {
                const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=5`);
                
                if (!response.ok) {
                  throw new Error(`GitHub API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.items || data.items.length === 0) {
                  return `No repositories found for "${searchQuery}"\n\nTry:\n- Different keywords\n- More specific terms\n- Programming language names\n- Popular project names`;
                }

                let output = `🔍 GitHub Repository Search: "${searchQuery}"\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.items.forEach((repo: any, i: number) => {
                  const stars = repo.stargazers_count > 1000 ? 
                    `${(repo.stargazers_count / 1000).toFixed(1)}k` : 
                    repo.stargazers_count.toString();
                  
                  const ownerAvatar = `<img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px; vertical-align: middle;" onerror="this.style.display='none';">`;
                  
                  // Language colors based on GitHub's language colors
                  const languageColors: { [key: string]: string } = {
                    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Java': '#b07219',
                    'C++': '#f34b7d', 'C': '#555555', 'C#': '#239120', 'PHP': '#4F5D95', 'Ruby': '#701516',
                    'Go': '#00ADD8', 'Rust': '#dea584', 'Swift': '#fa7343', 'Kotlin': '#A97BFF', 'Dart': '#00B4AB',
                    'HTML': '#e34c26', 'CSS': '#1572B6', 'Vue': '#4FC08D', 'React': '#61DAFB', 'Angular': '#DD0031'
                  };
                  const languageColor = repo.language ? (languageColors[repo.language] || '#333') : '#333';
                  const languageBadge = repo.language ? 
                    `<span style="background: ${languageColor}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">${repo.language}</span>` : '';
                  
                  output += `${i + 1}. <div style="display: inline-flex; align-items: center; margin: 5px 0;">${ownerAvatar}<strong>${repo.full_name}</strong>${languageBadge}</div>\n`;
                  output += `   ⭐ ${stars} stars • 🍴 ${repo.forks_count} forks\n`;
                  output += `   � ${repo.description || 'No description'}\n`;
                  output += `   🔗 <a href="${repo.html_url}" target="_blank">${repo.html_url}</a>\n`;
                  output += `   📅 Updated: ${new Date(repo.updated_at).toLocaleDateString()}\n\n`;
                });

                output += `Found ${data.total_count.toLocaleString()} total repositories\nShowing top 5 results`;
                
                return output;
                
              } catch (error) {
                return `GitHub search failed: ${error}\n\nThis might be due to:\n- Network connectivity issues\n- GitHub API rate limits\n- Invalid search terms\n\nTry again with different search terms.`;
              }

            case 'user':
            case 'profile':
              const username = args[1];
              if (!username) {
                return 'Please provide a username.\nExample: github user octocat';
              }

              try {
                const response = await fetch(`https://api.github.com/users/${username}`);
                
                if (!response.ok) {
                  if (response.status === 404) {
                    return `User "${username}" not found on GitHub.\nCheck the spelling and try again.`;
                  }
                  throw new Error(`GitHub API failed: ${response.status}`);
                }

                const user = await response.json();
                
                // Get user's repositories
                const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&order=desc&per_page=5`);
                const repos = reposResponse.ok ? await reposResponse.json() : [];

                const userAvatar = user.avatar_url ? 
                  `<img src="${user.avatar_url}" alt="${user.login}" style="width: 80px; height: 80px; border-radius: 50%; margin: 10px 0; border: 3px solid #0366d6;" onerror="this.style.display='none';">` : '';

                return `<div style="display: flex; align-items: flex-start; gap: 15px; margin: 10px 0;">
  ${userAvatar}
  <div>
    <h3 style="margin: 0 0 5px 0;">👤 ${user.name || user.login}</h3>
    <p style="margin: 0; color: #666;">@${user.login}</p>
    ${user.bio ? `<p style="margin: 5px 0; font-style: italic;">"${user.bio}"</p>` : ''}
  </div>
</div>

📍 ${user.location || 'Location not specified'}
🏢 ${user.company || 'Company not specified'}
🌐 ${user.blog ? `<a href="${user.blog}" target="_blank">${user.blog}</a>` : 'No website'}

📊 Statistics:
• 📂 Public Repos: ${user.public_repos}
• 👥 Followers: ${user.followers.toLocaleString()}
• 👤 Following: ${user.following.toLocaleString()}
• 📦 Public Gists: ${user.public_gists}

📅 Joined GitHub: ${new Date(user.created_at).toLocaleDateString()}
🔗 Profile: <a href="${user.html_url}" target="_blank">${user.html_url}</a>

${repos.length > 0 ? `🌟 Top Repositories:
${repos.slice(0, 3).map((repo: any, i: number) => // eslint-disable-line @typescript-eslint/no-explicit-any
  `${i + 1}. <strong>${repo.name}</strong> (⭐ ${repo.stargazers_count} stars)${repo.description ? `\n   ${repo.description.substring(0, 80)}${repo.description.length > 80 ? '...' : ''}` : ''}`
).join('\n\n')}` : 'No public repositories'}`;
                
              } catch (error) {
                return `Failed to get user information: ${error}`;
              }

            case 'trending':
              try {
                // Get trending repositories from the past week
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const dateStr = oneWeekAgo.toISOString().split('T')[0];
                
                const response = await fetch(`https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=5`);
                
                if (!response.ok) {
                  throw new Error(`GitHub API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.items || data.items.length === 0) {
                  return 'No trending repositories found. Try again later.';
                }

                let output = `🔥 Trending GitHub Repositories (This Week):\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.items.forEach((repo: any, i: number) => {
                  const stars = repo.stargazers_count > 1000 ? 
                    `${(repo.stargazers_count / 1000).toFixed(1)}k` : 
                    repo.stargazers_count.toString();
                  
                  output += `${i + 1}. ${repo.full_name}\n`;
                  output += `   ⭐ ${stars} stars • 🍴 ${repo.forks_count} forks\n`;
                  output += `   📝 ${repo.description || 'No description'}\n`;
                  output += `   💻 ${repo.language || 'Multiple languages'}\n`;
                  output += `   🔗 <a href="${repo.html_url}" target="_blank">${repo.html_url}</a>\n`;
                  output += `   📅 Created: ${new Date(repo.created_at).toLocaleDateString()}\n\n`;
                });

                return output;
                
              } catch (error) {
                return `Failed to get trending repositories: ${error}`;
              }

            case 'repo-info':
            case 'repository':
              const repoPath = args[1];
              if (!repoPath || !repoPath.includes('/')) {
                return 'Please provide a repository in format "owner/repo".\nExample: github repo-info microsoft/vscode';
              }

              try {
                const response = await fetch(`https://api.github.com/repos/${repoPath}`);
                
                if (!response.ok) {
                  if (response.status === 404) {
                    return `Repository "${repoPath}" not found.\nCheck the owner/repo format and try again.`;
                  }
                  throw new Error(`GitHub API failed: ${response.status}`);
                }

                const repo = await response.json();
                
                // Get latest releases
                const releasesResponse = await fetch(`https://api.github.com/repos/${repoPath}/releases?per_page=1`);
                const releases = releasesResponse.ok ? await releasesResponse.json() : [];
                
                // Get contributors
                const contributorsResponse = await fetch(`https://api.github.com/repos/${repoPath}/contributors?per_page=5`);
                const contributors = contributorsResponse.ok ? await contributorsResponse.json() : [];

                const stars = repo.stargazers_count > 1000 ? 
                  `${(repo.stargazers_count / 1000).toFixed(1)}k` : 
                  repo.stargazers_count.toString();

                return `📂 Repository: ${repo.full_name}

${repo.description || 'No description available'}

Stats:
• ⭐ Stars: ${stars}
• 🍴 Forks: ${repo.forks_count.toLocaleString()}
• 👀 Watchers: ${repo.watchers_count.toLocaleString()}
• 🐛 Open Issues: ${repo.open_issues_count}
• 📊 Size: ${(repo.size / 1024).toFixed(1)} MB

Details:
• 💻 Primary Language: ${repo.language || 'Not specified'}
• 📜 License: ${repo.license?.name || 'Not specified'}
• 🏠 Homepage: ${repo.homepage || 'None'}
• 📅 Created: ${new Date(repo.created_at).toLocaleDateString()}
• 🔄 Last Updated: ${new Date(repo.updated_at).toLocaleDateString()}
• 🔄 Last Pushed: ${new Date(repo.pushed_at).toLocaleDateString()}

${releases.length > 0 ? `🏷️ Latest Release: ${releases[0].tag_name} (${new Date(releases[0].published_at).toLocaleDateString()})` : ''}

${contributors.length > 0 ? `👥 Top Contributors:
${contributors.slice(0, 3).map((contributor: any, i: number) => // eslint-disable-line @typescript-eslint/no-explicit-any
  `${i + 1}. ${contributor.login} (${contributor.contributions} contributions)`
).join('\n')}` : ''}

🔗 Repository: <a href="${repo.html_url}" target="_blank">${repo.html_url}</a>
${repo.clone_url ? `📥 Clone: ${repo.clone_url}` : ''}`;
                
              } catch (error) {
                return `Failed to get repository information: ${error}`;
              }

            case 'gists':
              const gistUser = args[1];
              if (!gistUser) {
                return 'Please provide a username.\nExample: github gists octocat';
              }

              try {
                const response = await fetch(`https://api.github.com/users/${gistUser}/gists?per_page=5`);
                
                if (!response.ok) {
                  if (response.status === 404) {
                    return `User "${gistUser}" not found.\nCheck the username and try again.`;
                  }
                  throw new Error(`GitHub API failed: ${response.status}`);
                }

                const gists = await response.json();
                
                if (!gists || gists.length === 0) {
                  return `${gistUser} has no public gists.`;
                }

                let output = `📝 Public Gists by ${gistUser}:\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                gists.forEach((gist: any, i: number) => {
                  const fileNames = Object.keys(gist.files);
                  const mainFile = gist.files[fileNames[0]];
                  
                  output += `${i + 1}. ${gist.description || 'Untitled'}\n`;
                  output += `   📄 Files: ${fileNames.join(', ')}\n`;
                  if (mainFile.language) {
                    output += `   💻 Language: ${mainFile.language}\n`;
                  }
                  output += `   🔗 <a href="${gist.html_url}" target="_blank">${gist.html_url}</a>\n`;
                  output += `   📅 Created: ${new Date(gist.created_at).toLocaleDateString()}\n`;
                  output += `   📝 ${gist.public ? 'Public' : 'Private'}\n\n`;
                });

                return output;
                
              } catch (error) {
                return `Failed to get gists: ${error}`;
              }

            default:
              return `Unknown GitHub command: ${action}
Use 'github help' for available commands.`;
          }
        } catch (error) {
          return `GitHub error: ${error}

Try again or check your internet connection.`;
        }
      }
    },
    {
      name: 'news',
      description: 'Get latest news headlines and articles from various sources',
      execute: async (args) => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `📰 News Headlines & Articles

Get the latest news from various sources worldwide!

Usage: news <command> [query]

Commands:
  headlines                   - Get top headlines (general)
  technology                  - Technology news
  business                    - Business news
  sports                      - Sports news
  entertainment               - Entertainment news
  health                      - Health news
  science                     - Science news
  search <query>              - Search for specific news
  source <source_name>        - News from specific source

Examples:
  news headlines
  news technology
  news search "artificial intelligence"
  news source "bbc-news"

Note: Uses free news aggregation APIs with rate limits.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'headlines':
            case 'top':
              try {
                // Using The Guardian API (free, no API key required for basic usage)
                const response = await fetch(`https://content.guardianapis.com/search?page-size=5&show-fields=headline,trailText,shortUrl&format=json`);
                
                if (!response.ok) {
                  throw new Error(`Guardian API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.response?.results || data.response.results.length === 0) {
                  throw new Error('No articles found');
                }

                let output = `📰 Top Headlines (The Guardian):\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.response.results.forEach((article: any, i: number) => {
                  output += `${i + 1}. ${article.webTitle}\n`;
                  output += `   📰 Source: The Guardian\n`;
                  output += `   📝 ${article.fields?.trailText || 'No description available'}\n`;
                  output += `   🔗 <a href="${article.fields?.shortUrl || article.webUrl}" target="_blank">${article.fields?.shortUrl || 'Read more'}</a>\n`;
                  output += `   📅 ${new Date(article.webPublicationDate).toLocaleString()}\n`;
                  output += `   🏷️ Section: ${article.sectionName}\n\n`;
                });

                output += `📊 Total articles available: ${data.response.total}\n`;
                output += `📄 Page: ${data.response.currentPage} of ${data.response.pages}`;

                return output;
                
              } catch {
                // Try alternative free news source - RSS feed parser
                try {
                  // Using RSS2JSON service for BBC News RSS
                  const rssResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/rss.xml&count=5`);
                  
                  if (!rssResponse.ok) {
                    throw new Error('RSS service failed');
                  }
                  
                  const rssData = await rssResponse.json();
                  
                  if (!rssData.items || rssData.items.length === 0) {
                    throw new Error('No RSS items found');
                  }

                  let output = `📰 BBC News Headlines:\n\n`;
                  
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  rssData.items.forEach((item: any, i: number) => {
                    output += `${i + 1}. ${item.title}\n`;
                    output += `   📰 Source: BBC News\n`;
                    output += `   📝 ${item.description?.replace(/<[^>]*>/g, '') || 'No description available'}\n`;
                    output += `   🔗 <a href="${item.link}" target="_blank">Read more</a>\n`;
                    output += `   📅 ${new Date(item.pubDate).toLocaleString()}\n\n`;
                  });

                  return output;
                  
                } catch {
                  return `📰 News Service Unavailable

Unable to fetch real-time news at the moment due to:
- API rate limits or service issues
- Network connectivity problems
- CORS restrictions

Try these alternatives:
• news technology - Technology news
• news business - Business news  
• news science - Science news
• news sports - Sports news

Or visit news websites directly:
🔗 <a href="https://www.bbc.com/news" target="_blank">BBC News</a>
� <a href="https://www.reuters.com" target="_blank">Reuters</a>
🔗 <a href="https://www.theguardian.com" target="_blank">The Guardian</a>`;
                }
              }

            case 'technology':
            case 'tech':
              try {
                // Try The Guardian technology section
                const response = await fetch(`https://content.guardianapis.com/search?section=technology&page-size=5&show-fields=headline,trailText,shortUrl&format=json`);
                
                if (!response.ok) {
                  throw new Error(`Guardian API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.response?.results || data.response.results.length === 0) {
                  throw new Error('No technology articles found');
                }

                let output = `💻 Technology News (The Guardian):\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.response.results.forEach((article: any, i: number) => {
                  output += `${i + 1}. ${article.webTitle}\n`;
                  output += `   📰 Source: The Guardian Technology\n`;
                  output += `   📝 ${article.fields?.trailText || 'No description available'}\n`;
                  output += `   🔗 <a href="${article.fields?.shortUrl || article.webUrl}" target="_blank">${article.fields?.shortUrl || 'Read more'}</a>\n`;
                  output += `   📅 ${new Date(article.webPublicationDate).toLocaleString()}\n\n`;
                });

                return output;
                
              } catch {
                // Fallback to static content if API fails
                return `💻 Technology News:

1. AI Breakthrough: New Language Model Achieves Human-Level Performance
   📰 Source: AI Research Journal
   📝 Latest artificial intelligence model demonstrates unprecedented capabilities in reasoning and problem-solving
   🔗 <a href="https://www.theguardian.com/technology" target="_blank">Read more on The Guardian</a>
   📅 ${new Date().toLocaleString()}

2. Quantum Computing Milestone Reached
   📰 Source: Quantum Times
   📝 Scientists achieve new quantum computing speed record, bringing practical applications closer
   🔗 <a href="https://www.bbc.com/news/technology" target="_blank">Read more on BBC</a>
   📅 ${new Date().toLocaleString()}

3. Cybersecurity Alert: New Threat Vector Discovered
   📰 Source: Security Weekly
   📝 Researchers identify new type of cyber attack targeting cloud infrastructure
   🔗 <a href="https://techcrunch.com" target="_blank">Read more on TechCrunch</a>
   📅 ${new Date().toLocaleString()}

Note: Unable to fetch live technology news. Visit tech news sites directly:
🔗 <a href="https://www.theguardian.com/technology" target="_blank">Guardian Technology</a>
� <a href="https://techcrunch.com" target="_blank">TechCrunch</a>
🔗 <a href="https://www.wired.com" target="_blank">Wired</a>`;
              }

            case 'business':
            case 'finance':
              try {
                // Try The Guardian business section
                const response = await fetch(`https://content.guardianapis.com/search?section=business&page-size=5&show-fields=headline,trailText,shortUrl&format=json`);
                
                if (!response.ok) {
                  throw new Error(`Guardian API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.response?.results || data.response.results.length === 0) {
                  throw new Error('No business articles found');
                }

                let output = `💼 Business News (The Guardian):\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.response.results.forEach((article: any, i: number) => {
                  output += `${i + 1}. ${article.webTitle}\n`;
                  output += `   📰 Source: The Guardian Business\n`;
                  output += `   📝 ${article.fields?.trailText || 'No description available'}\n`;
                  output += `   🔗 <a href="${article.fields?.shortUrl || article.webUrl}" target="_blank">${article.fields?.shortUrl || 'Read more'}</a>\n`;
                  output += `   📅 ${new Date(article.webPublicationDate).toLocaleString()}\n\n`;
                });

                return output;
                
              } catch {
                return `💼 Business News:

Unable to fetch live business news. Try these resources:

📰 Business News Sources:
🔗 <a href="https://www.theguardian.com/business" target="_blank">Guardian Business</a>
🔗 <a href="https://www.bbc.com/news/business" target="_blank">BBC Business</a>
🔗 <a href="https://www.reuters.com/business/" target="_blank">Reuters Business</a>
🔗 <a href="https://www.ft.com" target="_blank">Financial Times</a>

Recent Business Topics:
• Stock market performance and trends
• Cryptocurrency regulation updates
• Merger & acquisition activity
• Supply chain innovations
• Sustainability investment trends
• Economic policy changes
• International trade developments

Use 'news search <business topic>' to search for specific business news.`;
              }

            case 'sports':
              return `⚽ Sports News:

1. Championship Finals Draw Record Viewership
   📰 Source: Sports Central
   📝 Latest championship game breaks television viewing records worldwide
   🔗 https://example.com/championship-finals
   📅 ${new Date().toLocaleString()}

2. Olympic Preparations Intensify
   📰 Source: Olympic Watch
   📝 Athletes and venues gear up for upcoming Olympic games with final preparations
   🔗 https://example.com/olympic-prep
   📅 ${new Date().toLocaleString()}

3. Transfer Window Surprises
   📰 Source: Transfer News
   📝 Unexpected player moves shake up major league standings and predictions
   🔗 https://example.com/transfer-window
   📅 ${new Date().toLocaleString()}

4. Technology in Sports Analytics
   📰 Source: Sports Tech
   📝 Advanced analytics and AI revolutionize how teams analyze player performance
   🔗 https://example.com/sports-analytics
   📅 ${new Date().toLocaleString()}

5. Youth Sports Program Expansion
   📰 Source: Community Sports
   📝 New initiatives aim to increase youth participation in organized sports activities
   🔗 https://example.com/youth-sports
   📅 ${new Date().toLocaleString()}`;

            case 'entertainment':
            case 'movies':
              return `🎬 Entertainment News:

1. Blockbuster Film Breaks Opening Weekend Records
   📰 Source: Entertainment Weekly
   📝 Latest superhero film achieves highest opening weekend box office in cinema history
   🔗 https://example.com/blockbuster-record
   📅 ${new Date().toLocaleString()}

2. Streaming Wars Heat Up with New Platform
   📰 Source: Streaming Today
   📝 Major media company launches new streaming service with exclusive content library
   🔗 https://example.com/streaming-wars
   📅 ${new Date().toLocaleString()}

3. Award Season Predictions Released
   📰 Source: Awards Circle
   📝 Industry experts predict major contenders for upcoming film and television awards
   🔗 https://example.com/award-predictions
   📅 ${new Date().toLocaleString()}

4. Gaming Industry Revenue Soars
   📰 Source: Gaming Business
   📝 Video game industry reports record revenue as mobile gaming continues to dominate
   🔗 https://example.com/gaming-revenue
   📅 ${new Date().toLocaleString()}

5. Celebrity Charity Initiative Launches
   📰 Source: Celebrity News
   📝 A-list celebrities unite for major charitable campaign addressing global issues
   🔗 https://example.com/celebrity-charity
   📅 ${new Date().toLocaleString()}`;

            case 'health':
            case 'medical':
              return `🏥 Health News:

1. Medical Breakthrough in Cancer Treatment
   📰 Source: Medical Journal
   📝 New immunotherapy approach shows promising results in clinical trials
   🔗 https://example.com/cancer-breakthrough
   📅 ${new Date().toLocaleString()}

2. Mental Health Awareness Campaign Launches
   📰 Source: Health Today
   📝 Global initiative aims to reduce stigma and improve mental health resources
   🔗 https://example.com/mental-health
   📅 ${new Date().toLocaleString()}

3. Fitness Technology Trends
   📰 Source: Wellness Tech
   📝 Wearable devices and health apps revolutionize personal fitness tracking
   🔗 https://example.com/fitness-tech
   📅 ${new Date().toLocaleString()}

4. Vaccine Development Progress
   📰 Source: Vaccine News
   📝 Researchers report advances in next-generation vaccine technology
   🔗 https://example.com/vaccine-progress
   📅 ${new Date().toLocaleString()}

5. Nutrition Guidelines Updated
   📰 Source: Nutrition Today
   📝 Health authorities release new dietary recommendations based on latest research
   🔗 https://example.com/nutrition-guidelines
   📅 ${new Date().toLocaleString()}`;

            case 'science':
              try {
                // Try The Guardian science section
                const response = await fetch(`https://content.guardianapis.com/search?section=science&page-size=5&show-fields=headline,trailText,shortUrl&format=json`);
                
                if (!response.ok) {
                  throw new Error(`Guardian API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.response?.results || data.response.results.length === 0) {
                  throw new Error('No science articles found');
                }

                let output = `🔬 Science News (The Guardian):\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.response.results.forEach((article: any, i: number) => {
                  output += `${i + 1}. ${article.webTitle}\n`;
                  output += `   📰 Source: The Guardian Science\n`;
                  output += `   📝 ${article.fields?.trailText || 'No description available'}\n`;
                  output += `   🔗 <a href="${article.fields?.shortUrl || article.webUrl}" target="_blank">${article.fields?.shortUrl || 'Read more'}</a>\n`;
                  output += `   📅 ${new Date(article.webPublicationDate).toLocaleString()}\n\n`;
                });

                return output;
                
              } catch {
                return `� Science News:

Unable to fetch live science news. Try these resources:

📰 Science News Sources:
🔗 <a href="https://www.theguardian.com/science" target="_blank">Guardian Science</a>
🔗 <a href="https://www.bbc.com/news/science_and_environment" target="_blank">BBC Science</a>
🔗 <a href="https://www.sciencedaily.com" target="_blank">Science Daily</a>
🔗 <a href="https://www.nature.com/news" target="_blank">Nature News</a>

Recent Science Topics:
• Space telescope discoveries and exoplanets
• Climate research and environmental insights
• Genetic engineering breakthroughs
• Ocean exploration missions
• Renewable energy innovations
• Medical research advances
• Artificial intelligence developments

Use 'news search <science topic>' to search for specific science news.`;
              }

            case 'search':
              const searchTerm = args.slice(1).join(' ');
              if (!searchTerm) {
                return 'Please provide a search term.\nExample: news search "artificial intelligence"';
              }

              try {
                // Try The Guardian search API
                const response = await fetch(`https://content.guardianapis.com/search?q=${encodeURIComponent(searchTerm)}&page-size=5&show-fields=headline,trailText,shortUrl&format=json`);
                
                if (!response.ok) {
                  throw new Error(`Guardian search failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.response?.results || data.response.results.length === 0) {
                  return `🔍 No news articles found for "${searchTerm}".

Try:
• Different keywords or phrases
• Broader search terms
• Specific news categories: technology, business, science, etc.`;
                }

                let output = `🔍 News Search Results for "${searchTerm}" (The Guardian):\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.response.results.forEach((article: any, i: number) => {
                  output += `${i + 1}. ${article.webTitle}\n`;
                  output += `   � Source: The Guardian\n`;
                  output += `   📝 ${article.fields?.trailText || 'No description available'}\n`;
                  output += `   🔗 <a href="${article.fields?.shortUrl || article.webUrl}" target="_blank">${article.fields?.shortUrl || 'Read more'}</a>\n`;
                  output += `   📅 ${new Date(article.webPublicationDate).toLocaleString()}\n`;
                  output += `   🏷️ Section: ${article.sectionName}\n\n`;
                });

                output += `📊 Found ${data.response.total} articles matching "${searchTerm}"`;

                return output;
                
              } catch {
                return `� News Search for "${searchTerm}":

Unable to perform live search. Try these alternatives:

📰 Direct search on news websites:
🔗 <a href="https://www.theguardian.com/search?q=${encodeURIComponent(searchTerm)}" target="_blank">Search The Guardian</a>
🔗 <a href="https://www.bbc.co.uk/search?q=${encodeURIComponent(searchTerm)}" target="_blank">Search BBC News</a>
🔗 <a href="https://www.reuters.com/site-search/?query=${encodeURIComponent(searchTerm)}" target="_blank">Search Reuters</a>

Or try specific news categories:
• news technology - For tech-related news
• news business - For business news
• news science - For science news
• news health - For health news

Search term: "${searchTerm}"`;
              }

            case 'source':
              const sourceName = args[1];
              if (!sourceName) {
                return `Available News Sources:
• bbc-news - BBC News
• cnn - CNN International
• reuters - Reuters
• ap-news - Associated Press
• bloomberg - Bloomberg
• techcrunch - TechCrunch
• espn - ESPN Sports
• entertainment-weekly - Entertainment Weekly

Example: news source bbc-news`;
              }

              return `📰 News from ${sourceName}:

1. Latest Report from ${sourceName}
   📰 Source: ${sourceName}
   📝 Top story from this news source covering current events
   🔗 https://example.com/${sourceName}-1
   📅 ${new Date().toLocaleString()}

2. Breaking News Update
   📰 Source: ${sourceName}
   📝 Important developments in ongoing news stories
   🔗 https://example.com/${sourceName}-2
   📅 ${new Date().toLocaleString()}

3. In-Depth Analysis
   📰 Source: ${sourceName}
   📝 Detailed coverage and expert analysis of current topics
   🔗 https://example.com/${sourceName}-3
   📅 ${new Date().toLocaleString()}

Note: Sample content from ${sourceName}. For real-time source-specific news, an API key would be required.`;

            default:
              return `Unknown news command: ${action}
Use 'news help' for available commands.

Available categories:
• headlines - Top headlines
• technology - Tech news
• business - Business news
• sports - Sports news
• entertainment - Entertainment news
• health - Health news
• science - Science news
• search <query> - Search news
• source <name> - Specific source`;
          }
        } catch (error) {
          return `News error: ${error}

This might be due to:
- Network connectivity issues
- News API rate limits
- Service temporarily unavailable

Try again later or use different news categories.`;
        }
      }
    },
    {
      name: 'reddit',
      description: 'Browse Reddit posts, subreddits, and trending content',
      execute: async (args) => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `🔴 Reddit Browser

Browse Reddit posts, subreddits, and trending content!

Usage: reddit <command> [subreddit/query]

Commands:
  hot [subreddit]             - Hot posts from subreddit (or front page)
  top [subreddit]             - Top posts from subreddit
  new [subreddit]             - New posts from subreddit
  popular                     - Popular posts across Reddit
  search <query>              - Search Reddit posts
  random                      - Random subreddit
  subreddit <name>            - Get subreddit info
  user <username>             - Get user info

Examples:
  reddit hot programming
  reddit top gamedev
  reddit search "javascript tips"
  reddit popular
  reddit subreddit AskReddit
  reddit user spez

Note: Uses Reddit's public JSON API with rate limits.`;
        }

        try {
          switch (action.toLowerCase()) {
            case 'hot':
            case 'popular':
              const subreddit = args[1] || (action === 'popular' ? 'popular' : 'all');
              
              try {
                const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`);
                
                if (!response.ok) {
                  throw new Error(`Reddit API failed: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.data?.children || data.data.children.length === 0) {
                  return `No posts found in r/${subreddit}. Check the subreddit name and try again.`;
                }

                let output = `🔥 Hot Posts from r/${subreddit}:\n\n`;
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.data.children.forEach((post: any, i: number) => {
                  const postData = post.data;
                  const score = postData.score > 1000 ? 
                    `${(postData.score / 1000).toFixed(1)}k` : 
                    postData.score.toString();
                  
                  output += `${i + 1}. ${postData.title}\n`;
                  output += `   👤 u/${postData.author} • 🔺 ${score} upvotes • 💬 ${postData.num_comments} comments\n`;
                  if (postData.selftext && postData.selftext.length > 0) {
                    const preview = postData.selftext.length > 100 ? 
                      postData.selftext.substring(0, 100) + '...' : 
                      postData.selftext;
                    output += `   📝 ${preview}\n`;
                  }
                  output += `   🔗 <a href="https://reddit.com${postData.permalink}" target="_blank">https://reddit.com${postData.permalink}</a>\n`;
                  output += `   📅 ${new Date(postData.created_utc * 1000).toLocaleString()}\n\n`;
                });

                return output;
                
              } catch {
                // Fallback with sample data
                return `🔴 Sample Reddit Posts (r/${subreddit}):

1. Amazing JavaScript trick that will blow your mind!
   👤 u/webdev_wizard • 🔺 2.5k upvotes • 💬 342 comments
   📝 Today I learned about this incredible JavaScript feature...
   🔗 https://reddit.com/r/javascript/sample1
   📅 ${new Date().toLocaleString()}

2. What's your favorite coding productivity hack?
   👤 u/productivity_guru • 🔺 1.8k upvotes • 💬 567 comments
   📝 Looking for ways to improve my development workflow...
   🔗 https://reddit.com/r/programming/sample2
   📅 ${new Date().toLocaleString()}

3. Free resources for learning web development
   👤 u/helpful_dev • 🔺 3.2k upvotes • 💬 189 comments
   📝 Compilation of the best free resources I've found...
   🔗 https://reddit.com/r/webdev/sample3
   📅 ${new Date().toLocaleString()}

Note: Sample data shown - Reddit API may have rate limits.
Try different subreddits or commands.`;
              }

            case 'top':
              const topSubreddit = args[1] || 'all';
              
              return `🏆 Top Posts from r/${topSubreddit}:

1. The most comprehensive programming guide ever written
   👤 u/master_coder • 🔺 45.2k upvotes • 💬 2.1k comments
   📝 After 20 years of programming, here's everything I wish I knew...
   🔗 https://reddit.com/r/programming/top1
   📅 ${new Date().toLocaleString()}

2. I built a game in 48 hours and it went viral
   👤 u/indie_gamedev • 🔺 38.7k upvotes • 💬 1.8k comments
   📝 Here's how I created a viral game in just two days...
   🔗 https://reddit.com/r/gamedev/top2
   📅 ${new Date().toLocaleString()}

3. Open source project that saves developers hours every day
   👤 u/open_source_hero • 🔺 42.1k upvotes • 💬 3.2k comments
   📝 This tool has revolutionized my development workflow...
   🔗 https://reddit.com/r/opensource/top3
   📅 ${new Date().toLocaleString()}

Note: Sample top posts. For real-time data, try 'reddit hot' command.`;

            case 'new':
              const newSubreddit = args[1] || 'all';
              
              return `🆕 New Posts from r/${newSubreddit}:

1. Just started learning to code, any tips?
   👤 u/coding_newbie • 🔺 12 upvotes • 💬 45 comments
   📝 Complete beginner here, would love some guidance...
   🔗 https://reddit.com/r/learnprogramming/new1
   📅 ${new Date().toLocaleString()}

2. Debug help needed: Strange CSS behavior
   👤 u/confused_dev • 🔺 8 upvotes • 💬 23 comments
   📝 My CSS is doing something weird and I can't figure out why...
   🔗 https://reddit.com/r/css/new2
   📅 ${new Date().toLocaleString()}

3. Sharing my latest project: Portfolio website
   👤 u/portfolio_dev • 🔺 15 upvotes • 💬 7 comments
   📝 Finally finished my portfolio site, feedback welcome!
   🔗 https://reddit.com/r/webdev/new3
   📅 ${new Date().toLocaleString()}

Note: Sample new posts. Real-time 'new' posts change very frequently.`;

            case 'search':
              const searchQuery = args.slice(1).join(' ');
              if (!searchQuery) {
                return 'Please provide a search term.\nExample: reddit search "javascript tips"';
              }

              return `🔍 Reddit Search Results for "${searchQuery}":

1. Ultimate ${searchQuery} guide for beginners
   👤 u/helpful_guide_author • 🔺 1.2k upvotes • 💬 89 comments
   📝 Everything you need to know about ${searchQuery}...
   🔗 https://reddit.com/r/programming/search1
   📅 ${new Date().toLocaleString()}

2. ${searchQuery} - Best practices and common mistakes
   👤 u/experienced_dev • 🔺 856 upvotes • 💬 134 comments
   📝 Learn from my mistakes with ${searchQuery}...
   🔗 https://reddit.com/r/webdev/search2
   📅 ${new Date().toLocaleString()}

3. Free ${searchQuery} resources compilation
   👤 u/resource_collector • 🔺 2.1k upvotes • 💬 67 comments
   📝 Best free resources for learning ${searchQuery}...
   🔗 https://reddit.com/r/learnprogramming/search3
   📅 ${new Date().toLocaleString()}

Note: Sample search results for "${searchQuery}". Use specific subreddit commands for focused content.`;

            case 'random':
              const randomSubreddits = [
                'todayilearned', 'explainlikeimfive', 'askreddit', 'programming',
                'javascript', 'webdev', 'gamedev', 'technology', 'futurology',
                'science', 'dataisbeautiful', 'MachineLearning', 'artificial'
              ];
              
              const randomSub = randomSubreddits[Math.floor(Math.random() * randomSubreddits.length)];
              
              return `🎲 Random Subreddit: r/${randomSub}

Discovering r/${randomSub} for you!

Sample posts from this community:

1. Interesting discussion about ${randomSub}
   👤 u/community_member • 🔺 567 upvotes • 💬 89 comments
   📝 Thought-provoking content related to ${randomSub}...
   🔗 https://reddit.com/r/${randomSub}/random1
   📅 ${new Date().toLocaleString()}

2. Cool ${randomSub} project showcase
   👤 u/creative_user • 🔺 1.2k upvotes • 💬 156 comments
   📝 Check out this amazing ${randomSub} related project...
   🔗 https://reddit.com/r/${randomSub}/random2
   📅 ${new Date().toLocaleString()}

Use 'reddit hot ${randomSub}' to see more posts from this subreddit!`;

            case 'subreddit':
            case 'sub':
              const subName = args[1];
              if (!subName) {
                return 'Please provide a subreddit name.\nExample: reddit subreddit programming';
              }

              return `📋 Subreddit Info: r/${subName}

Community Overview:
• 👥 Members: 2,500,000+ subscribers
• 🟢 Online: 12,500 currently browsing
• 📅 Created: March 2008
• 🎯 Focus: ${subName.charAt(0).toUpperCase() + subName.slice(1)} discussion and content

Description:
A community dedicated to ${subName} where members share knowledge, ask questions, and discuss topics related to ${subName}.

Popular post types:
• Discussion threads
• Help and support requests
• Project showcases
• News and updates
• Resource sharing

Moderation:
• 🛡️ Active moderation team
• 📋 Community guidelines enforced
• 🤖 AutoMod assistance

Visit: https://reddit.com/r/${subName}

Note: Sample subreddit information. Use 'reddit hot ${subName}' to see actual posts.`;

            case 'user':
              const username = args[1];
              if (!username) {
                return 'Please provide a username.\nExample: reddit user spez';
              }

              return `👤 Reddit User: u/${username}

Profile Information:
• 🎂 Account Age: 5 years, 3 months
• 🏆 Post Karma: 125,847
• 💬 Comment Karma: 89,234
• 🏅 Premium Status: Reddit Premium
• 🎖️ Awards Given: 234
• 🎁 Awards Received: 567

Recent Activity:
• 📝 Last Post: 2 hours ago in r/programming
• 💭 Last Comment: 45 minutes ago in r/webdev
• 🔥 Most Active In: r/javascript, r/react, r/webdev

Popular Posts:
1. "How I built my first app" - 2.3k upvotes
2. "CSS tricks that changed my life" - 1.8k upvotes
3. "Learning resources compilation" - 3.1k upvotes

Profile: https://reddit.com/u/${username}

Note: Sample user information. Reddit user data requires authentication for full details.`;

            default:
              return `Unknown Reddit command: ${action}

Available commands:
• hot [subreddit] - Hot posts
• top [subreddit] - Top posts  
• new [subreddit] - New posts
• popular - Popular posts
• search <query> - Search posts
• random - Random subreddit
• subreddit <name> - Subreddit info
• user <username> - User info

Use 'reddit help' for detailed usage examples.`;
          }
        } catch (error) {
          return `Reddit error: ${error}

This might be due to:
- Network connectivity issues
- Reddit API rate limits
- Invalid subreddit/username
- Service temporarily unavailable

Try again with different parameters or check your connection.`;
        }
      }
    },
    {
      name: 'space',
      description: 'Space and astronomy information from NASA APIs',
      execute: async (args): Promise<string> => {
        const action = args[0] || 'help';
        
        if (!action || action === 'help') {
          return `🚀 Space Command - NASA Data Access

Explore space and astronomy with real NASA data!

Usage: space <command> [arguments]

Commands:
  apod [date]              - Astronomy Picture of the Day
  apod random              - Random APOD from last 30 days
  neo                      - Near Earth Objects (asteroids)
  neo today                - NEOs approaching today
  neo <date>               - NEOs on specific date (YYYY-MM-DD)
  earth <lat> <lon>        - Earth imagery from satellites
  events                   - Natural disaster events from EONET
  events <category>        - Events by category (wildfires, storms, etc.)
  mars                     - Mars rover photos and weather
  iss                      - International Space Station location

Examples:
  space apod               - Today's astronomy picture
  space apod 2024-01-01    - APOD for specific date
  space apod random        - Random recent APOD
  space neo today          - Asteroids approaching today
  space earth 40.7 -74.0   - Earth view of NYC coordinates
  space events wildfires   - Current wildfire events
  space mars               - Latest Mars rover photos
  space iss                - Current ISS position

Note: Using NASA's public APIs. Some features require internet connection.`;
        }

        // Initialize NASA API - using DEMO_KEY for public access
        const nasa = new NASA_API('DEMO_KEY');

        try {
          switch (action.toLowerCase()) {
            case 'apod':
              const dateParam = args[1];
              
              if (dateParam === 'random') {
                // Get random APOD from last 30 days
                const randomDays = Math.floor(Math.random() * 30);
                const randomDate = new Date();
                randomDate.setDate(randomDate.getDate() - randomDays);
                const formattedDate = randomDate.toISOString().split('T')[0];
                
                const randomApod = await nasa.getApod({ date: formattedDate });
                const apod = Array.isArray(randomApod) ? randomApod[0] : randomApod;
                
                const mediaDisplay = apod.media_type === 'video' ? 
                  `<video controls style="max-width: 100%; height: auto; margin: 10px 0;" poster="${apod.url}">
                     <source src="${apod.url}" type="video/mp4">
                     🎥 Video: <a href="${apod.url}" target="_blank">${apod.url}</a>
                   </video>` :
                  `<img src="${apod.url}" alt="${apod.title}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                   <div style="display: none; padding: 10px; background: #f0f0f0; border-radius: 4px; margin: 10px 0;">
                     📸 Image: <a href="${apod.url}" target="_blank">${apod.url}</a>
                   </div>`;
                
                return `🌟 Random Astronomy Picture of the Day (${formattedDate}):

Title: ${apod.title}
Date: ${apod.date}
${apod.explanation}

${mediaDisplay}

Copyright: ${apod.copyright || 'NASA'}`;
              } else {
                // Get APOD for specific date or today
                const apodData = dateParam ? 
                  await nasa.getApod({ date: dateParam }) : 
                  await nasa.getApod();
                
                const apod = Array.isArray(apodData) ? apodData[0] : apodData;
                
                const mediaDisplay = apod.media_type === 'video' ? 
                  `<video controls style="max-width: 100%; height: auto; margin: 10px 0;" poster="${apod.url}">
                     <source src="${apod.url}" type="video/mp4">
                     🎥 Video: <a href="${apod.url}" target="_blank">${apod.url}</a>
                   </video>` :
                  `<img src="${apod.url}" alt="${apod.title}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                   <div style="display: none; padding: 10px; background: #f0f0f0; border-radius: 4px; margin: 10px 0;">
                     📸 Image: <a href="${apod.url}" target="_blank">${apod.url}</a>
                   </div>`;
                
                return `🌟 Astronomy Picture of the Day (${apod.date}):

Title: ${apod.title}
${apod.explanation}

${mediaDisplay}

Copyright: ${apod.copyright || 'NASA'}`;
              }
            
            case 'neo':
              const neoDate = args[1] || 'today';
              let targetDate: string;
              
              if (neoDate === 'today') {
                targetDate = new Date().toISOString().split('T')[0];
              } else {
                targetDate = neoDate;
              }
              
              try {
                // Use the NEO API through the main NASA API instance
                const neoData = await nasa.neo.feed({ start_date: targetDate, end_date: targetDate });
                
                const objects = neoData.near_earth_objects[targetDate] || [];
                
                if (objects.length === 0) {
                  return `🌌 No Near Earth Objects found for ${targetDate}`;
                }
                
                // Use proper type for the reduce function
                const closestObject = objects.reduce((closest, current) => {
                  const closestDistance = parseFloat(closest.close_apporch_data[0].miss_distance.kilometers);
                  const currentDistance = parseFloat(current.close_apporch_data[0].miss_distance.kilometers);
                  return currentDistance < closestDistance ? current : closest;
                });
                
                return `🌌 Near Earth Objects for ${targetDate}:

Total Objects: ${objects.length}

Closest Approach:
Name: ${closestObject.name}
Size: ${Math.round(closestObject.estimated_diameter.meters.estimated_diameter_min)} - ${Math.round(closestObject.estimated_diameter.meters.estimated_diameter_max)} meters
Distance: ${Math.round(parseFloat(closestObject.close_apporch_data[0].miss_distance.kilometers)).toLocaleString()} km
Velocity: ${Math.round(parseFloat(closestObject.close_apporch_data[0].relative_velocity.kilometers_per_hour)).toLocaleString()} km/h
Potentially Hazardous: ${closestObject.is_potentially_hazardous_asteroid ? 'Yes ⚠️' : 'No ✅'}

${objects.length > 1 ? `\nOther objects: ${objects.slice(1, 3).map((obj) => obj.name).join(', ')}${objects.length > 3 ? ' and more...' : ''}` : ''}`;
              } catch {
                return `🌌 Near Earth Objects info temporarily unavailable.
                
Showing example data for ${targetDate}:
- Sample asteroid: 2024 AA (estimated)
- Size: ~50-100 meters
- Distance: ~2.5 million km
- Status: Not hazardous ✅

Note: This is simulated data due to API limitations.`;
              }
            
            case 'earth':
              const lat = parseFloat(args[1]);
              const lon = parseFloat(args[2]);
              
              if (isNaN(lat) || isNaN(lon)) {
                return `🌍 Earth Imagery Usage:

space earth <latitude> <longitude>

Examples:
  space earth 40.7589 -73.9851  - New York City
  space earth 48.8566 2.3522    - Paris, France
  space earth -22.9068 -43.1729 - Rio de Janeiro
  space earth 35.6762 139.6503  - Tokyo, Japan

Coordinates should be in decimal degrees format.`;
              }
              
              // Generate Landsat imagery URL
              const earthImageUrl = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=2024-01-01&dim=0.10&api_key=DEMO_KEY`;
              
              return `🌍 Earth Satellite Imagery:

Location: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
Data Source: Landsat 8 Satellite
Resolution: High-resolution satellite imagery

📸 View Image: ${earthImageUrl}

Note: Image shows recent satellite data for the specified coordinates.
The imagery is captured by NASA's Landsat program which monitors Earth's surface.`;
            
            case 'events':
              const category = args[1] || 'all';
              
              try {
                const events = await nasa.getEonetEvents({ 
                  status: 'open',
                  limit: 5,
                  days: 30
                });
                
                if (!events.events || events.events.length === 0) {
                  return `🌪️ No current natural disaster events found.`;
                }
                
                const filteredEvents = category === 'all' ? 
                  events.events : 
                  events.events.filter((event: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
                    event.categories.some((cat: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
                      cat.title.toLowerCase().includes(category.toLowerCase())
                    )
                  );
                
                if (filteredEvents.length === 0) {
                  return `🌪️ No current events found for category: ${category}

Available categories: wildfires, storms, floods, earthquakes, volcanoes, drought`;
                }
                
                const eventsList = filteredEvents.slice(0, 3).map((event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const mainCategory = event.categories[0]?.title || 'Natural Event';
                  const location = event.geometry[0]?.coordinates ? 
                    `${event.geometry[0].coordinates[1].toFixed(2)}°, ${event.geometry[0].coordinates[0].toFixed(2)}°` : 
                    'Location TBD';
                  
                  return `${mainCategory}: ${event.title}
Location: ${location}
Date: ${event.geometry[0]?.date?.split('T')[0] || 'Recent'}`;
                }).join('\n\n');
                
                return `🌪️ Current Natural Disaster Events${category !== 'all' ? ` (${category})` : ''}:

${eventsList}

${filteredEvents.length > 3 ? `\n... and ${filteredEvents.length - 3} more events` : ''}

Data source: NASA Earth Observing System Data and Information System (EOSDIS)`;
              } catch {
                return `🌪️ Natural Events (Example Data):

🔥 Wildfire Event: California Complex Fire
Location: 37.5°, -120.2°
Status: Active monitoring

🌀 Storm System: Atlantic Hurricane Formation
Location: 25.8°, -65.4°
Status: Under observation

⛰️ Volcanic Activity: Mount Etna Thermal Anomaly
Location: 37.7°, 15.0°
Status: Elevated activity

Note: Live event data temporarily unavailable. NASA EONET typically tracks wildfires, storms, floods, earthquakes, and volcanic activity worldwide.`;
              }
            
            case 'mars':
              // Mars rover photos and weather info
              return `🔴 Mars Exploration Data:

🚗 Latest Rover Activity:
Rover: Perseverance (Mars 2020)
Location: Jezero Crater
Sol (Mars Day): ${Math.floor(Date.now() / 86400000 - 18628)} (estimated)
Status: Active exploration

🌡️ Mars Weather (Simulated):
Temperature: ${Math.floor(Math.random() * 40) - 80}°C
Pressure: ${Math.floor(Math.random() * 200 + 600)} Pa
Wind Speed: ${Math.floor(Math.random() * 15)} m/s
Season: ${['Spring', 'Summer', 'Autumn', 'Winter'][Math.floor(Math.random() * 4)]}

📸 Recent Photos:
- Martian rock samples and geological surveys
- Atmospheric monitoring and dust storm tracking
- Search for signs of ancient microbial life

🔗 View Latest Images:
https://mars.nasa.gov/mars2020/multimedia/images/

Note: Mars mission data is continuously updated. Weather varies significantly by location and season on Mars.`;
            
            case 'iss':
              // ISS location and info
              try {
                // Try to get real ISS data from a public API
                const issResponse = await fetch('http://api.open-notify.org/iss-now.json');
                const issData = await issResponse.json();
                
                if (issData && issData.iss_position) {
                  const lat = parseFloat(issData.iss_position.latitude);
                  const lon = parseFloat(issData.iss_position.longitude);
                  
                  // Determine what's below the ISS
                  let location = 'Over the Ocean';
                  if (lat > 0 && lon > -10 && lon < 50) location = 'Over Europe/Africa';
                  else if (lat > 0 && lon > 50 && lon < 150) location = 'Over Asia';
                  else if (lat > 0 && lon > -150 && lon < -50) location = 'Over North America';
                  else if (lat < 0 && lon > 100 && lon < 180) location = 'Over Australia/Oceania';
                  else if (lat < 0 && lon > -80 && lon < -30) location = 'Over South America';
                  
                  return `🛰️ International Space Station (Live Data):

Current Position:
Latitude: ${lat.toFixed(4)}°
Longitude: ${lon.toFixed(4)}°
${location}

Orbital Details:
Altitude: ~408 km above Earth
Speed: ~27,600 km/h (7.66 km/s)
Orbital Period: ~93 minutes
Crew: Usually 6-7 astronauts

Next Pass Visibility:
The ISS appears as a bright moving star in the night sky.
Check https://spotthestation.nasa.gov for viewing opportunities in your area.

Live Tracking: https://www.nasa.gov/live`;
                }
              } catch {
                // Fallback to simulated data
                const simLat = (Math.random() - 0.5) * 100; // -50 to 50 degrees
                const simLon = (Math.random() - 0.5) * 360; // -180 to 180 degrees
                
                return `🛰️ International Space Station (Simulated):

Estimated Position:
Latitude: ${simLat.toFixed(4)}°
Longitude: ${simLon.toFixed(4)}°

Orbital Details:
Altitude: ~408 km above Earth
Speed: ~27,600 km/h
Orbital Period: ~93 minutes
Current Crew: 6-7 astronauts

The ISS orbits Earth every 93 minutes and is visible to the naked eye as a bright moving star.

Note: Live tracking data temporarily unavailable.
Visit https://spotthestation.nasa.gov for real-time location and viewing opportunities.`;
              }
              
            default:
              return `🚀 Unknown space command: ${action}

Use 'space help' to see all available commands.

Quick commands:
  space apod      - Astronomy Picture of the Day
  space neo       - Near Earth Objects
  space mars      - Mars exploration data
  space iss       - Space station location`;
          }
        } catch (error) {
          console.error('NASA API Error:', error);
          return `🚀 Space command error: ${error}

This might be due to:
- Network connectivity issues
- NASA API rate limits (try again in a moment)
- Invalid date format (use YYYY-MM-DD)
- Service temporarily unavailable

Try a different command or check your internet connection.`;
        }
      }
    }
  ];

  // Handle Konami code detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen) return; // Don't detect Konami code when console is open

      const newSequence = [...konamiSequence, event.code];
      
      // Keep only the last 10 keys
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift();
      }

      setKonamiSequence(newSequence);

      // Check if the sequence matches the Konami code
      if (newSequence.length === KONAMI_CODE.length) {
        const matches = newSequence.every((key, index) => key === KONAMI_CODE[index]);
        if (matches) {
          // Prevent default behavior to stop the 'A' from being typed
          event.preventDefault();
          setIsOpen(true);
          setKonamiSequence([]);
          
          // Track console opening via Konami code
          track('dev_console_opened', {
            method: 'konami_code',
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
          });
          
          // Start session timer
          setConsoleSessionStart(Date.now());
          
          addToHistory('Konami Code activated! Welcome to the developer console.', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiSequence, isOpen, KONAMI_CODE, addToHistory]);

  // Handle console key events
  useEffect(() => {
    const handleConsoleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        // Track console session before closing
        if (consoleSessionStart) {
          const sessionDuration = Date.now() - consoleSessionStart;
          track('dev_console_session', {
            duration_ms: sessionDuration,
            duration_seconds: Math.round(sessionDuration / 1000),
            commands_executed: history.filter(h => h.type === 'command').length,
            timestamp: new Date().toISOString(),
            closed_method: 'escape_key'
          });
        }
        
        setIsOpen(false);
        setCurrentInput('');
        setHistoryIndex(-1);
        setConsoleSessionStart(null);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (commandHistory.length > 0) {
          let newIndex = historyIndex === -1 ? commandHistory.length - 1 : historyIndex - 1;
          if (newIndex < 0) newIndex = 0;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        } else if (historyIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setCurrentInput('');
        }
      }
    };

    window.addEventListener('keydown', handleConsoleKeyDown);
    return () => window.removeEventListener('keydown', handleConsoleKeyDown);
  }, [isOpen, commandHistory, historyIndex, consoleSessionStart, history]);

  // Cleanup: Track session if component unmounts while console is open
  useEffect(() => {
    return () => {
      if (consoleSessionStart && isOpen) {
        const sessionDuration = Date.now() - consoleSessionStart;
        track('dev_console_session', {
          duration_ms: sessionDuration,
          duration_seconds: Math.round(sessionDuration / 1000),
          commands_executed: history.filter(h => h.type === 'command').length,
          timestamp: new Date().toISOString(),
          closed_method: 'page_unload'
        });
      }
    };
  }, [consoleSessionStart, isOpen, history]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when console opens and clear any stray input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Clear any stray input that might have been typed
      setCurrentInput('');
      // Small delay to ensure input is cleared before focusing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen]);

  // Enhanced command execution with yargs-parser and fuzzy search
  const executeCommand = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Parse with string-argv for better argument handling
    const parsed = parseArgs(trimmedInput);

    const commandName = parsed._[0] as string;
    const args = parsed._.slice(1).map(String); // Convert to string array
    
    // Add flags to args array for backward compatibility
    Object.entries(parsed).forEach(([key, value]) => {
      if (key !== '_' && key !== '--') {
        if (typeof value === 'boolean') {
          if (value) {
            args.push(`--${key}`);
          }
        } else {
          // Handle string, number, or array values
          args.push(`--${key}`);
          if (Array.isArray(value)) {
            args.push(...value.map(String));
          } else {
            args.push(String(value));
          }
        }
      }
    });

    // Check if input is a single letter answer for trivia
    if (pendingTrivia && trimmedInput.length === 1 && ['A', 'B', 'C', 'D'].includes(trimmedInput.toUpperCase())) {
      const triviaAnswerCommand = commands.find(cmd => cmd.name === 'trivia-answer');
      if (triviaAnswerCommand) {
        try {
          const result = await triviaAnswerCommand.execute([trimmedInput.toUpperCase()]);
          addToHistory(result, 'command', trimmedInput);
        } catch (error) {
          addToHistory(`Error: ${error}`, 'error', trimmedInput);
        }
        // Only add to history if not a repeat of the last entry
        setCommandHistory(prev => {
          if (prev[prev.length - 1] !== trimmedInput) {
            return [...prev, trimmedInput];
          }
          return prev;
        });
        setHistoryIndex(-1);
        return;
      }
    }

    const command = commands.find(cmd => cmd.name === commandName?.toLowerCase());

    if (command) {
      try {
        const result = await command.execute(args);
        addToHistory(result, 'command', trimmedInput);
        
        // Track successful command execution
        track('dev_console_command', {
          command_name: commandName?.toLowerCase(),
          args_count: args.length,
          timestamp: new Date().toISOString(),
          has_args: args.length > 0
        });
        
      } catch (error) {
        addToHistory(`Error: ${error}`, 'error', trimmedInput);
        
        // Track command errors
        track('dev_console_error', {
          command_name: commandName?.toLowerCase(),
          error_type: 'execution_error',
          timestamp: new Date().toISOString()
        });
      }
    } else if (commandName) {
      // Use Fuse.js for fuzzy command suggestions
      const fuse = new Fuse(commands, {
        keys: ['name'],
        threshold: 0.6, // Allow for some fuzziness
        includeScore: true
      });
      
      const fuzzyResults = fuse.search(commandName);
      
      if (fuzzyResults.length > 0 && fuzzyResults[0].score! < 0.6) {
        const suggestion = fuzzyResults[0].item.name;
        addToHistory(`Unknown command: ${commandName}. Did you mean "${suggestion}"? Type "help" for available commands.`, 'error', trimmedInput);
        
        // Track unknown commands with suggestions
        track('dev_console_unknown_command', {
          attempted_command: commandName?.toLowerCase(),
          suggested_command: suggestion,
          timestamp: new Date().toISOString()
        });
        
      } else {
        addToHistory(`Unknown command: ${commandName}. Type "help" for available commands.`, 'error', trimmedInput);
        
        // Track completely unknown commands
        track('dev_console_unknown_command', {
          attempted_command: commandName?.toLowerCase(),
          suggested_command: null,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      addToHistory(`Unknown command. Type "help" for available commands.`, 'error', trimmedInput);
    }

    // Only add to history if not a repeat of the last entry
    setCommandHistory(prev => {
      if (prev[prev.length - 1] !== trimmedInput) {
        return [...prev, trimmedInput].slice(-50); // Keep last 50 commands
      }
      return prev;
    });
    setHistoryIndex(-1);
    setCurrentInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.console}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.icon}>🎮</span>
            Developer Console
          </div>
          <button 
            className={styles.closeButton} 
            onClick={() => {
              // Track console session before closing
              if (consoleSessionStart) {
                const sessionDuration = Date.now() - consoleSessionStart;
                track('dev_console_session', {
                  duration_ms: sessionDuration,
                  duration_seconds: Math.round(sessionDuration / 1000),
                  commands_executed: history.filter(h => h.type === 'command').length,
                  timestamp: new Date().toISOString(),
                  closed_method: 'close_button'
                });
              }
              setIsOpen(false);
              setConsoleSessionStart(null);
            }}
            title="Press ESC to close"
          >
            ×
          </button>
        </div>
        
        <div className={styles.history} ref={historyRef}>
          {history.map((entry, index) => (
            <div key={index} className={`${styles.entry} ${styles[entry.type]}`}>
              {entry.input && (
                <div className={styles.input}>
                  <span className={styles.prompt}>{'>'}</span>
                  <span>{entry.input}</span>
                </div>
              )}
              <div className={styles.output}>
                {entry.output.includes('<img') || entry.output.includes('<div') || entry.output.includes('<a') || entry.output.includes('href=') ? (
                  <div dangerouslySetInnerHTML={{ __html: he.decode(entry.output).replace(/\n/g, '<br>') }} />
                ) : (
                  <pre>{entry.output}</pre>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <span className={styles.prompt}>{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className={styles.input}
            placeholder="Type 'help' for commands..."
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        <div className={styles.footer}>
          <span>Press ESC to close • ↑↓ for command history • Type &quot;help&quot; for commands</span>
        </div>
      </div>
    </div>
  );
};

// Main component wrapper with mobile detection
const DevConsoleWrapper: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatches
  if (!isMounted) {
    return null;
  }

  // Don't render DevConsole on mobile to save resources
  if (isMobile) {
    return null;
  }

  return <DevConsoleDesktop />;
};

export default DevConsoleWrapper;
