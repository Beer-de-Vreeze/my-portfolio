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
            { name: 'navigate', desc: 'Navigate to pages or custom paths (navigate <page>)' }
          ],
          'System Information': [
            { name: 'info', desc: 'Show system information' },
            { name: 'time', desc: 'Show current time' },
            { name: 'performance', desc: 'Show performance metrics' },
            { name: 'network', desc: 'Show network information and test connectivity' }
          ],
          'Developer Tools': [
            { name: 'inspect', desc: 'Inspect element properties (hover, click, focus)' },
            { name: 'storage', desc: 'Manage local storage (list, get, set, remove, clear)' },
            { name: 'calc', desc: 'Calculator (supports +, -, *, /, %, sqrt, pow)' },
            { name: 'encode', desc: 'Encode/decode text (base64, url, html)' }
          ],
          'Generators & Utilities': [
            { name: 'random', desc: 'Generate random data (number, string, color, password)' },
            { name: 'password', desc: 'Generate secure passwords with custom options' },
            { name: 'qrcode', desc: 'Generate a QR code URL for text' },
            { name: 'colors', desc: 'Fun with colors! Try: rainbow, gradient, random, palette' },
            { name: 'weather', desc: 'Get real weather information for any city' }
          ],
          'Fun & Entertainment': [
            { name: 'joke', desc: 'Get a random joke (programming, general, dad, or specific category)' }
          ]
        };

        let output = 'Developer Console - Available Commands:\n\n';
        
        Object.entries(categories).forEach(([category, commands]) => {
          output += `${category}:\n`;
          commands.forEach(cmd => {
            output += `  ${cmd.name.padEnd(12)} - ${cmd.desc}\n`;
          });
          output += '\n';
        });

        output += 'Tips:\n';
        output += '  • Use ↑↓ arrows to navigate command history\n';
        output += '  • Press ESC or type "exit" to close console\n';
        output += '  • Try "joke programming" or "weather London" for examples\n';
        output += '  • Use "calc 2 + 2" for quick calculations\n\n';
        output += 'Example commands:\n';
        output += '  weather New York\n';
        output += '  joke dad\n';
        output += '  random color\n';
        output += '  encode base64 Hello World\n';
        output += '  navigate about\n';
        output += '  navigate 404\n';
        output += '  qrcode https://github.com';

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
        return new Date().toLocaleString();
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
      name: 'inspect',
      description: 'Inspect element properties (hover, click, focus)',
      execute: (args) => {
        const mode = args[0] || 'hover';
        let isInspecting = false;
        
        const handleInspect = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          
          const target = event.target as HTMLElement;
          const info = [
            `Tag: ${target.tagName.toLowerCase()}`,
            `ID: ${target.id || 'none'}`,
            `Classes: ${target.className || 'none'}`,
            `Text: ${target.textContent?.slice(0, 50) || 'none'}`,
            `Position: ${target.getBoundingClientRect().x}x${target.getBoundingClientRect().y}`,
            `Size: ${target.offsetWidth}x${target.offsetHeight}`,
            `Z-index: ${getComputedStyle(target).zIndex}`,
            `Display: ${getComputedStyle(target).display}`,
          ];
          
          console.log(`Element Inspector`, 'font-weight: bold; color: #ff6b35;', target);
          console.log(info.join('\n'));
          
          // Remove the event listener after first use
          document.removeEventListener(mode, handleInspect, true);
          isInspecting = false;
        };
        
        if (!isInspecting) {
          document.addEventListener(mode, handleInspect, true);
          isInspecting = true;
          return `Inspector activated! ${mode} on any element to inspect it.`;
        }
        
        return 'Inspector already active';
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
          
          case 'uuid':
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
            return `Random UUID: ${uuid}`;
          
          default:
            return 'Usage: random <number|string|color|password|uuid> [length/min] [max]';
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
      execute: async (args) => {
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
          const sunrise = new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const sunset = new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
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
      description: 'Get a random joke (programming, general, dad, or specific category)',
      execute: async (args) => {
        const category = args[0] || 'programming';
        
        try {
          let apiUrl = '';
          
          switch (category.toLowerCase()) {
            case 'programming':
            case 'code':
            case 'dev':
              // JokeAPI for programming jokes
              apiUrl = 'https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single';
              break;
              
            case 'dad':
              // icanhazdadjoke API
              apiUrl = 'https://icanhazdadjoke.com/';
              break;
              
            case 'general':
            case 'random':
            default:
              // Official Joke API
              apiUrl = 'https://official-joke-api.appspot.com/random_joke';
              break;
          }
          
          const response = await fetch(apiUrl, {
            headers: category === 'dad' ? { 'Accept': 'application/json' } : {}
          });
          
          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }
          
          const data = await response.json();
          
          // Handle different API response formats
          if (category === 'dad') {
            return `😄 Dad Joke:\n${data.joke}\n\n🎯 From: icanhazdadjoke.com`;
          } else if (category === 'programming' || category === 'code' || category === 'dev') {
            if (data.type === 'single') {
              return `💻 Programming Joke:\n${data.joke}\n\n🎯 From: JokeAPI`;
            } else if (data.type === 'twopart') {
              return `💻 Programming Joke:\n${data.setup}\n\n${data.delivery}\n\n🎯 From: JokeAPI`;
            }
          } else {
            // Official Joke API format
            return `😂 Random Joke:\n${data.setup}\n\n${data.punchline}\n\n🎯 From: Official Joke API`;
          }
          
          // Fallback if API response format is unexpected
          throw new Error('Unexpected API response format');
          
        } catch (error) {
          console.error('Joke API Error:', error);
          
          // Fallback to local jokes
          const fallbackJokes = category === 'programming' || category === 'code' || category === 'dev' ? [
            'Why do programmers prefer dark mode? Because light attracts bugs!',
            'How many programmers does it take to change a light bulb? None, that\'s a hardware problem!',
            'Why do Java developers wear glasses? Because they can\'t C#!',
            'What\'s a programmer\'s favorite hangout place? Foo Bar!',
            'Why did the programmer quit his job? He didn\'t get arrays!'
          ] : category === 'dad' ? [
            'I invented a new word: Plagiarism!',
            'Did you hear about the mathematician who\'s afraid of negative numbers? He\'ll stop at nothing to avoid them!',
            'Why don\'t scientists trust atoms? Because they make up everything!',
            'I told my wife she was drawing her eyebrows too high. She seemed surprised.',
            'What do you call a fake noodle? An impasta!'
          ] : [
            'Why don\'t scientists trust atoms? Because they make up everything!',
            'What did the ocean say to the beach? Nothing, it just waved!',
            'Why do we tell actors to "break a leg?" Because every play has a cast!',
            'What\'s the best thing about Switzerland? I don\'t know, but the flag is a big plus!',
            'Why did the scarecrow win an award? He was outstanding in his field!'
          ];
          
          const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
          return `😅 ${category === 'dad' ? 'Dad' : category === 'programming' ? 'Programming' : 'Random'} Joke (Offline):\n${randomJoke}\n\n⚠️ API unavailable - using local jokes`;
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

Error pages:
  404, not-found           - Trigger 404 error page
  500, error               - Trigger 500 error page

Custom paths:
  navigate /custom/path    - Navigate to any custom path
  navigate https://...     - Navigate to external URL

Examples:
  navigate about
  navigate projects
  navigate 404
  navigate /custom/page
  navigate https://github.com`;
        }

        try {
          let targetPath = '';

          // Handle predefined pages
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
            
            // Error pages
            case '404':
            case 'not-found':
              targetPath = '/404';
              break;
            case '500':
            case 'error':
              targetPath = '/500';
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
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
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

  // Focus input when console opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

    // Add to command history
    setCommandHistory(prev => [trimmedInput, ...prev].slice(0, 50)); // Keep last 50 commands
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