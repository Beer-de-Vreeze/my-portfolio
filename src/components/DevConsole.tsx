'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/DevConsole.module.css';

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
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ConsoleHistory[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [pageLoadTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

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
      addToHistory('🔄 Console reopened after page reload.', 'info');
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
          'Date & Time': [
            { name: 'time', desc: 'Show current time' },
            { name: 'date', desc: 'Show current date in various formats' },
            { name: 'age', desc: 'Calculate your age from birth date (YYYY-MM-DD or YYYY)' }
          ],
          'Developer Tools': [
            { name: 'storage', desc: 'Manage local storage (list, get, set, remove, clear)' },
            { name: 'json-validate', desc: 'Validate and pretty-print JSON input' },
            { name: 'fetch', desc: 'Fetch and display data from API endpoints (GET only)' },
            { name: 'clipboard', desc: 'Read from or write to the clipboard' }
          ],
          'Calculators & Converters': [
            { name: 'calc', desc: 'Calculator (supports +, -, *, /, %, sqrt, pow)' },
            { name: 'encode', desc: 'Encode/decode text (base64, url, html)' }
          ],
          'Random Generators': [
            { name: 'random', desc: 'Generate random data (number, string, color, password)' },
            { name: 'lorem', desc: 'Generate placeholder text (lorem ipsum)' },
            { name: 'password', desc: 'Generate secure passwords with custom options' },
            { name: 'qrcode', desc: 'Generate a QR code URL for text' },
            { name: 'colors', desc: 'Fun with colors! Try: rainbow, gradient, random, palette' }
          ],
          'Web & API': [
            { name: 'weather', desc: 'Get real weather information for any city' }
          ],
          'Games & Entertainment': [
            { name: 'joke', desc: 'Get a random joke (programming, general, dad, chuck, geek, random, or specific category)' },
            { name: 'flip', desc: 'Flip a coin (heads or tails)' },
            { name: 'dice', desc: 'Roll a dice (1-6 or custom sides)' },
            { name: 'palindrome', desc: 'Check if a word or phrase is a palindrome' },
            { name: 'reverse', desc: 'Reverse any text' },
            { name: 'rickroll', desc: 'Play a Rick Astley video or show a fun message' }
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

        output += '💡 Tips & Usage:\n';
        output += '  • Use ↑↓ arrows to navigate command history\n';
        output += '  • Press ESC or type "exit" to close console\n';
        output += '  • Commands are case-insensitive\n';
        output += '  • Use quotes for multi-word arguments\n\n';
        
        output += '🌟 Popular Commands:\n';
        output += '  weather London          - Get weather for any city\n';
        output += '  joke programming        - Get a programming joke\n';
        output += '  calc 2 + 2 * 3         - Quick calculations\n';
        output += '  random color            - Generate random colors\n';
        output += '  navigate about          - Navigate to pages\n';
        output += '  lorem 10                - Generate text\n';
        output += '  age 2000-08-19          - Calculate age\n';
        output += '  qrcode Hello World      - Generate QR codes\n';
        output += '  encode base64 Hello     - Encode/decode text\n';
        output += '  storage list            - Manage browser storage\n';
        output += '  fetch https://api.github.com/users/Beer-de-Vreeze\n';
        output += '  json-validate {"test": "data"}  - Validate JSON\n\n';
        
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
      execute: (args) => {
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
            const start = performance.now();
            
            fetch(url, { mode: 'no-cors' })
              .then(() => {
                const end = performance.now();
                console.log(`Ping to ${url}: ${Math.round(end - start)}ms`, 'color: #00ff00;');
              })
              .catch(() => {
                console.log(`Ping to ${url}: failed`, 'color: #ff0000;');
              });
            
            return `Pinging ${url}... (check console for result)`;
          
          default:
            return 'Usage: network <info|ping> [url]';
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
            const pwChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < pwLength; i++) {
              password += pwChars.charAt(Math.floor(Math.random() * pwChars.length));
            }
            return `Random password (${pwLength} chars): ${password}`;
          
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
              return `HTML encoded: ${text.replace(/[&<>"']/g, (m) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
              }[m] || m))}`;
            case 'decode-html':
              return `HTML decoded: ${text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ({
                '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'"
              }[m] || m))}`;
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

Personal Info:
   Name: Beer de Vreeze
   Age: ${age} years old
   Born: August 19, 2005
   Location: Beusichem, Netherlands

Professional:
   Role: Game Developer
   Focus: Tools and Systems in Game Development

Links & Profiles:
   Portfolio: https://beer-de-vreeze.vercel.app
   Email: beer@vreeze.com
   GitHub: https://github.com/Beer-de-Vreeze
   LinkedIn: https://linkedin.com/in/beer-de-vreeze-59040919a/
   Itch.io: https://bjeerpeer.itch.io

Based in the Netherlands
Passionate about creating interactive experiences and innovative solutions`;
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
      description: 'Calculator (supports +, -, *, /, %, sqrt, pow)',
      execute: (args) => {
        const expression = args.join(' ');
        if (!expression) return 'Usage: calc <expression>\nExamples: calc 2 + 2, calc sqrt(16), calc pow(2,3)';
        
        try {
          // Replace function names for eval safety
          const safeExpression = expression
            .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
            .replace(/pow\(([^,]+),([^)]+)\)/g, 'Math.pow($1,$2)')
            .replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
            .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
            .replace(/tan\(([^)]+)\)/g, 'Math.tan($1)')
            .replace(/log\(([^)]+)\)/g, 'Math.log($1)')
            .replace(/abs\(([^)]+)\)/g, 'Math.abs($1)')
            .replace(/round\(([^)]+)\)/g, 'Math.round($1)')
            .replace(/floor\(([^)]+)\)/g, 'Math.floor($1)')
            .replace(/ceil\(([^)]+)\)/g, 'Math.ceil($1)')
            .replace(/pi/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
          
          // Basic validation - only allow numbers, operators, parentheses, and Math functions
          if (!/^[0-9+\-*/.%(),\sMath.a-z]+$/i.test(safeExpression)) {
            return 'Error: Invalid characters in expression';
          }
          
          const result = Function(`"use strict"; return (${safeExpression})`)();
          return `${expression} = ${result}`;
        } catch (error) {
          return `Calculation error: ${error}`;
        }
      }
    },
    {
      name: 'colors',
      description: 'Fun with colors! Try: colors rainbow, colors gradient, colors random',
      execute: (args) => {
        const mode = args[0] || 'random';
        
        switch (mode) {
          case 'rainbow':
            const rainbow = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
            let rainbowText = '';
            for (let i = 0; i < 20; i++) {
              rainbowText += rainbow[i % rainbow.length];
            }
            return `🌈 Rainbow: ${rainbowText}\nColors are fun!`;
          
          case 'gradient':
            const gradientChars = ['█', '▉', '▊', '▋', '▌', '▍', '▎', '▏', ' '];
            let gradient = '';
            for (let i = 0; i < gradientChars.length; i++) {
              gradient += gradientChars[i].repeat(3);
            }
            return `Gradient: ${gradient}\nASCII art gradient!`;
          
          case 'random':
            const colors = ['#FF6B35', '#F7931E', '#FFD700', '#32CD32', '#00CED1', '#9370DB', '#FF1493'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return `Random color: ${randomColor}\nPerfect for your next project!`;
          
          case 'palette':
            const palette = ['#FF6B35', '#F7931E', '#FFD700', '#32CD32', '#00CED1', '#9370DB'];
            return `Color Palette:\n${palette.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
          
          default:
            return 'Usage: colors <rainbow|gradient|random|palette>';
        }
      }
    },
    {
      name: 'weather',
      description: 'Get real weather information for any city (usage: weather <city>)',
      execute: async (args): Promise<string> => {
        const location = args.join(' ');
        
        if (!location) {
          return 'Usage: weather <city name>\nExamples:\n  weather London\n  weather New York\n  weather Tokyo\n  weather "San Francisco"';
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
            return `❌ City "${location}" not found. Try a different city name or be more specific.\nExamples: "New York", "London", "Tokyo", "Los Angeles"`;
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
          
          // Format sunrise/sunset times
          const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const sunset = new Date(daily.sunset[0]).toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
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
          
          return `🌍 Current Weather in ${locationName}:
${weatherEmoji} ${description}
🌡️ Temperature: ${temp}°C (feels like ${feelsLike}°C)
💧 Humidity: ${humidity}%
🌀 Pressure: ${pressure} hPa
☁️ Cloud Cover: ${cloudCover}%
💨 Wind: ${windSpeed} km/h ${getWindDirection(windDir)}${precipitation}
🌅 Sunrise: ${sunrise}
🌇 Sunset: ${sunset}

📡 Data from Open-Meteo (Free Weather API)
📍 Coordinates: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
          
        } catch (error) {
          console.error('Weather API Error:', error);
          
          // Fallback to simulated data if API fails
          const temp = Math.floor(Math.random() * 35) + 5;
          const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy'];
          const condition = conditions[Math.floor(Math.random() * conditions.length)];
          const humidity = Math.floor(Math.random() * 60) + 30;
          const wind = Math.floor(Math.random() * 20) + 5;
          
          return `❌ Weather API unavailable (${error})\n\n🌍 Simulated weather for ${location}:\n${condition}\n🌡️ Temperature: ${temp}°C\n💧 Humidity: ${humidity}%\n💨 Wind: ${wind} km/h\n\n⚠️ This is simulated data`;
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
              return `😄 Dad Joke:\n${data.joke}`;
            case 'chuck':
              return `🥋 Chuck Norris Joke:\n${data.value}`;
            case 'geek':
              return `🤓 Geek Joke:\n${data.joke}`;
            case 'general':
              if (data.type === 'single' || data.setup === undefined) {
                return `😂 General Joke:\n${data.joke || data.setup || data.punchline}`;
              } else {
                return `😂 General Joke:\n${data.setup}\n\n${data.punchline}`;
              }
            case 'developer':
              if (data.type === 'single') {
                return `💻 Developer Joke:\n${data.joke}`;
              } else if (data.type === 'twopart') {
                return `💻 Developer Joke:\n${data.setup}\n\n${data.delivery}`;
              }
              break;
            case 'jokeapi':
            default:
              if (data.type === 'single') {
                return `😂 Joke (${selectedCategory}):\n${data.joke}`;
              } else if (data.type === 'twopart') {
                return `😂 Joke (${selectedCategory}):\n${data.setup}\n\n${data.delivery}`;
              }
              break;
          }
          throw new Error('Unexpected API response format');
        } catch (error) {
          console.error('Joke API Error:', error);
          switch (category && category.toLowerCase()) {
            case 'dad':
              return `😅 Dad Joke (Offline):\nI invented a new word: Plagiarism!\n\n⚠️ API unavailable.`;
            case 'developer':
            case 'dev':
              return `😅 Developer Joke (Offline):\nWhy do programmers prefer dark mode? Because light attracts bugs!\n\n⚠️ API unavailable.`;
            case 'chuck':
            case 'chucknorris':
              return `😅 Chuck Norris Joke (Offline):\nChuck Norris can divide by zero.\n\n⚠️ API unavailable.`;
            case 'geek':
              return `😅 Geek Joke (Offline):\nThere are only 10 types of people in the world: those who understand binary and those who don't.\n\n⚠️ API unavailable.`;
            case 'general':
              return `😅 General Joke (Offline):\nWhy did the scarecrow win an award? Because he was outstanding in his field!\n\n⚠️ API unavailable.`;
            case 'random':
              return `😅 Joke (Offline):\nWhy did the chicken join a band? Because it had the drumsticks!\n\n⚠️ API unavailable or category not found.`;
            default:
              return `😅 Joke (Offline):\nWhy did the chicken join a band? Because it had the drumsticks!\n\n⚠️ API unavailable or category not found.`;
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
        
        let chars = '';
        if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) chars += '0123456789';
        if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (!chars) return 'Error: At least one character type must be enabled';
        
        let password = '';
        for (let i = 0; i < length; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return `Generated password (${length} chars): ${password}\n\nSecurity tips:\n- Don't reuse passwords\n- Use a password manager\n- Enable 2FA when possible`;
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
        
        return `QR Code generated for: "${text}"\nURL: ${qrUrl}\n\nCheck the browser console for clickable links!`;
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
              return '🌐 Opening GitHub profile: https://github.com/Beer-de-Vreeze';
            case 'itch':
              window.open('https://bjeerpeer.itch.io', '_blank');
              return '🌐 Opening Itch.io page: https://bjeerpeer.itch.io';
            case 'linkedin':
              window.open('https://linkedin.com/in/beer-de-vreeze-59040919a/', '_blank');
              return '🌐 Opening LinkedIn profile: https://linkedin.com/in/beer-de-vreeze-59040919a/';
            case 'portfolio':
              window.open('https://beer-de-vreeze.vercel.app', '_blank');
              return '🌐 Opening portfolio: https://beer-de-vreeze.vercel.app';
            case 'email':
              window.open('mailto:beer@vreeze.com', '_blank');
              return '✉️ Opening email client for: beer@vreeze.com';
            case 'cv':
              window.open('/downloads/Beer de Vreeze CV.pdf', '_blank');
              return '📄 Downloading CV: Beer de Vreeze CV.pdf';
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
                return `🌐 Opening external URL: ${destination}`;
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
            window.location.href = targetPath;
            return `🧭 Navigating to: ${targetPath}`;
          }

          return `❌ Invalid navigation target: ${destination}`;

        } catch (error) {
          return `❌ Navigation error: ${error}`;
        }
      }
    },

    {
      name: 'lorem',
      description: 'Generate placeholder text (lorem ipsum) of a given length',
      execute: (args) => {
        const words = [
          'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
          'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
          'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
          'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
          'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
          'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
          'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
          'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
        ];
        
        const count = parseInt(args[0]) || 50;
        if (count < 1 || count > 500) {
          return 'Word count must be between 1 and 500';
        }
        
        const result = [];
        for (let i = 0; i < count; i++) {
          result.push(words[Math.floor(Math.random() * words.length)]);
        }
        
        return `Lorem ipsum (${count} words):\n${result.join(' ')}.`;
      }
    },
    {
      name: 'json-validate',
      description: 'Validate and pretty-print JSON input',
      execute: (args) => {
        const jsonText = args.join(' ');
        if (!jsonText) return 'Usage: json-validate <json string>';
        
        try {
          const parsed = JSON.parse(jsonText);
          const pretty = JSON.stringify(parsed, null, 2);
          return `✅ Valid JSON:\n${pretty}`;
        } catch (error) {
          return `❌ Invalid JSON: ${error}`;
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
            return `❌ HTTP ${response.status}: ${response.statusText}`;
          }
          
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            return `✅ Fetched from ${url}:\n${JSON.stringify(data, null, 2)}`;
          } else {
            const text = await response.text();
            return `✅ Fetched from ${url}:\n${text.substring(0, 1000)}${text.length > 1000 ? '...\n(truncated)' : ''}`;
          }
        } catch (error) {
          return `❌ Fetch error: ${error}`;
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
              return `✅ Copied to clipboard: "${content}"`;
            
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
          '🎵 Never gonna give you up, never gonna let you down! 🎵',
          '🕺 You just got rick rolled! 💃',
          '📺 *Rick Astley intensifies* 🎤',
          '🎶 We\'re no strangers to love... 🎶'
        ];
        
        const rickrollUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        // Open the video in a new tab
        window.open(rickrollUrl, '_blank');
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        return `${randomMessage}\n\n🌐 Opening: ${rickrollUrl}\n\nYou know the rules, and so do I! 😄`;
      }
    },



    {
      name: 'flip',
      description: 'Flip a coin (heads or tails)',
      execute: () => {
        return `Coin flip: ${Math.random() < 0.5 ? 'Heads' : 'Tails'}`;
      }
    },
    {
      name: 'dice',
      description: 'Roll a dice (1-6 or custom sides)',
      execute: (args) => {
        const sides = parseInt(args[0]) || 6;
        return `Rolled a ${sides}-sided dice: ${Math.floor(Math.random() * sides) + 1}`;
      }
    },
    {
      name: 'palindrome',
      description: 'Check if a word or phrase is a palindrome',
      execute: (args) => {
        const text = args.join(' ').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (!text) return 'Usage: palindrome <text>';
        const isPalindrome = text === text.split('').reverse().join('');
        return isPalindrome ? 'Yes, it\'s a palindrome!' : 'No, not a palindrome.';
      }
    },
    {
      name: 'age',
      description: 'Calculate your age from birth date (usage: age <YYYY-MM-DD> or age <YYYY>)',
      execute: (args) => {
        const input = args.join(' ').trim();
        if (!input) {
          return 'Usage: age <birth date>\nFormats:\n  age 2000-08-19    (Full date: YYYY-MM-DD)\n  age 2000          (Year only)\n  age 08/19/2000    (US format: MM/DD/YYYY)\n  age 19-08-2000    (European format: DD-MM-YYYY)';
        }

        let birthDate: Date;
        const today = new Date();

        try {
          // Try different date formats
          if (/^\d{4}$/.test(input)) {
            // Year only (YYYY)
            const year = parseInt(input);
            if (year > today.getFullYear() || year < 1900) {
              return `Invalid year: ${year}. Please enter a year between 1900 and ${today.getFullYear()}.`;
            }
            birthDate = new Date(year, 0, 1); // January 1st of that year
          } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(input)) {
            // ISO format (YYYY-MM-DD)
            birthDate = new Date(input);
          } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
            // US format (MM/DD/YYYY)
            const parts = input.split('/');
            birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(input)) {
            // European format (DD-MM-YYYY)
            const parts = input.split('-');
            birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            return 'Invalid date format. Supported formats:\n  YYYY-MM-DD (e.g., 2000-08-19)\n  YYYY (e.g., 2000)\n  MM/DD/YYYY (e.g., 08/19/2000)\n  DD-MM-YYYY (e.g., 19-08-2000)';
          }

          // Validate the date
          if (isNaN(birthDate.getTime())) {
            return 'Invalid date. Please check your input.';
          }

          if (birthDate > today) {
            return 'Birth date cannot be in the future!';
          }

          // Calculate age
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          // Calculate days until next birthday
          const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
          }
          
          const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Calculate total days lived
          const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
          
          let result = `🎂 Age Calculation:
Age: ${age} years old
Birth date: ${birthDate.toLocaleDateString('en-GB')}
Days lived: ${totalDays.toLocaleString()} days`;

          if (daysUntilBirthday === 0) {
            result += '\n🎉 Happy Birthday! 🎉';
          } else {
            result += `\nNext birthday: ${daysUntilBirthday} days`;
          }

          return result;

        } catch (error) {
          return `Error parsing date: ${error}. Please use a valid date format.`;
        }
      }
    },
    {
      name: 'reverse',
      description: 'Reverse any text',
      execute: (args) => {
        const text = args.join(' ');
        if (!text) return 'Usage: reverse <text>';
        return text.split('').reverse().join('');
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
        
        return `QR Code generated for: "${text}"\nURL: ${qrUrl}\n\nCheck the browser console for clickable links!`;
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
          addToHistory('🎮 Konami Code activated! Welcome to the developer console.', 'info');
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

  // Add to command history (no repeats)
  const executeCommand = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const [commandName, ...args] = trimmedInput.split(' ');
    const command = commands.find(cmd => cmd.name === commandName.toLowerCase());

    if (command) {
      try {
        const result = await command.execute(args);
        addToHistory(result, 'command', trimmedInput);
      } catch (error) {
        addToHistory(`Error: ${error}`, 'error', trimmedInput);
      }
    } else {
      addToHistory(`Unknown command: ${commandName}. Type "help" for available commands.`, 'error', trimmedInput);
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