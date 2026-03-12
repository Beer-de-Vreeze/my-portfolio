'use client';

import React from 'react';
import styles from '../../../styles/DevConsole.module.css';

interface ConsoleHeaderProps {
  onClose: () => void;
}

const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({ onClose }) => (
  <div className={styles.header}>
    <div className={styles.title}>
      <span className={styles.icon}>🎮</span>
      Developer Console
    </div>
    <button
      className={styles.closeButton}
      onClick={onClose}
      title="Press ESC to close"
    >
      ×
    </button>
  </div>
);

export default ConsoleHeader;
