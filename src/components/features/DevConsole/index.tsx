'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import Fuse from 'fuse.js';
import stringArgv from 'string-argv';
import styles from '../../../styles/DevConsole.module.css';

import { Command, ConsoleHistory, PendingTrivia, CommandContext } from './types';
import { makeLinksClickable, useIsMobile } from './utils';
import { createCommands } from './commands';
import ConsoleHeader from './ConsoleHeader';
import ConsoleHistoryList from './ConsoleHistoryList';
import ConsoleInput from './ConsoleInput';

// ─────────────────────────────────────────────────────────────────────
// DevConsoleDesktop — the full console UI (desktop only)
// ─────────────────────────────────────────────────────────────────────
const DevConsoleDesktop: React.FC = () => {
  const router = useRouter();

  // ── state ──────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [consoleSessionStart, setConsoleSessionStart] = useState<number | null>(null);
  const [history, setHistory] = useState<ConsoleHistory[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);
  const [pendingTrivia, setPendingTrivia] = useState<PendingTrivia | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; description: string }[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // commandsRef breaks the circular dependency: commands need to know the
  // full list (for help / search), but the list can only be built after
  // getCommands is defined.  We update commandsRef right after creation.
  const commandsRef = useRef<Command[]>([]);

  // ── initialize page load time ────────────────────────────────────
  useEffect(() => {
    setPageLoadTime(Date.now());
  }, []);

  // ── argument parser ───────────────────────────────────────────────
  const parseArgs = (input: string) => {
    try {
      const tokens = stringArgv(input);
      const args: string[] = [];
      const options: { [key: string]: string | boolean | number | string[] } = {};

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.startsWith('--')) {
          const optionPart = token.slice(2);
          if (optionPart.includes('=')) {
            const [key, value] = optionPart.split('=', 2);
            options[key] = isNaN(Number(value)) ? value : Number(value);
          } else {
            const nextToken = tokens[i + 1];
            if (nextToken && !nextToken.startsWith('-')) {
              options[optionPart] = isNaN(Number(nextToken)) ? nextToken : Number(nextToken);
              i++;
            } else {
              options[optionPart] = true;
            }
          }
        } else if (token.startsWith('-') && token.length > 1) {
          for (const opt of token.slice(1)) options[opt] = true;
        } else {
          args.push(token);
        }
      }

      return { _: args, ...options };
    } catch {
      const tokens = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      return { _: tokens.map((t) => t.replace(/^"|"$/g, '')) };
    }
  };

  // ── Konami Code sequence ──────────────────────────────────────────
  const KONAMI_CODE = React.useMemo(
    () => [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA',
    ],
    [],
  );

  // ── addToHistory ─────────────────────────────────────────────────
  const addToHistory = useCallback(
    (output: string, type: 'command' | 'error' | 'info' = 'command', input?: string) => {
      const processedOutput =
        output.includes('<a') || output.includes('href=')
          ? output
          : makeLinksClickable(output);

      setHistory((prev) => [
        ...prev,
        { input: input || '', output: processedOutput, timestamp: new Date(), type },
      ]);

      if (processedOutput.includes('<img')) {
        setTimeout(() => {
          if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
          }
        }, 100);
      }
    },
    [],
  );

  // ── check if console should reopen after reload ────────────────────
  useEffect(() => {
    const shouldReopen = localStorage.getItem('devConsole_reopenAfterReload');
    if (shouldReopen === 'true') {
      localStorage.removeItem('devConsole_reopenAfterReload');
      setIsOpen(true);
      track('dev_console_opened', {
        method: 'reload_reopen',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      });
      setConsoleSessionStart(Date.now());
      addToHistory('Console reopened after page reload.', 'info');
    }
  }, [addToHistory]);

  // ── build CommandContext + commands ───────────────────────────────
  // ctx is rebuilt every render so commands always read up-to-date state.
  // (Matches original behaviour where `const commands = [...]` was inline.)
  const ctx: CommandContext = {
    router,
    history,
    setHistory,
    setIsOpen,
    consoleSessionStart,
    setConsoleSessionStart,
    pageLoadTime,
    pendingTrivia,
    setPendingTrivia,
    getCommands: () => commandsRef.current,
  };

  const commands = createCommands(ctx);
  // Keep the ref up-to-date so help/search can read the current list
  commandsRef.current = commands;

  // ── autocomplete ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentInput) {
      setSuggestions([]);
      setSelectedSuggestion(-1);
      return;
    }
    const input = currentInput.trim().toLowerCase();
    if (!input) {
      setSuggestions([]);
      setSelectedSuggestion(-1);
      return;
    }
    const matches = commands
      .filter((cmd) => cmd.name.startsWith(input))
      .map((cmd) => ({ name: cmd.name, description: cmd.description }));
    setSuggestions(matches);
    setSelectedSuggestion(matches.length ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInput]); // `commands` intentionally omitted — recreated every render, never changes meaningfully

  // ── Konami code detection ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen) return;
      const newSequence = [...konamiSequence, event.code];
      if (newSequence.length > KONAMI_CODE.length) newSequence.shift();
      setKonamiSequence(newSequence);

      if (newSequence.length === KONAMI_CODE.length) {
        const matches = newSequence.every((key, i) => key === KONAMI_CODE[i]);
        if (matches) {
          event.preventDefault();
          setIsOpen(true);
          setKonamiSequence([]);
          track('dev_console_opened', {
            method: 'konami_code',
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          });
          setConsoleSessionStart(Date.now());
          addToHistory('Konami Code activated! Welcome to the developer console.', 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiSequence, isOpen, KONAMI_CODE, addToHistory]);

  // ── console key events (ESC / arrows / Tab) ───────────────────────
  useEffect(() => {
    const handleConsoleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        if (consoleSessionStart) {
          const dur = Date.now() - consoleSessionStart;
          track('dev_console_session', {
            duration_ms: dur,
            duration_seconds: Math.round(dur / 1000),
            commands_executed: history.filter((h) => h.type === 'command').length,
            timestamp: new Date().toISOString(),
            closed_method: 'escape_key',
          });
        }
        setIsOpen(false);
        setCurrentInput('');
        setHistoryIndex(-1);
        setConsoleSessionStart(null);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion((prev) => Math.max(prev - 1, 0));
        } else if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1 ? commandHistory.length - 1 : Math.max(historyIndex - 1, 0);
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (historyIndex >= 0 && historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        } else if (historyIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setCurrentInput('');
        }
      } else if (event.key === 'Tab') {
        if (suggestions.length > 0 && selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
          event.preventDefault();
          setCurrentInput(suggestions[selectedSuggestion].name + ' ');
          setSuggestions([]);
          setSelectedSuggestion(-1);
        }
      }
    };

    window.addEventListener('keydown', handleConsoleKeyDown);
    return () => window.removeEventListener('keydown', handleConsoleKeyDown);
  }, [isOpen, commandHistory, historyIndex, consoleSessionStart, history, suggestions, selectedSuggestion]);

  // ── cleanup: track session on unmount ────────────────────────────
  useEffect(() => {
    return () => {
      if (consoleSessionStart && isOpen) {
        const dur = Date.now() - consoleSessionStart;
        track('dev_console_session', {
          duration_ms: dur,
          duration_seconds: Math.round(dur / 1000),
          commands_executed: history.filter((h) => h.type === 'command').length,
          timestamp: new Date().toISOString(),
          closed_method: 'page_unload',
        });
      }
    };
  }, [consoleSessionStart, isOpen, history]);

  // ── auto-scroll to bottom ─────────────────────────────────────────
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // ── focus input when console opens ───────────────────────────────
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setCurrentInput('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // ── executeCommand ────────────────────────────────────────────────
  const executeCommand = async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const parsed = parseArgs(trimmedInput);
    const commandName = parsed._[0] as string;
    const args = parsed._.slice(1).map(String);

    Object.entries(parsed).forEach(([key, value]) => {
      if (key !== '_' && key !== '--') {
        if (typeof value === 'boolean') {
          if (value) args.push(`--${key}`);
        } else {
          args.push(`--${key}`);
          if (Array.isArray(value)) args.push(...value.map(String));
          else args.push(String(value));
        }
      }
    });

    // Short-circuit single-letter trivia answers
    if (
      pendingTrivia &&
      trimmedInput.length === 1 &&
      ['A', 'B', 'C', 'D'].includes(trimmedInput.toUpperCase())
    ) {
      const triviaAnswerCommand = commands.find((cmd) => cmd.name === 'trivia-answer');
      if (triviaAnswerCommand) {
        try {
          const result = await triviaAnswerCommand.execute([trimmedInput.toUpperCase()]);
          addToHistory(result, 'command', trimmedInput);
        } catch (error) {
          addToHistory(`Error: ${error}`, 'error', trimmedInput);
        }
        setCommandHistory((prev) =>
          prev[prev.length - 1] !== trimmedInput ? [...prev, trimmedInput] : prev,
        );
        setHistoryIndex(-1);
        return;
      }
    }

    const command = commands.find((cmd) => cmd.name === commandName?.toLowerCase());

    if (command) {
      try {
        const result = await command.execute(args);
        addToHistory(result, 'command', trimmedInput);
        track('dev_console_command', {
          command_name: commandName?.toLowerCase(),
          args_count: args.length,
          timestamp: new Date().toISOString(),
          has_args: args.length > 0,
        });
      } catch (error) {
        addToHistory(`Error: ${error}`, 'error', trimmedInput);
        track('dev_console_error', {
          command_name: commandName?.toLowerCase(),
          error_type: 'execution_error',
          timestamp: new Date().toISOString(),
        });
      }
    } else if (commandName) {
      const fuse = new Fuse(commands, { keys: ['name'], threshold: 0.6, includeScore: true });
      const fuzzyResults = fuse.search(commandName);

      if (fuzzyResults.length > 0 && fuzzyResults[0].score! < 0.6) {
        const suggestion = fuzzyResults[0].item.name;
        addToHistory(
          `Unknown command: ${commandName}. Did you mean "${suggestion}"? Type "help" for available commands.`,
          'error',
          trimmedInput,
        );
        track('dev_console_unknown_command', {
          attempted_command: commandName?.toLowerCase(),
          suggested_command: suggestion,
          timestamp: new Date().toISOString(),
        });
      } else {
        addToHistory(
          `Unknown command: ${commandName}. Type "help" for available commands.`,
          'error',
          trimmedInput,
        );
        track('dev_console_unknown_command', {
          attempted_command: commandName?.toLowerCase(),
          suggested_command: null,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      addToHistory('Unknown command. Type "help" for available commands.', 'error', trimmedInput);
    }

    setCommandHistory((prev) =>
      prev[prev.length - 1] !== trimmedInput
        ? [...prev, trimmedInput].slice(-50)
        : prev,
    );
    setHistoryIndex(-1);
    setCurrentInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
  };

  const handleClose = () => {
    if (consoleSessionStart) {
      const dur = Date.now() - consoleSessionStart;
      track('dev_console_session', {
        duration_ms: dur,
        duration_seconds: Math.round(dur / 1000),
        commands_executed: history.filter((h) => h.type === 'command').length,
        timestamp: new Date().toISOString(),
        closed_method: 'close_button',
      });
    }
    setIsOpen(false);
    setConsoleSessionStart(null);
  };

  // ── render ────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.console}>
        <ConsoleHeader onClose={handleClose} />

        <ConsoleHistoryList history={history} historyRef={historyRef} />

        <ConsoleInput
          currentInput={currentInput}
          suggestions={suggestions}
          selectedSuggestion={selectedSuggestion}
          inputRef={inputRef}
          onChange={setCurrentInput}
          onSubmit={handleSubmit}
          onSuggestionClick={(name) => {
            setCurrentInput(name + ' ');
            setSuggestions([]);
            setSelectedSuggestion(-1);
          }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// DevConsoleWrapper — skips render on mobile / SSR
// ─────────────────────────────────────────────────────────────────────
const DevConsoleWrapper: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isMobile) return null;

  return <DevConsoleDesktop />;
};

export default DevConsoleWrapper;
