'use client';

import React, { RefObject } from 'react';
import styles from '../../../styles/DevConsole.module.css';

interface Suggestion {
  name: string;
  description: string;
}

interface ConsoleInputProps {
  currentInput: string;
  suggestions: Suggestion[];
  selectedSuggestion: number;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSuggestionClick: (name: string) => void;
}

const ConsoleInput: React.FC<ConsoleInputProps> = ({
  currentInput,
  suggestions,
  selectedSuggestion,
  inputRef,
  onChange,
  onSubmit,
  onSuggestionClick,
}) => (
  <>
    <div style={{ position: 'relative' }}>
      <form onSubmit={onSubmit} className={styles.inputForm}>
        <span className={styles.prompt}>{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
          placeholder="Type 'help' for commands..."
          autoComplete="off"
          spellCheck={false}
        />
      </form>

      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#222',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: 4,
            zIndex: 1000,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.name}
              style={{
                padding: '8px 12px',
                background: i === selectedSuggestion ? '#333' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseDown={() => onSuggestionClick(s.name)}
            >
              <span style={{ fontWeight: 'bold' }}>{s.name}</span>
              <span style={{ marginLeft: 8, opacity: 0.7 }}>{s.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className={styles.footer}>
      <span>
        Press ESC to close • ↑↓ for command history • Type &quot;help&quot; for commands
      </span>
    </div>
  </>
);

export default ConsoleInput;
