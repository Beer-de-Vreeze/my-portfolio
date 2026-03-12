'use client';

import React, { RefObject } from 'react';
import he from 'he';
import { ConsoleHistory as HistoryEntry } from './types';
import styles from '../../../styles/DevConsole.module.css';

interface ConsoleHistoryProps {
  history: HistoryEntry[];
  historyRef: RefObject<HTMLDivElement | null>;
}

const ConsoleHistoryList: React.FC<ConsoleHistoryProps> = ({ history, historyRef }) => (
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
          {entry.output.includes('<img') ||
          entry.output.includes('<div') ||
          entry.output.includes('<a') ||
          entry.output.includes('href=') ? (
            <div
              dangerouslySetInnerHTML={{
                __html: he.decode(entry.output).replace(/\n/g, '<br>'),
              }}
            />
          ) : (
            <pre>{entry.output}</pre>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default ConsoleHistoryList;
