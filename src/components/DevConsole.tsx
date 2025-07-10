'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/DevConsole.module.css';
import Uwuifier from 'uwuifier';
import Fuse from 'fuse.js';
import { evaluate } from 'mathjs';
import { format, differenceInDays, addDays, isToday, isTomorrow } from 'date-fns';
// @ts-expect-error - convert-units doesn't have TypeScript declarations
import convert from 'convert-units';
import { LoremIpsum } from 'lorem-ipsum';
import generatePassword from 'generate-password';
// @ts-expect-error - he doesn't have TypeScript declarations
import he from 'he';
// @ts-expect-error - chroma-js doesn't have TypeScript declarations
import chroma from 'chroma-js';
import hljs from 'highlight.js';
import bigInt from 'big-integer';
import stringArgv from 'string-argv';

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

const DevConsole: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ConsoleHistory[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [pageLoadTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

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
    setHistory(prev => [...prev, {
      input: input || '',
      output,
      timestamp: new Date(),
      type
    }]);
  }, []);

  // Check if console should reopen after reload
  useEffect(() => {
    const shouldReopen = localStorage.getItem('devConsole_reopenAfterReload');
    if (shouldReopen === 'true') {
      localStorage.removeItem('devConsole_reopenAfterReload');
      setIsOpen(true);
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
          'Basic Commands': [
            { name: 'help', desc: 'Show all available commands' },
            { name: 'clear', desc: 'Clear console history' },
            { name: 'exit', desc: 'Close the developer console' },
            { name: 'reload', desc: 'Reload the page and reopen console' },
            { name: 'navigate', desc: 'Navigate to pages or custom paths (navigate <page>)' },
            { name: 'beer', desc: 'Show information about Beer de Vreeze' }
          ],
          'System & Performance': [
            { name: 'info', desc: 'Show system information' },
            { name: 'uptime', desc: 'Show how long the page has been open' },
            { name: 'performance', desc: 'Show performance metrics' },
            { name: 'memory', desc: 'Display current memory usage (Chrome only)' },
            { name: 'network', desc: 'Show network information and test connectivity' }
          ],
          'World Info': [
            { name: 'time', desc: 'Show current time' },
            { name: 'date', desc: 'Show current date in various formats' },
            { name: 'weather', desc: 'Get real weather information for any city' },
            { name: 'age', desc: 'Calculate age from a birth date (age DD/MM/YYYY)' }
          ],
          'Developer Tools': [
            { name: 'storage', desc: 'Manage local storage (list, get, set, remove, clear)' },
            { name: 'json-validate', desc: 'Validate and pretty-print JSON input' },
            { name: 'fetch', desc: 'Fetch and display data from API endpoints (GET only)' },
            { name: 'clipboard', desc: 'Read from or write to the clipboard' },
            { name: 'search', desc: 'Fuzzy search through available commands' },
            { name: 'parse', desc: 'Parse command-line arguments (demo command)' },
            { name: 'highlight', desc: 'Syntax highlight code with automatic language detection' },
            { name: 'analyze', desc: 'Analyze text, numbers, colors, passwords, dates, or JSON' }
          ],
          'Calculators & Converters': [
            { name: 'calc', desc: 'Calculator (supports +, -, *, /, %, sqrt, pow)' },
            { name: 'math', desc: 'Advanced mathematical operations and calculations' },
            { name: 'encode', desc: 'Encode/decode text (base64, url, html)' },
            { name: 'convert', desc: 'Convert between units (temperature, length, weight, volume, data, time)' },
            { name: 'binary', desc: 'Convert between text and binary, and perform binary operations' },
            { name: 'base', desc: 'Convert numbers between different bases (2-36)' }
          ],
          'Random Generators': [
            { name: 'random', desc: 'Generate random data (number, string, color, password)' },
            { name: 'lorem', desc: 'Generate placeholder text (lorem ipsum)' },
            { name: 'password', desc: 'Generate secure passwords with custom options' },
            { name: 'qrcode', desc: 'Generate a QR code URL for text' },
            { name: 'colors', desc: 'Generate colors (rainbow, gradient, random, palette, harmonies, scales)' }
          ],
          'Entertainment': [
            { name: 'joke', desc: 'Get a random joke (programming, general, dad, chuck, geek, random, or specific category)' },
            { name: '8ball', desc: 'Ask the magic 8-ball a yes/no question' },
            { name: 'rickroll', desc: 'Play a Rick Astley video' },
            { name: 'trivia', desc: 'Get trivia questions from various categories' },
            { name: 'uwu', desc: 'Convert text to UwU speak' }
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

        output += 'Usage:\n';
        output += '  • Use ↑↓ arrows to navigate command history\n';
        output += '  • Press ESC or type "exit" to close console\n';
        output += '  • Commands are case-insensitive\n';
        output += '  • Use flags like --no-symbols for some commands\n';
        output += '  • Try "search <term>" to find commands quickly\n';

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
      name: 'time',
      description: 'Show current time',
      execute: () => {
        return new Date().toLocaleString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
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
        setIsOpen(false);
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
          
          default:
            return 'Usage: network <info|ping> [url]\nExamples:\n  network info\n  network ping https://www.google.com\n  network ping https://github.com';
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
      name: 'convert',
      description: 'Convert between different units (temperature, length, weight, volume, etc.)',
      execute: (args) => {
        if (args.length < 3) {
          return `Usage: convert <value> <from_unit> <to_unit>

Available conversions:
Length: mm, cm, m, km, in, ft, yd, mi
Mass: mg, g, kg, oz, lb
Volume: ml, l, tsp, Tbs, fl-oz, cup, pnt, qt, gal
Temperature: C, F, K
Area: mm2, cm2, m2, ha, km2, in2, ft2, ac, mi2
Time: ns, mu, ms, s, min, h, d, week, month, year
Energy: J, kJ, cal, kcal, Wh, kWh, eV, BTU
Digital: b, Kb, Mb, Gb, Tb, B, KB, MB, GB, TB

Examples:
  convert 5 ft m             - Feet to meters
  convert 100 F C            - Fahrenheit to Celsius
  convert 1 kg lb            - Kilograms to pounds
  convert 1 l qt             - Liters to quarts`;
        }

        const value = parseFloat(args[0]);
        const fromUnit = args[1];
        const toUnit = args[2];

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

Portfolio: https://beer-de-vreeze.vercel.app
Email: beer@vreeze.com
GitHub: https://github.com/Beer-de-Vreeze
LinkedIn: https://linkedin.com/in/beer-de-vreeze-59040919a/
Itch.io: https://bjeerpeer.itch.io`;
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
        
        const metrics = [
          `DNS Lookup: ${Math.round(perf.domainLookupEnd - perf.domainLookupStart)}ms`,
          `Connection: ${Math.round(perf.connectEnd - perf.connectStart)}ms`,
          `Request: ${Math.round(perf.responseStart - perf.requestStart)}ms`,
          `Response: ${Math.round(perf.responseEnd - perf.responseStart)}ms`,
          `DOM Load: ${Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart)}ms`,
          `Full Load: ${Math.round(perf.loadEventEnd - perf.loadEventStart)}ms`,
          `Total Time: ${Math.round(perf.loadEventEnd - perf.fetchStart)}ms`,
        ];
        return metrics.join('\n');
      }
    },

    {
      name: 'calc',
      description: 'Calculator (supports +, -, *, /, %, sqrt, pow, sin, cos, tan, log, etc.)',
      execute: (args) => {
        const expression = args.join(' ');
        if (!expression) return 'Usage: calc <expression>\nExamples: calc 2 + 2, calc sqrt(16), calc pow(2,3), calc sin(pi/2)';
        
        try {
          // Use mathjs for safe evaluation
          const result = evaluate(expression);
          return `${expression} = ${result}`;
        } catch (error) {
          return `Calculation error: ${error}`;
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
            
            return `🎨 Random Color:
Hex: ${hex}
RGB: rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})
HSL: hsl(${Math.round(hsl[0] || 0)}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)
HSV: hsv(${Math.round(hsv[0] || 0)}, ${Math.round(hsv[1] * 100)}%, ${Math.round(hsv[2] * 100)}%)
Luminance: ${randomColor.luminance().toFixed(3)}`;
          
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
              
              return `🎨 Color Palette (based on ${baseColor}):
${palette.map((c, i) => {
  const names = ['Base', 'Brighter', 'Darker', 'Saturated', 'Desaturated'];
  return `${i + 1}. ${names[i]}: ${c}`;
}).join('\n')}`;
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
              Object.entries(harmonies).forEach(([name, colors]) => {
                result += `${name}:\n${colors.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}\n\n`;
              });
              
              return result;
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
              
              return `🎨 Color Scale (${startColor} → ${endColor}, ${steps} steps):
${scale.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}`;
            } catch {
              return `Error: Invalid colors "${startColor}" or "${endColor}". Use valid hex, rgb, or named colors.`;
            }
          
          case 'rainbow':
            const rainbowColors = chroma.scale(['red', 'orange', 'yellow', 'green', 'blue', 'purple']).mode('hsl').colors(12);
            const rainbow = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
            let rainbowText = '';
            for (let i = 0; i < 20; i++) {
              rainbowText += rainbow[i % rainbow.length];
            }
            return `🌈 Rainbow:
Visual: ${rainbowText}
Colors: ${rainbowColors.join(', ')}`;
          
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
              
              return `🎨 Color Contrast Analysis:
Color 1: ${color1} → ${c1.hex()}
Color 2: ${color2} → ${c2.hex()}
Contrast Ratio: ${contrast.toFixed(2)}:1
Accessibility: ${accessibility}`;
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
              
              return `🎨 Color Information for ${infoColor}:
Hex: ${color.hex()}
RGB: rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})
HSL: hsl(${Math.round(hsl[0] || 0)}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)
HSV: hsv(${Math.round(hsv[0] || 0)}, ${Math.round(hsv[1] * 100)}%, ${Math.round(hsv[2] * 100)}%)
LAB: lab(${Math.round(lab[0])}, ${Math.round(lab[1])}, ${Math.round(lab[2])})
Luminance: ${color.luminance().toFixed(3)}
Temperature: ${color.temperature().toFixed(0)}K`;
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

Examples:
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
          return 'Usage: weather <city name>\nExamples: weather London, weather "New York"';
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
          
          return `Weather in ${locationName}:
${weatherEmoji} ${description}
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
      description: 'Get a random joke (programming, general, dad, chuck, geek, random, or specific category)',
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
      name: 'qrcode',
      description: 'Generate a QR code URL for text',
      execute: (args) => {
        const text = args.join(' ');
        if (!text) return 'Usage: qrcode <text to encode>';
        
        const encodedText = encodeURIComponent(text);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
        
        console.log(`QR Code generated for: ${text}`, 'font-weight: bold; color: #00ff00;');
        console.log(`URL: ${qrUrl}`, 'color: #0066cc;');
        
        return `QR Code generated for: "${text}"\nURL: ${qrUrl}`;
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
  navigate https://...     - Navigate to external URL

Examples:
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
  navigate https://github.com`;
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
              return 'Opening GitHub profile: https://github.com/Beer-de-Vreeze';
            case 'itch':
              window.open('https://bjeerpeer.itch.io', '_blank');
              return 'Opening Itch.io page: https://bjeerpeer.itch.io';
            case 'linkedin':
              window.open('https://linkedin.com/in/beer-de-vreeze-59040919a/', '_blank');
              return 'Opening LinkedIn profile: https://linkedin.com/in/beer-de-vreeze-59040919a/';
            case 'portfolio':
              window.open('https://beer-de-vreeze.vercel.app', '_blank');
              return 'Opening portfolio: https://beer-de-vreeze.vercel.app';
            case 'email':
              window.open('mailto:beer@vreeze.com', '_blank');
              return 'Opening email client for: beer@vreeze.com';
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

Examples:
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
      name: 'json-validate',
      description: 'Validate, pretty-print and analyze JSON input with syntax highlighting',
      execute: (args) => {
        const jsonText = args.join(' ');
        if (!jsonText) {
          return `Usage: json-validate <json string>

Examples:
  json-validate {"name":"John","age":30}
  json-validate [1,2,3,{"nested":true}]
  json-validate '{"complex":{"data":["item1","item2"]}}'`;
        }
        
        try {
          const parsed = JSON.parse(jsonText);
          const pretty = JSON.stringify(parsed, null, 2);
          
          // Analyze the JSON structure
          const analyze = (obj: unknown): { type: string, count: number, keys?: string[] } => {
            if (Array.isArray(obj)) {
              return { type: 'array', count: obj.length };
            } else if (obj !== null && typeof obj === 'object') {
              const keys = Object.keys(obj as Record<string, unknown>);
              return { type: 'object', count: keys.length, keys };
            } else {
              return { type: typeof obj, count: 1 };
            }
          };
          
          const analysis = analyze(parsed);
          
          // Try to highlight the JSON (basic highlighting without full hljs setup)
          const highlighted = pretty
            .replace(/"([^"]+)":/g, '"$1":')  // Keys
            .replace(/: "([^"]+)"/g, ': "$1"')  // String values
            .replace(/: (\d+)/g, ': $1')  // Numbers
            .replace(/: (true|false|null)/g, ': $1');  // Booleans/null
          
          let result = `✅ Valid JSON (${analysis.type}):\n\n${highlighted}\n\n`;
          
          // Add analysis
          result += `📊 Analysis:\n`;
          result += `Type: ${analysis.type}\n`;
          
          if (analysis.type === 'object' && analysis.keys) {
            result += `Properties: ${analysis.count}\n`;
            result += `Keys: ${analysis.keys.join(', ')}\n`;
          } else if (analysis.type === 'array') {
            result += `Items: ${analysis.count}\n`;
          }
          
          result += `Size: ${jsonText.length} characters\n`;
          result += `Minified size: ${JSON.stringify(parsed).length} characters\n`;
          result += `Pretty size: ${pretty.length} characters`;
          
          return result;
        } catch (error) {
          // Enhanced error reporting
          const errorMsg = error instanceof Error ? error.message : String(error);
          
          // Try to find the error position
          const match = errorMsg.match(/position (\d+)/);
          const position = match ? parseInt(match[1]) : -1;
          
          let result = `❌ Invalid JSON: ${errorMsg}\n\n`;
          
          if (position >= 0 && position < jsonText.length) {
            const start = Math.max(0, position - 20);
            const end = Math.min(jsonText.length, position + 20);
            const snippet = jsonText.slice(start, end);
            const pointer = ' '.repeat(position - start) + '^';
            
            result += `Error near position ${position}:\n`;
            result += `${snippet}\n${pointer}\n\n`;
          }
          
          result += `Common JSON errors:
• Missing quotes around strings
• Trailing commas (not allowed in JSON)
• Single quotes instead of double quotes
• Unescaped characters in strings
• Missing closing brackets/braces`;
          
          return result;
        }
      }
    },
    {
      name: 'date',
      description: 'Show the current date in various formats or convert between time zones',
      execute: (args) => {
        const now = new Date();
        const action = args[0] || 'all';
        
        switch (action) {
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
Unix: ${Math.floor(now.getTime() / 1000)}

Usage: date <iso|utc|local|timestamp|unix|all>`;
        }
      }
    },
    {
      name: 'age',
      description: 'Calculate age from a birth date (usage: age DD/MM/YYYY)',
      execute: (args) => {
        const dateInput = args[0];
        if (!dateInput) {
          return `Usage: age <DD/MM/YYYY>
Examples:
  age 19/08/2005    - Calculate age from August 19, 2005
  age 01/01/1990    - Calculate age from January 1, 1990
  age 25/12/2000    - Calculate age from December 25, 2000

Format: DD/MM/YYYY (day/month/year)`;
        }

        try {
          // Parse the date in DD/MM/YYYY format
          const dateParts = dateInput.split('/');
          if (dateParts.length !== 3) {
            return 'Error: Please use DD/MM/YYYY format (e.g., 19/08/2005)';
          }

          const day = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]);
          const year = parseInt(dateParts[2]);

          // Validate the input
          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return 'Error: Invalid date format. Please use numbers in DD/MM/YYYY format';
          }

          if (day < 1 || day > 31) {
            return 'Error: Day must be between 1 and 31';
          }

          if (month < 1 || month > 12) {
            return 'Error: Month must be between 1 and 12';
          }

          if (year < 1900 || year > new Date().getFullYear()) {
            return `Error: Year must be between 1900 and ${new Date().getFullYear()}`;
          }

          // Create the birth date using date-fns
          const birthDate = new Date(year, month - 1, day);
          
          // Validate that the date is valid (handles invalid dates like 31/02/2000)
          if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
            return 'Error: Invalid date (e.g., February 30th doesn\'t exist)';
          }

          const today = new Date();
          
          // Check if birth date is in the future
          if (birthDate > today) {
            return 'Error: Birth date cannot be in the future';
          }

          // Calculate age using date-fns
          const ageInYears = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          let age = ageInYears;
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          // Calculate next birthday using date-fns
          const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          const nextBirthday = thisYearBirthday <= today ? 
            addDays(thisYearBirthday, 365) : 
            thisYearBirthday;

          const daysUntilBirthday = differenceInDays(nextBirthday, today);
          
          // Format the birth date for display using date-fns
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
      }
    },

    {
      name: 'fetch',
      description: 'Fetch and display data from a given API endpoint (GET only, for safety)',
      execute: async (args) => {
        const url = args[0];
        if (!url) return 'Usage: fetch <url>\nExample: fetch https://api.github.com/users/Beer-de-Vreeze';
        
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
      name: 'uptime',
      description: 'Show how long the page has been open',
      execute: () => {
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
              return 'Usage: clipboard <read|write> [text]\nExamples:\n  clipboard read\n  clipboard write Hello World';
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

Examples:
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
      name: 'binary',
      description: 'Convert between text and binary, and perform binary operations',
      execute: (args) => {
        const action = args[0];
        
        if (!action) {
          return `Binary Operations:

Text Conversion:
  binary encode <text>         - Convert text to binary
  binary decode <binary>       - Convert binary to text

Number Conversion:
  binary number 42             - Convert number to binary
  binary decimal 101010        - Convert binary to decimal

Operations:
  binary add 1010 1100         - Add two binary numbers
  binary and 1010 1100         - Bitwise AND
  binary or 1010 1100          - Bitwise OR
  binary xor 1010 1100         - Bitwise XOR

Examples:
  binary encode "Hello"        - Returns binary
  binary number 15             - Returns: 1111`;
        }
        
        const input = args.slice(1).join(' ');
        
        try {
          switch (action.toLowerCase()) {
            case 'encode':
            case 'text':
            case 'from-text':
              if (!input) return 'Usage: binary encode <text>';
              let binaryResult = '';
              for (let i = 0; i < input.length; i++) {
                const binary = input.charCodeAt(i).toString(2).padStart(8, '0');
                binaryResult += binary;
              }
              return `Text to Binary:
Input: "${input}"
Binary: ${binaryResult}`;
            
            case 'decode':
            case 'from-binary':
              if (!input) return 'Usage: binary decode <binary>';
              if (!/^[01]+$/.test(input)) return 'Error: Invalid binary string (only 0s and 1s allowed)';
              if (input.length % 8 !== 0) return 'Error: Binary string length must be multiple of 8';
              
              let textResult = '';
              for (let i = 0; i < input.length; i += 8) {
                const byte = input.substr(i, 8);
                const decimal = parseInt(byte, 2);
                textResult += String.fromCharCode(decimal);
              }
              return `Binary to Text:
Input: ${input}
Text: "${textResult}"`;
            
            case 'number':
            case 'decimal':
              if (!input) return 'Usage: binary number <decimal>';
              
              // Try to handle large numbers with big-integer
              try {
                const bigNum = bigInt(input);
                const binary = bigNum.toString(2);
                const isSmall = bigNum.lesserOrEquals(Number.MAX_SAFE_INTEGER);
                return `🔢 Decimal to Binary:
Decimal: ${bigNum.toString()}
Binary: ${binary}
Length: ${binary.length} bits
Type: ${isSmall ? 'Small integer' : 'Big integer'}`;
              } catch {
                return `Error: Invalid number "${input}"`;
              }
            
            case 'from-decimal':
            case 'to-decimal':
              if (!input) return 'Usage: binary decimal <binary>';
              if (!/^[01]+$/.test(input)) return 'Error: Invalid binary string';
              
              // Handle large binary numbers
              try {
                const bigNum = bigInt(input, 2);
                const isSmall = bigNum.lesserOrEquals(Number.MAX_SAFE_INTEGER);
                return `🔢 Binary to Decimal:
Binary: ${input}
Decimal: ${bigNum.toString()}
Length: ${input.length} bits
Type: ${isSmall ? 'Small integer' : 'Big integer'}`;
              } catch {
                return `Error: Binary number too large or invalid`;
              }
            
            case 'hex':
            case 'from-hex':
              if (!input) return 'Usage: binary hex <hex>';
              if (!/^[0-9A-Fa-f]+$/.test(input)) return 'Error: Invalid hex string';
              const hexToBinary = parseInt(input, 16).toString(2);
              return `🔢 Hex to Binary:
Hex: ${input.toUpperCase()}
Binary: ${hexToBinary}
Decimal: ${parseInt(input, 16)}`;
            
            case 'validate':
              if (!input) return 'Usage: binary validate <binary>';
              const isValid = /^[01]+$/.test(input);
              return `✅ Validation:
Input: ${input}
Valid Binary: ${isValid ? 'Yes' : 'No'}
Length: ${input.length} bits`;
            
            case 'count':
              if (!input) return 'Usage: binary count <binary>';
              if (!/^[01]+$/.test(input)) return 'Error: Invalid binary string';
              const ones = (input.match(/1/g) || []).length;
              const zeros = (input.match(/0/g) || []).length;
              return `📊 Bit Count:
Input: ${input}
Ones (1): ${ones}
Zeros (0): ${zeros}
Total: ${input.length} bits
Ratio: ${(ones / input.length * 100).toFixed(1)}% ones`;
            
            case 'flip':
            case 'invert':
              if (!input) return 'Usage: binary flip <binary>';
              if (!/^[01]+$/.test(input)) return 'Error: Invalid binary string';
              const flipped = input.split('').map(bit => bit === '0' ? '1' : '0').join('');
              return `🔄 Flip Bits:
Original: ${input}
Flipped:  ${flipped}
Length: ${input.length} bits`;
            
            case 'pad':
              const parts = args.slice(1);
              if (parts.length < 2) return 'Usage: binary pad <binary> <length>';
              const binaryToPad = parts[0];
              const padLength = parseInt(parts[1]);
              if (!/^[01]+$/.test(binaryToPad)) return 'Error: Invalid binary string';
              if (isNaN(padLength) || padLength < 1) return 'Error: Invalid pad length';
              const padded = binaryToPad.padStart(padLength, '0');
              return `📏 Pad Binary:
Original: ${binaryToPad}
Padded:   ${padded}
Length: ${binaryToPad.length} → ${padded.length} bits`;
            
            case 'add':
              const addParts = args.slice(1);
              if (addParts.length < 2) return 'Usage: binary add <binary1> <binary2>';
              const [bin1, bin2] = addParts;
              if (!/^[01]+$/.test(bin1) || !/^[01]+$/.test(bin2)) return 'Error: Invalid binary strings';
              const sum = (parseInt(bin1, 2) + parseInt(bin2, 2)).toString(2);
              return `➕ Binary Addition:
${bin1.padStart(Math.max(bin1.length, bin2.length, sum.length), '0')}
${bin2.padStart(Math.max(bin1.length, bin2.length, sum.length), '0')}
${'='.repeat(Math.max(bin1.length, bin2.length, sum.length))}
${sum}

Decimal: ${parseInt(bin1, 2)} + ${parseInt(bin2, 2)} = ${parseInt(sum, 2)}`;
            
            case 'subtract':
              const subParts = args.slice(1);
              if (subParts.length < 2) return 'Usage: binary subtract <binary1> <binary2>';
              const [subBin1, subBin2] = subParts;
              if (!/^[01]+$/.test(subBin1) || !/^[01]+$/.test(subBin2)) return 'Error: Invalid binary strings';
              const difference = (parseInt(subBin1, 2) - parseInt(subBin2, 2)).toString(2);
              return `➖ Binary Subtraction:
${subBin1} - ${subBin2} = ${difference}
Decimal: ${parseInt(subBin1, 2)} - ${parseInt(subBin2, 2)} = ${parseInt(difference, 2)}`;
            
            case 'multiply':
              const mulParts = args.slice(1);
              if (mulParts.length < 2) return 'Usage: binary multiply <binary1> <binary2>';
              const [mulBin1, mulBin2] = mulParts;
              if (!/^[01]+$/.test(mulBin1) || !/^[01]+$/.test(mulBin2)) return 'Error: Invalid binary strings';
              const product = (parseInt(mulBin1, 2) * parseInt(mulBin2, 2)).toString(2);
              return `✖️ Binary Multiplication:
${mulBin1} × ${mulBin2} = ${product}
Decimal: ${parseInt(mulBin1, 2)} × ${parseInt(mulBin2, 2)} = ${parseInt(product, 2)}`;
            
            case 'and':
              const andParts = args.slice(1);
              if (andParts.length < 2) return 'Usage: binary and <binary1> <binary2>';
              const [andBin1, andBin2] = andParts;
              if (!/^[01]+$/.test(andBin1) || !/^[01]+$/.test(andBin2)) return 'Error: Invalid binary strings';
              const andResult = (parseInt(andBin1, 2) & parseInt(andBin2, 2)).toString(2);
              return `🔒 Bitwise AND:
${andBin1} & ${andBin2} = ${andResult}
Decimal: ${parseInt(andBin1, 2)} & ${parseInt(andBin2, 2)} = ${parseInt(andResult, 2)}`;
            
            case 'or':
              const orParts = args.slice(1);
              if (orParts.length < 2) return 'Usage: binary or <binary1> <binary2>';
              const [orBin1, orBin2] = orParts;
              if (!/^[01]+$/.test(orBin1) || !/^[01]+$/.test(orBin2)) return 'Error: Invalid binary strings';
              const orResult = (parseInt(orBin1, 2) | parseInt(orBin2, 2)).toString(2);
              return `🔓 Bitwise OR:
${orBin1} | ${orBin2} = ${orResult}
Decimal: ${parseInt(orBin1, 2)} | ${parseInt(orBin2, 2)} = ${parseInt(orResult, 2)}`;
            
            case 'xor':
              const xorParts = args.slice(1);
              if (xorParts.length < 2) return 'Usage: binary xor <binary1> <binary2>';
              const [xorBin1, xorBin2] = xorParts;
              if (!/^[01]+$/.test(xorBin1) || !/^[01]+$/.test(xorBin2)) return 'Error: Invalid binary strings';
              const xorResult = (parseInt(xorBin1,  2) ^ parseInt(xorBin2, 2)).toString(2);
              return `⚡ Bitwise XOR:
${xorBin1} ^ ${xorBin2} = ${xorResult}
Decimal: ${parseInt(xorBin1, 2)} ^ ${parseInt(xorBin2, 2)} = ${parseInt(xorResult, 2)}`;
            
            case 'not':
              if (!input) return 'Usage: binary not <binary>';
              if (!/^[01]+$/.test(input)) return 'Error: Invalid binary string';
              const notResult = input.split('').map(bit => bit === '0' ? '1' : '0').join('');
              return `🚫 Bitwise NOT:
~${input} = ${notResult}
Length: ${input.length} bits`;
            
            case 'shift-left':
            case 'shl':
              const shlParts = args.slice(1);
              if (shlParts.length < 2) return 'Usage: binary shift-left <binary> <positions>';
              const [shlBin, shlPos] = shlParts;
              if (!/^[01]+$/.test(shlBin)) return 'Error: Invalid binary string';
              const positions = parseInt(shlPos);
              if (isNaN(positions)) return 'Error: Invalid shift positions';
              const shifted = (parseInt(shlBin, 2) << positions).toString(2);
              return `⬅️ Left Shift:
${shlBin} << ${positions} = ${shifted}
Decimal: ${parseInt(shlBin, 2)} << ${positions} = ${parseInt(shifted, 2)}`;
            
            case 'shift-right':
            case 'shr':
              const shrParts = args.slice(1);
              if (shrParts.length < 2) return 'Usage: binary shift-right <binary> <positions>';
              const [shrBin, shrPos] = shrParts;
              if (!/^[01]+$/.test(shrBin)) return 'Error: Invalid binary string';
              const shrPositions = parseInt(shrPos);
              if (isNaN(shrPositions)) return 'Error: Invalid shift positions';
              const shrResult = (parseInt(shrBin, 2) >> shrPositions).toString(2);
              return `➡️ Right Shift:
${shrBin} >> ${shrPositions} = ${shrResult}
Decimal: ${parseInt(shrBin, 2)} >> ${shrPositions} = ${parseInt(shrResult, 2)}`;
            
            default:
              return `❌ Unknown binary operation: ${action}
Use 'binary' without arguments to see all available operations.`;
          }
        } catch (error) {
          return `❌ Binary operation error: ${error}`;
        }
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

Examples:
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

Examples:
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

          // Store the correct answer for potential follow-up
          const correctLetter = String.fromCharCode(65 + correctIndex);

          return `Trivia Question:

Category: ${formattedCategory}
Difficulty: ${formattedDifficulty}

${decodedQuestion}

${answerOptions}

Answer: ${correctLetter}. ${decodedCorrect}`;

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

          return `Trivia Question (Offline):

Category: ${randomQuestion.category}
Difficulty: ${randomQuestion.difficulty}

${randomQuestion.question}

${randomQuestion.answers.join('\n')}

Answer: ${randomQuestion.correct}

Note: API unavailable - showing offline question`;
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

Examples:
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
      name: 'math',
      description: 'Advanced mathematical operations and calculations',
      execute: (args) => {
        const operation = args[0];
        
        if (!operation) {
          return `Math Command Usage:

Advanced mathematical operations and calculations!

Usage: math <operation> [arguments]

Operations:
  eval <expression>        - Evaluate complex mathematical expressions
  matrix <operation>       - Matrix operations (add, multiply, etc.)
  units <expression>       - Calculate with units (5 cm + 2 inch)
  stats <numbers...>       - Calculate statistics (mean, median, mode, etc.)
  constants               - Show mathematical constants
  functions               - Show available mathematical functions

Examples:
  math eval "sqrt(16) + sin(pi/2)"
  math eval "derivative('x^2', 'x')"
  math eval "factorial(5)"
  math units "5 cm + 2 inch to mm"
  math stats 1 2 3 4 5 6 7 8 9 10
  math constants
  math functions`;
        }

        try {
          switch (operation.toLowerCase()) {
            case 'eval':
            case 'evaluate':
              const expression = args.slice(1).join(' ');
              if (!expression) return 'Usage: math eval <expression>';
              const result = evaluate(expression);
              return `${expression} = ${result}`;
            
            case 'units':
              const unitExpr = args.slice(1).join(' ');
              if (!unitExpr) return 'Usage: math units <expression>\nExample: math units "5 cm + 2 inch to mm"';
              const unitResult = evaluate(unitExpr);
              return `${unitExpr} = ${unitResult}`;
            
            case 'stats':
              const numbers = args.slice(1).map(parseFloat).filter(n => !isNaN(n));
              if (numbers.length === 0) return 'Usage: math stats <numbers...>\nExample: math stats 1 2 3 4 5';
              
              const mean = evaluate(`mean([${numbers.join(',')}])`);
              const median = evaluate(`median([${numbers.join(',')}])`);
              const mode = evaluate(`mode([${numbers.join(',')}])`);
              const std = evaluate(`std([${numbers.join(',')}])`);
              const variance = evaluate(`var([${numbers.join(',')}])`);
              const min = Math.min(...numbers);
              const max = Math.max(...numbers);
              
              return `Statistics for [${numbers.join(', ')}]:
Mean: ${mean}
Median: ${median}
Mode: ${Array.isArray(mode) ? mode.join(', ') : mode}
Standard Deviation: ${std}
Variance: ${variance}
Min: ${min}
Max: ${max}
Count: ${numbers.length}`;
            
            case 'constants':
              const constants = {
                'pi': 'π ≈ 3.14159',
                'e': 'e ≈ 2.71828',
                'phi': 'φ (Golden Ratio) ≈ 1.61803',
                'tau': 'τ (2π) ≈ 6.28318'
              };
              
              let constOutput = 'Mathematical Constants:\n';
              Object.entries(constants).forEach(([name, desc]) => {
                const value = evaluate(name);
                constOutput += `${desc} = ${value}\n`;
              });
              return constOutput;
            
            case 'functions':
              return `Available Mathematical Functions:

Trigonometric: sin, cos, tan, asin, acos, atan, atan2, sec, csc, cot
Hyperbolic: sinh, cosh, tanh, asinh, acosh, atanh
Logarithmic: log, log10, log2, ln
Power & Root: sqrt, cbrt, pow, exp, square
Rounding: round, floor, ceil, fix, sign, abs
Statistical: mean, median, mode, min, max, std, var
Matrix: multiply, add, subtract, transpose, det, inv
Probability: random, permutations, combinations
Complex: re, im, conj, arg
Calculus: derivative, integrate
Others: factorial, gcd, lcm, mod, xor

Example: math eval "derivative('x^2 + 2*x + 1', 'x')"`;
            
            default:
              return `Unknown math operation: ${operation}. Use 'math' without arguments for help.`;
          }
        } catch (error) {
          return `Math error: ${error}`;
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

Examples:
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

Examples:
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
      name: 'highlight',
      description: 'Syntax highlight code with automatic language detection',
      execute: (args) => {
        if (args.length === 0) {
          return `Syntax Highlighter Usage:

Highlight code syntax with automatic language detection!

Usage: highlight <language> <code...>
   or: highlight auto <code...>

Supported languages: javascript, typescript, python, java, cpp, html, css, json, xml, sql, bash, etc.

Examples:
  highlight javascript const x = 5; console.log(x);
  highlight python def hello(): print("Hello World")
  highlight auto function test() { return true; }
  highlight json {"name": "John", "age": 30}
  highlight css body { margin: 0; padding: 20px; }

Note: This shows syntax highlighting metadata in text format.`;
        }

        const language = args[0];
        const code = args.slice(1).join(' ');

        if (!code) {
          return 'Please provide code to highlight. Usage: highlight <language> <code>';
        }

        try {
          let result;
          
          if (language === 'auto') {
            // Auto-detect language
            result = hljs.highlightAuto(code);
          } else {
            // Use specific language
            result = hljs.highlight(code, { language });
          }

          const detectedLang = result.language || 'unknown';
          const relevance = result.relevance || 0;
          
          // Since we can't render HTML in console, let's provide useful info
          let output = `Syntax Analysis Results:

Language: ${detectedLang}${language === 'auto' ? ' (auto-detected)' : ''}
Relevance Score: ${relevance}${relevance > 5 ? ' (high confidence)' : relevance > 2 ? ' (medium confidence)' : ' (low confidence)'}

Original Code:
${code}

Tokenized Elements Found:
`;

          // Extract tokens/keywords from the highlighting
          const htmlOutput = result.value;
          const tokens = htmlOutput.match(/<span class="hljs-\w+">[^<]+<\/span>/g) || [];
          
          if (tokens.length > 0) {
            const uniqueTokens = [...new Set(tokens.map(token => {
              const type = token.match(/hljs-(\w+)/)?.[1] || 'unknown';
              const content = token.replace(/<[^>]+>/g, '');
              return `${type}: "${content}"`;
            }))];
            
            output += uniqueTokens.slice(0, 15).join('\n');
            if (uniqueTokens.length > 15) {
              output += `\n... and ${uniqueTokens.length - 15} more tokens`;
            }
          } else {
            output += 'No special syntax elements detected.';
          }

          return output;
        } catch (error) {
          return `Highlight error: ${error instanceof Error ? error.message : 'Unknown error'}. Try 'highlight auto <code>' or check if the language is supported.`;
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

Examples:
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

Basic Stats:
Characters: ${chars} (${charsNoSpaces} without spaces)
Words: ${words.length}
Sentences: ${sentences.length}
Paragraphs: ${input.split(/\n\s*\n/).length}

Readability:
Avg word length: ${avgWordLength.toFixed(1)} characters
Avg sentence length: ${avgSentenceLength.toFixed(1)} words
Avg syllables per word: ${avgSyllablesPerWord.toFixed(1)}
Estimated reading time: ${Math.ceil(words.length / 200)} minutes

Fun Conversion:
UwU version: "${uwuSample}"`;

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
Contrast with black: ${blackContrast.toFixed(2)}:1 ${blackContrast >= 4.5 ? '✅' : '❌'}`;

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
        setIsOpen(false);
        setCurrentInput('');
        setHistoryIndex(-1);
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
  }, [isOpen, commandHistory, historyIndex]);

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

    const command = commands.find(cmd => cmd.name === commandName?.toLowerCase());

    if (command) {
      try {
        const result = await command.execute(args);
        addToHistory(result, 'command', trimmedInput);
      } catch (error) {
        addToHistory(`Error: ${error}`, 'error', trimmedInput);
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
      } else {
        addToHistory(`Unknown command: ${commandName}. Type "help" for available commands.`, 'error', trimmedInput);
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
            onClick={() => setIsOpen(false)}
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
                <pre>{entry.output}</pre>
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

export default DevConsole;