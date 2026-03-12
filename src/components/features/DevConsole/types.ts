import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Dispatch, SetStateAction } from 'react';

export interface Command {
  name: string;
  description: string;
  execute: (args: string[]) => string | Promise<string>;
}

export interface ConsoleHistory {
  input: string;
  output: string;
  timestamp: Date;
  type: 'command' | 'error' | 'info';
}

export interface PendingTrivia {
  question: string;
  answers: string[];
  correctAnswer: string;
  correctIndex: number;
  category: string;
  difficulty: string;
}

export interface CommandContext {
  router: AppRouterInstance;
  history: ConsoleHistory[];
  setHistory: Dispatch<SetStateAction<ConsoleHistory[]>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  consoleSessionStart: number | null;
  setConsoleSessionStart: Dispatch<SetStateAction<number | null>>;
  pageLoadTime: number | null;
  pendingTrivia: PendingTrivia | null;
  setPendingTrivia: Dispatch<SetStateAction<PendingTrivia | null>>;
  /** Lazy getter — returns the full commands array after it has been assembled */
  getCommands: () => Command[];
}
