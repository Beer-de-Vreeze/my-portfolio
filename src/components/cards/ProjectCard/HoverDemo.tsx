'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Per-project interactive hover demos. Each demo only runs its animation
 * loop while `active` is true and cancels its requestAnimationFrame both
 * when the hover ends and on unmount.
 */

interface DemoProps {
  active: boolean;
}

// ── Demo 1: Unity Audio Previewer — animated waveform ───────────────────────
const BAR_COUNT = 32;

const AudioDemo = ({ active }: DemoProps) => {
  // Heights are mutated directly on the DOM in the rAF loop instead of going
  // through React state — avoids 60 re-renders/second of 32 elements.
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const bars = barsRef.current?.children;
    if (!bars) return;
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.05;
      for (let i = 0; i < bars.length; i++) {
        const h = 20 + Math.sin(t + i * 0.4) * 15 + Math.sin(t * 1.5 + i * 0.2) * 10;
        (bars[i] as HTMLElement).style.height = `${h}px`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <div ref={barsRef} className="flex items-end gap-0.5 h-16">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-none"
            style={{
              height: '20px',
              background: `hsl(${200 + i * 4}, 80%, 60%)`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">Audio Previewer</p>
    </div>
  );
};

// ── Demo 2: LP-Cafe — looping dialogue typewriter ────────────────────────────
const LINES = [
  { speaker: 'Beer-chan', text: "HIIIIIIIIIIIII, I'm Beer..." },
  { speaker: 'Beer-chan', text: 'You can call me Beer-chan ♡' },
  { speaker: 'Beer-chan', text: "Don't you absolutely LOVE these plants? purr~" },
  { speaker: 'Beer-chan', text: 'You look like an absolute DOLL' },
  { speaker: 'Beer-chan', text: 'Now tell me how much you love cats~' },
];

const DialogueDemo = ({ active }: DemoProps) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!active) return;
    const line = LINES[lineIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isPaused) {
      // Pause 1.5s on the completed line, then move to the next one.
      timeout = setTimeout(() => {
        setIsPaused(false);
        setCharIndex(0);
        setLineIndex((i) => (i + 1) % LINES.length);
      }, 1500);
    } else if (charIndex < line.text.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 40);
    } else {
      setIsPaused(true);
    }

    return () => clearTimeout(timeout);
  }, [active, lineIndex, charIndex, isPaused]);

  const line = LINES[lineIndex];

  return (
    <div className="bg-black/80 border border-white/10 rounded-xl px-4 py-3 w-48 backdrop-blur-sm">
      <p className="text-xs font-bold text-blue-400 mb-1">{line.speaker}</p>
      <p className="text-xs text-gray-200">
        {line.text.slice(0, charIndex)}
        {!isPaused && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
};

// ── Demo 3: ML-Agents — agent chasing pellets on a grid ─────────────────────
const MLDemo = ({ active }: DemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const agent = { x: 80, y: 60 };
    let pellet = { x: Math.random() * 140 + 10, y: Math.random() * 100 + 10 };
    let frame: number;

    const animate = () => {
      ctx.clearRect(0, 0, 160, 120);

      // Grid background
      ctx.strokeStyle = 'rgba(59,130,246,0.1)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < 160; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 120); ctx.stroke();
      }
      for (let y = 0; y < 120; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(160, y); ctx.stroke();
      }

      // Steer agent toward pellet
      const dx = pellet.x - agent.x;
      const dy = pellet.y - agent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        pellet = { x: Math.random() * 140 + 10, y: Math.random() * 100 + 10 };
      } else {
        agent.x += (dx / dist) * 1.5;
        agent.y += (dy / dist) * 1.5;
      }

      // Draw pellet
      ctx.beginPath();
      ctx.arc(pellet.x, pellet.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Draw agent
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw trail
      ctx.beginPath();
      ctx.moveTo(agent.x, agent.y);
      ctx.lineTo(pellet.x, pellet.y);
      ctx.strokeStyle = 'rgba(59,130,246,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={160} height={120} className="rounded-lg" />
      <p className="text-xs text-gray-400 mt-2">Reinforcement Learning</p>
    </div>
  );
};

// ── Demo 4: Portfolio website — miniature twinkling starfield ────────────────
const WebsiteDemo = ({ active }: DemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars = Array.from({ length: 30 }, () => ({
      x: Math.random() * 160,
      y: Math.random() * 120,
      r: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
    }));

    let frame: number;
    let t = 0;

    const animate = () => {
      t += 0.016;

      // Background nebula
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, 160, 120);

      const grad = ctx.createRadialGradient(40, 30, 0, 40, 30, 80);
      grad.addColorStop(0, 'rgba(59,130,246,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 160, 120);

      const grad2 = ctx.createRadialGradient(120, 90, 0, 120, 90, 60);
      grad2.addColorStop(0, 'rgba(139,92,246,0.12)');
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, 160, 120);

      // Stars
      stars.forEach((star) => {
        const opacity = 0.4 + Math.sin(t * star.speed * 60 + star.phase) * 0.4;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={160} height={120} className="rounded-lg" />
      <p className="text-xs text-gray-400 mt-2">Built with Next.js</p>
    </div>
  );
};

// ── Demo 5: Bearly Stealthy — sweeping vision cone stealth sim ───────────────
const BearlyDemo = ({ active }: DemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hunter = { x: 40, y: 60 };
    const bear = { x: 130, y: 60 };
    let coneAngle = 0;
    let frame: number;
    let t = 0;
    let bearAlerted = false;

    const animate = () => {
      t += 0.02;
      ctx.clearRect(0, 0, 160, 120);

      // Background
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, 160, 120);

      // Cone sweep
      coneAngle = Math.sin(t) * 0.6;
      const coneLength = 80;
      const halfAngle = 0.35;

      // Check if bear is in cone
      const bearAngle = Math.atan2(bear.y - hunter.y, bear.x - hunter.x);
      const angleDiff = Math.abs(bearAngle - coneAngle);
      const dist = Math.sqrt((bear.x - hunter.x) ** 2 + (bear.y - hunter.y) ** 2);
      bearAlerted = angleDiff < halfAngle && dist < coneLength;

      // Draw cone
      ctx.beginPath();
      ctx.moveTo(hunter.x, hunter.y);
      ctx.arc(hunter.x, hunter.y, coneLength, coneAngle - halfAngle, coneAngle + halfAngle);
      ctx.closePath();
      ctx.fillStyle = bearAlerted ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)';
      ctx.fill();
      ctx.strokeStyle = bearAlerted ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw hunter
      ctx.beginPath();
      ctx.arc(hunter.x, hunter.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Draw bear
      ctx.beginPath();
      ctx.arc(bear.x, bear.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = bearAlerted ? '#ef4444' : '#8b5cf6';
      ctx.fill();

      // Labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px monospace';
      ctx.fillText('HUNTER', hunter.x - 14, hunter.y + 18);
      ctx.fillText('BEAR', bear.x - 10, bear.y + 18);

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={160} height={120} className="rounded-lg" />
      <p className="text-xs text-gray-400 mt-2">Stealth AI System</p>
    </div>
  );
};

// ── Demo 6: Sketchin' Spells — interactive glowing draw trail ────────────────
const SketchinDemo = ({ active }: DemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number; t: number; hue: number }[]>([]);
  const frameRef = useRef<number | undefined>(undefined);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointsRef.current.push({
      x,
      y,
      t: Date.now(),
      hue: (pointsRef.current.length * 3) % 360,
    });
  };

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, 160, 100);

      // Draw fading trail
      const points = pointsRef.current.filter((p) => now - p.t < 2000);
      pointsRef.current = points;

      for (let i = 1; i < points.length; i++) {
        const age = (now - points[i].t) / 2000;
        const opacity = 1 - age;
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
        ctx.strokeStyle = `hsla(${points[i].hue}, 80%, 60%, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.moveTo(points[i - 1].x, points[i - 1].y);
        ctx.lineTo(points[i].x, points[i].y);
        ctx.strokeStyle = `hsla(${points[i].hue}, 80%, 70%, ${opacity * 0.3})`;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={160}
        height={100}
        className="rounded-lg cursor-crosshair"
        onMouseMove={handleMouseMove}
        style={{ pointerEvents: 'auto' }}
      />
      <p className="text-xs text-gray-400 mt-2">Move your mouse to draw</p>
    </div>
  );
};

// ── Demo 7: Tetris — auto-playing falling pieces ─────────────────────────────
const PIECES = [
  { shape: [[1, 1, 1, 1]], color: '#06b6d4' },               // I
  { shape: [[1, 1], [1, 1]], color: '#f59e0b' },             // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#8b5cf6' },       // T
  { shape: [[1, 0], [1, 0], [1, 1]], color: '#f97316' },     // L
  { shape: [[0, 1], [0, 1], [1, 1]], color: '#3b82f6' },     // J
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },       // S
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },       // Z
];

const CELL = 8;
const COLS = 10;
const ROWS = 15;

const TetrisDemo = ({ active }: DemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pre-filled board rows at bottom
    const board: (string | null)[][] = Array.from({ length: ROWS }, (_, r) =>
      r > ROWS - 5
        ? Array.from({ length: COLS }, () =>
            Math.random() > 0.3 ? ['#374151', '#1f2937'][Math.floor(Math.random() * 2)] : null
          )
        : Array(COLS).fill(null)
    );

    let pieceIndex = 0;
    let piece = PIECES[pieceIndex];
    let pieceX = Math.floor((COLS - piece.shape[0].length) / 2);
    let pieceY = 0;
    let frame: number;
    let lastDrop = Date.now();

    const animate = () => {
      const now = Date.now();

      // Drop piece every 600ms
      if (now - lastDrop > 600) {
        pieceY++;
        lastDrop = now;

        // Check collision with bottom or filled cells
        let collision = false;
        for (let r = 0; r < piece.shape.length; r++) {
          for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
              if (pieceY + r >= ROWS || board[pieceY + r]?.[pieceX + c]) {
                collision = true;
              }
            }
          }
        }

        if (collision) {
          pieceY--;
          // Lock piece
          for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
              if (piece.shape[r][c] && pieceY + r >= 0) {
                board[pieceY + r][pieceX + c] = piece.color;
              }
            }
          }
          // Clear full rows
          for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every((cell) => cell !== null)) {
              board.splice(r, 1);
              board.unshift(Array(COLS).fill(null));
            }
          }
          // Next piece
          pieceIndex = (pieceIndex + 1) % PIECES.length;
          piece = PIECES[pieceIndex];
          pieceX = Math.floor((COLS - piece.shape[0].length) / 2);
          pieceY = 0;
        }
      }

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
        }
      }

      // Board cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = board[r][c];
          if (cell) {
            ctx.fillStyle = cell;
            ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }

      // Active piece
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillStyle = piece.color;
            ctx.fillRect((pieceX + c) * CELL + 1, (pieceY + r) * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-lg" />
      <p className="text-xs text-gray-400 mt-2">Super Rotation System</p>
    </div>
  );
};

// ── Demo 8: Bunq Voice — listening voice-assistant pulse + waveform ──────────
const BunqVoiceDemo = ({ active }: DemoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = 80;
    const cy = 50;
    let frame: number;
    let t = 0;

    const animate = () => {
      t += 0.02;
      ctx.clearRect(0, 0, 160, 120);

      // Expanding sonar rings — the "listening" pulse
      for (let i = 0; i < 3; i++) {
        const phase = ((t + i * 0.6) % 1.8) / 1.8; // 0..1
        const r = 10 + phase * 44;
        const alpha = (1 - phase) * 0.45;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Mic core — gentle blue→green pulse
      const pulse = 1 + Math.sin(t * 4) * 0.08;
      const grad = ctx.createLinearGradient(cx - 10, cy - 10, cx + 10, cy + 10);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#22c55e');
      ctx.beginPath();
      ctx.arc(cx, cy, 9 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Reactive voice waveform along the bottom
      const baseY = 100;
      ctx.beginPath();
      for (let x = 0; x <= 160; x += 3) {
        const amp = 7 * Math.sin(x * 0.18 + t * 6) * Math.sin(t * 2 + x * 0.02);
        const y = baseY + amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(34,197,94,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={160} height={120} className="rounded-lg" />
      <p className="text-xs text-gray-400 mt-2">Voice Banking</p>
    </div>
  );
};

// ── Demo registry ─────────────────────────────────────────────────────────────
const DEMOS: Record<string, { Component: React.ComponentType<DemoProps>; staticLabel: string }> = {
  'Bunq-Voice': { Component: BunqVoiceDemo, staticLabel: 'Voice Banking' },
  'Unity Audio Previewer': { Component: AudioDemo, staticLabel: 'Audio Previewer' },
  'LP-Cafe': { Component: DialogueDemo, staticLabel: 'Visual Novel Dialogue' },
  'ML-Agents': { Component: MLDemo, staticLabel: 'Reinforcement Learning' },
  'portfolio-website': { Component: WebsiteDemo, staticLabel: 'Built with Next.js' },
  'Bearly-Stealthy': { Component: BearlyDemo, staticLabel: 'Stealth AI System' },
  'sketchin-spells': { Component: SketchinDemo, staticLabel: 'Spell Drawing System' },
  'Better-Tetris': { Component: TetrisDemo, staticLabel: 'Super Rotation System' },
};

interface HoverDemoProps {
  projectId: string;
  isHovered: boolean;
}

export default function HoverDemo({ projectId, isHovered }: HoverDemoProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const demo = DEMOS[projectId];
  if (!demo) return null;

  const { Component, staticLabel } = demo;
  // Only the Sketchin' Spells demo captures the pointer (to draw); all
  // others must not block clicks on the underlying card.
  const interactive = projectId === 'sketchin-spells' && !prefersReducedMotion;

  return (
    <motion.div
      className={`absolute inset-0 z-20 rounded-2xl overflow-hidden ${
        interactive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isHovered ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      aria-hidden="true"
    >
      {/* dark gradient overlay so demo is visible over thumbnail */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/60" />
      {/* demo content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {prefersReducedMotion ? (
          <p className="text-xs text-gray-400">{staticLabel}</p>
        ) : (
          <Component active={isHovered} />
        )}
      </div>
    </motion.div>
  );
}
