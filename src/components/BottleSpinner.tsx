import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, BottleSkin, SpinMode } from '../types';
import { sound } from '../utils/audio';
import { tequilaImg, champagneImg, legoBottleImg } from '../data/skins';
import { PlayerAvatar } from './PlayerAvatar';
import { Sparkles, Compass } from 'lucide-react';

interface BottleSpinnerProps {
  players: Player[];
  skin: BottleSkin;
  mode: SpinMode;
  onSpinEnd: (targetPlayer: Player, secondPlayer: Player | null) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

interface PointerTrackPoint {
  angle: number;
  time: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  sparkleSpeed: number;
  phase: number;
}

// Colors for particles based on skin
const SKIN_PALETTES: Record<BottleSkin, string[]> = {
  lego: ['#eab308', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ffffff'],
  tequila: ['#f59e0b', '#fbbf24', '#fde047', '#fed7aa', '#ffffff'],
  champagne: ['#10b981', '#34d399', '#fde047', '#fef08a', '#ffffff'],
  neon: ['#ec4899', '#f43f5e', '#a855f7', '#c084fc', '#ffffff'],
  beer: ['#38bdf8', '#7dd3fc', '#f59e0b', '#fbbf24', '#ffffff'],
};

export const BottleSpinner: React.FC<BottleSpinnerProps> = ({
  players,
  skin,
  mode,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
}) => {
  const [highlightedPlayerIndex, setHighlightedPlayerIndex] = useState<number>(0);
  const [highlightedBaseIndex, setHighlightedBaseIndex] = useState<number | null>(null);

  // References to keep animation off the React render loop
  const currentAngleRef = useRef<number>(0);
  const currentVelocityRef = useRef<number>(0);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const trail1Ref = useRef<HTMLDivElement>(null);
  const trail2Ref = useRef<HTMLDivElement>(null);
  const bottleVisualRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickSectorRef = useRef<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  // Particles & tip trail history
  const particlesRef = useRef<SparkleParticle[]>([]);
  const tipHistoryRef = useRef<{ x: number; y: number; alpha: number }[]>([]);

  // Gesture tracking
  const isDraggingRef = useRef<boolean>(false);
  const dragCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerHistoryRef = useRef<PointerTrackPoint[]>([]);
  const startDragAngleRef = useRef<number>(0);
  const startBottleAngleRef = useRef<number>(0);

  const numPlayers = players.length;
  const sectorAngle = 360 / Math.max(numPlayers, 1);

  // Calculate sector index from any absolute angle
  const calculateSector = useCallback((deg: number): number => {
    if (numPlayers === 0) return 0;
    const normalized = ((deg % 360) + 360) % 360;
    return Math.floor((normalized + sectorAngle / 2) / sectorAngle) % numPlayers;
  }, [numPlayers, sectorAngle]);

  // Update highlighted players when bottle rests or crosses
  const updateHighlights = useCallback((deg: number) => {
    const tipIdx = calculateSector(deg);
    setHighlightedPlayerIndex(tipIdx);

    if (mode === 'duo') {
      const baseIdx = calculateSector(deg + 180);
      setHighlightedBaseIndex(baseIdx !== tipIdx ? baseIdx : null);
    } else {
      setHighlightedBaseIndex(null);
    }
  }, [calculateSector, mode]);

  // Spawn sparkling particles along the bottle tip trajectory
  const spawnSparkles = useCallback((cx: number, cy: number, angle: number, speed: number, count: number = 2) => {
    const palette = SKIN_PALETTES[skin];
    const tipRadius = 95; // px from center to bottle tip
    const baseRadius = 85; // px from center to bottle base
    const rad = ((angle - 90) * Math.PI) / 180;
    const tipX = cx + tipRadius * Math.cos(rad);
    const tipY = cy + tipRadius * Math.sin(rad);

    // Tangent angle in direction of rotation
    const dir = currentVelocityRef.current >= 0 ? 1 : -1;
    const tangentAngle = rad + (dir * Math.PI) / 2;
    const speedRatio = Math.min(speed / 1800, 1.2);

    for (let i = 0; i < count; i++) {
      // Slight tangential eject velocity + random radial spread
      const ejectSpeed = (dir * speedRatio * 80 + (Math.random() - 0.5) * 60);
      const vx = Math.cos(tangentAngle) * ejectSpeed + (Math.random() - 0.5) * 30;
      const vy = Math.sin(tangentAngle) * ejectSpeed + (Math.random() - 0.5) * 30;

      particlesRef.current.push({
        x: tipX + (Math.random() - 0.5) * 12,
        y: tipY + (Math.random() - 0.5) * 12,
        vx,
        vy,
        size: 1.5 + Math.random() * 3.5,
        alpha: 0.8 + Math.random() * 0.2,
        decay: 0.02 + Math.random() * 0.035,
        color: palette[Math.floor(Math.random() * palette.length)],
        sparkleSpeed: 8 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Spawn a base sparkle if high speed or duo mode
    if ((mode === 'duo' || speed > 1000) && Math.random() < 0.6) {
      const baseRad = ((angle + 90) * Math.PI) / 180;
      const baseX = cx + baseRadius * Math.cos(baseRad);
      const baseY = cy + baseRadius * Math.sin(baseRad);
      particlesRef.current.push({
        x: baseX + (Math.random() - 0.5) * 10,
        y: baseY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.6 + Math.random() * 0.3,
        decay: 0.03 + Math.random() * 0.03,
        color: palette[Math.floor(Math.random() * palette.length)],
        sparkleSpeed: 10,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Keep tip path streak
    tipHistoryRef.current.push({ x: tipX, y: tipY, alpha: Math.min(speedRatio * 0.8, 0.7) });
    if (tipHistoryRef.current.length > 14) {
      tipHistoryRef.current.shift();
    }
  }, [skin, mode]);

  // Burst of celebratory sparkle stars when the bottle lands
  const triggerLandingBurst = useCallback((angle: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const palette = SKIN_PALETTES[skin];
    const tipRadius = 95;
    const rad = ((angle - 90) * Math.PI) / 180;
    const tipX = cx + tipRadius * Math.cos(rad);
    const tipY = cy + tipRadius * Math.sin(rad);

    for (let i = 0; i < 26; i++) {
      const burstAngle = Math.random() * Math.PI * 2;
      const burstSpeed = 40 + Math.random() * 120;
      particlesRef.current.push({
        x: tipX,
        y: tipY,
        vx: Math.cos(burstAngle) * burstSpeed,
        vy: Math.sin(burstAngle) * burstSpeed,
        size: 2 + Math.random() * 4,
        alpha: 1,
        decay: 0.018 + Math.random() * 0.02,
        color: palette[Math.floor(Math.random() * palette.length)],
        sparkleSpeed: 12 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }, [skin]);

  // Render particles & glowing motion streak on canvas
  const renderParticles = useCallback((dt: number, now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw glowing light streak arc behind tip
    const trail = tipHistoryRef.current;
    if (trail.length > 2) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.strokeStyle = skin === 'neon' ? 'rgba(236,72,153,0.45)' : 'rgba(251,191,36,0.45)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = skin === 'neon' ? '#ec4899' : '#f59e0b';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 2. Update and draw particles
    const activeParticles: SparkleParticle[] = [];

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94; // slight drag
      p.vy *= 0.94;
      p.alpha -= p.decay;

      if (p.alpha > 0.02) {
        activeParticles.push(p);

        // Twinkle modulation
        const twinkle = 0.7 + 0.3 * Math.sin(now * 0.01 * p.sparkleSpeed + p.phase);
        const currentAlpha = Math.max(p.alpha * twinkle, 0);

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        // Draw 4-point star sparkle for larger particles, circle for small
        if (p.size > 2.5) {
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.3, p.y - s * 0.3);
          ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x + s * 0.3, p.y + s * 0.3);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s * 0.3, p.y + s * 0.3);
          ctx.lineTo(p.x - s, p.y);
          ctx.lineTo(p.x - s * 0.3, p.y - s * 0.3);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    particlesRef.current = activeParticles;

    // Decay tip trail
    tipHistoryRef.current = tipHistoryRef.current.map((t) => ({ ...t, alpha: t.alpha * 0.85 })).filter((t) => t.alpha > 0.05);
  }, [skin]);

  // Direct GPU DOM update with dynamic motion blur & ghost trails
  const applyTransform = useCallback((angle: number, speed: number = 0) => {
    // 1. Primary Rotator Transform
    if (rotatorRef.current) {
      rotatorRef.current.style.transform = `translate3d(0, 0, 0) rotate(${angle}deg)`;
    }

    const dir = currentVelocityRef.current >= 0 ? 1 : -1;
    const speedRatio = Math.min(speed / 1800, 1);

    // 2. Motion Blur Ghost Trails (Rotational Streaks)
    if (trail1Ref.current && trail2Ref.current) {
      if (speed > 250) {
        const lag1 = -dir * speedRatio * 9;
        const lag2 = -dir * speedRatio * 18;
        trail1Ref.current.style.transform = `translate3d(0, 0, 0) rotate(${angle + lag1}deg)`;
        trail1Ref.current.style.opacity = `${speedRatio * 0.38}`;
        trail1Ref.current.style.display = 'flex';

        trail2Ref.current.style.transform = `translate3d(0, 0, 0) rotate(${angle + lag2}deg)`;
        trail2Ref.current.style.opacity = `${speedRatio * 0.18}`;
        trail2Ref.current.style.display = 'flex';
      } else {
        trail1Ref.current.style.opacity = '0';
        trail2Ref.current.style.opacity = '0';
        trail1Ref.current.style.display = 'none';
        trail2Ref.current.style.display = 'none';
      }
    }

    // 3. Dynamic Motion Blur & 3D Wobble on Main Bottle
    if (bottleVisualRef.current) {
      if (speed > 200) {
        const blurAmount = (speedRatio * 3.2).toFixed(1);
        const wobbleX = (Math.sin(angle * 0.06) * 1.8 * speedRatio).toFixed(1);
        const wobbleY = (Math.cos(angle * 0.06) * 1.8 * speedRatio).toFixed(1);

        bottleVisualRef.current.style.transform = `perspective(800px) rotateX(${wobbleX}deg) rotateY(${wobbleY}deg) scale(${1 - speedRatio * 0.03})`;
        bottleVisualRef.current.style.filter = `drop-shadow(0 16px 30px rgba(0,0,0,0.85)) blur(${blurAmount}px)`;
      } else {
        bottleVisualRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        bottleVisualRef.current.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.8)) blur(0px)';
      }
    }
  }, []);

  // Sync initial angle on mount and size canvas
  useEffect(() => {
    applyTransform(currentAngleRef.current, 0);
    updateHighlights(currentAngleRef.current);

    if (canvasRef.current && arenaRef.current) {
      const rect = arenaRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width || 420;
      canvasRef.current.height = rect.height || 420;
    }
  }, [applyTransform, updateHighlights]);

  // High-performance physics spin loop
  const triggerSpin = useCallback((initialVelocity?: number, customFriction?: number) => {
    if (isSpinning || numPlayers === 0) return;
    setIsSpinning(true);
    sound.playSpinStart();

    // Determine initial angular velocity (deg per second)
    let velocity: number;
    if (initialVelocity && Math.abs(initialVelocity) > 300) {
      const dir = initialVelocity >= 0 ? 1 : -1;
      velocity = dir * Math.max(Math.abs(initialVelocity), 1400) + dir * (Math.random() * 600);
    } else {
      const dir = 1;
      velocity = dir * (1800 + Math.random() * 1200);
    }

    currentVelocityRef.current = velocity;

    // Friction factor: determines how naturally the bottle glides to a stop
    const friction = customFriction || (0.980 + Math.random() * 0.005);
    const minVelocityThreshold = 14;

    let lastTime = performance.now();
    let currentAngle = currentAngleRef.current;
    lastTickSectorRef.current = calculateSector(currentAngle);

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Update angle with current velocity
      currentAngle += velocity * dt;
      currentAngleRef.current = currentAngle;
      currentVelocityRef.current = velocity;

      // Apply friction
      velocity *= Math.pow(friction, dt * 60);

      // Apply GPU transform with motion blur
      applyTransform(currentAngle, Math.abs(velocity));

      // Emit sparkling particles if spinning fast
      if (Math.abs(velocity) > 120 && canvasRef.current) {
        const cx = canvasRef.current.width / 2;
        const cy = canvasRef.current.height / 2;
        const spawnCount = Math.abs(velocity) > 1000 ? 3 : 2;
        spawnSparkles(cx, cy, currentAngle, Math.abs(velocity), spawnCount);
      }

      // Render sparkles and motion streaks
      renderParticles(dt, now);

      // Sector passage ticks & haptics
      const currentSector = calculateSector(currentAngle);
      if (currentSector !== lastTickSectorRef.current) {
        lastTickSectorRef.current = currentSector;
        const speedRatio = Math.min(Math.abs(velocity) / 1500, 1);
        sound.playTick(450 + speedRatio * 550);
        if (Math.abs(velocity) < 600) {
          sound.vibrate(8);
        }
      }

      if (Math.abs(velocity) > minVelocityThreshold) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Bottle has come to a stop
        animFrameRef.current = null;
        currentVelocityRef.current = 0;
        applyTransform(currentAngle, 0);
        updateHighlights(currentAngle);
        setIsSpinning(false);

        // Celebratory landing particle burst & chimes
        triggerLandingBurst(currentAngle);
        sound.playStopDing();
        sound.vibrate([40, 50, 70]);

        // Keep rendering remaining particles until they fade out
        let restFrames = 30;
        const fadeRemaining = () => {
          renderParticles(0.016, performance.now());
          restFrames--;
          if (restFrames > 0 && particlesRef.current.length > 0) {
            requestAnimationFrame(fadeRemaining);
          }
        };
        requestAnimationFrame(fadeRemaining);

        const finalTipIdx = calculateSector(currentAngle);
        const targetPlayer = players[finalTipIdx];

        let secondaryPlayer: Player | null = null;
        if (mode === 'duo' && numPlayers > 1) {
          const finalBaseIdx = calculateSector(currentAngle + 180);
          secondaryPlayer = players[finalBaseIdx];
          if (secondaryPlayer.id === targetPlayer.id) {
            secondaryPlayer = players[(finalTipIdx + Math.floor(numPlayers / 2)) % numPlayers];
          }
        }

        setTimeout(() => {
          onSpinEnd(targetPlayer, secondaryPlayer);
        }, 500);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, numPlayers, setIsSpinning, calculateSector, applyTransform, spawnSparkles, renderParticles, updateHighlights, triggerLandingBurst, mode, players, onSpinEnd]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute angle from center of container to pointer
  const getPointerAngle = (clientX: number, clientY: number): number => {
    const dx = clientX - dragCenterRef.current.x;
    const dy = clientY - dragCenterRef.current.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Pointer / Touch gestures for authentic physical spin
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSpinning) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const now = performance.now();
      const angle = getPointerAngle(e.clientX, e.clientY);

      isDraggingRef.current = true;
      startDragAngleRef.current = angle;
      startBottleAngleRef.current = currentAngleRef.current;
      pointerHistoryRef.current = [{ angle, time: now }];

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || isSpinning) return;

    const now = performance.now();
    const angle = getPointerAngle(e.clientX, e.clientY);

    let delta = angle - startDragAngleRef.current;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;

    const newAngle = startBottleAngleRef.current + delta;
    currentAngleRef.current = newAngle;

    applyTransform(newAngle, 0);

    pointerHistoryRef.current.push({ angle: newAngle, time: now });
    pointerHistoryRef.current = pointerHistoryRef.current.filter((p) => now - p.time <= 120);

    const currentSector = calculateSector(newAngle);
    if (currentSector !== lastTickSectorRef.current) {
      lastTickSectorRef.current = currentSector;
      sound.playTick(500);
      updateHighlights(newAngle);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const now = performance.now();
    const history = pointerHistoryRef.current;

    if (history.length >= 2) {
      const oldest = history[0];
      const newest = history[history.length - 1];
      const dt = (newest.time - oldest.time) / 1000;

      if (dt > 0.015) {
        let deltaDeg = newest.angle - oldest.angle;
        const angularVelocity = deltaDeg / dt;

        if (Math.abs(angularVelocity) > 220) {
          triggerSpin(angularVelocity);
          return;
        }
      }
    }

    triggerSpin();
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
  };

  // Reusable Bottle Silhouette Render Helper
  const renderBottleGraphic = () => {
    if (skin === 'lego') {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={legoBottleImg}
            alt="Botella de Bloques Lego"
            draggable={false}
            className="w-full h-full object-contain rounded-2xl pointer-events-none select-none filter contrast-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          />
          {/* Subtle glowing Lego Stud pointer highlight on bottle top */}
          <div className="absolute top-2 w-4 h-4 rounded-full bg-amber-400/90 shadow-[0_0_10px_#f59e0b] blur-[1px] animate-pulse" />
        </div>
      );
    }
    if (skin === 'tequila') {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={tequilaImg}
            alt="Botella Tequila"
            draggable={false}
            className="w-full h-full object-contain rounded-2xl pointer-events-none select-none filter contrast-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          />
          <div className="absolute top-2 w-3.5 h-3.5 rounded-full bg-amber-400/90 blur-xs" />
        </div>
      );
    }
    if (skin === 'champagne') {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={champagneImg}
            alt="Botella Champaña"
            draggable={false}
            className="w-full h-full object-contain rounded-2xl pointer-events-none select-none filter contrast-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          />
          <div className="absolute top-2 w-3.5 h-3.5 rounded-full bg-emerald-400/90 blur-xs" />
        </div>
      );
    }
    if (skin === 'neon') {
      return (
        <svg viewBox="0 0 100 240" className="w-full h-full filter drop-shadow-[0_0_16px_rgba(236,72,153,0.75)]">
          <defs>
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <rect x="42" y="10" width="16" height="14" rx="3" fill="#ec4899" />
          <path
            d="M 44 24 L 44 65 L 26 100 L 26 215 C 26 226 34 234 46 234 L 54 234 C 66 234 74 226 74 215 L 74 100 L 56 65 L 56 24 Z"
            fill="rgba(236,72,153,0.22)"
            stroke="url(#neonGrad)"
            strokeWidth="3"
          />
          <rect x="32" y="125" width="36" height="48" rx="4" fill="rgba(139,92,246,0.3)" stroke="#a855f7" strokeWidth="1.5" />
          <text x="50" y="152" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">HOT</text>
          <path d="M 28 170 Q 50 165 72 170 L 72 215 C 72 224 65 230 55 230 L 45 230 C 35 230 28 224 28 215 Z" fill="rgba(236,72,153,0.45)" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 100 240" className="w-full h-full filter drop-shadow-[0_0_14px_rgba(56,189,248,0.55)]">
        <defs>
          <linearGradient id="beerAmber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <rect x="43" y="10" width="14" height="12" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
        <path
          d="M 44 22 L 44 70 L 28 105 L 28 218 C 28 228 36 235 48 235 L 52 235 C 64 235 72 228 72 218 L 72 105 L 56 70 L 56 22 Z"
          fill="url(#beerAmber)"
          stroke="#f59e0b"
          strokeWidth="2.5"
        />
        <rect x="33" y="120" width="34" height="50" rx="3" fill="#f8fafc" />
        <text x="50" y="148" fill="#1e293b" fontSize="8" fontWeight="bold" textAnchor="middle">CORONA</text>
        <text x="50" y="158" fill="#d97706" fontSize="6" fontWeight="bold" textAnchor="middle">EXTRA</text>
      </svg>
    );
  };

  return (
    <div
      ref={arenaRef}
      className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center select-none touch-none my-2 overflow-visible"
    >
      {/* Dynamic Sparkling Particle & Motion Blur Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-25"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Outer Glow Halo Ring */}
      <div className="absolute inset-2 rounded-full border border-rose-500/20 bg-radial from-rose-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Radial Sector Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
        <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="rgba(244,63,94,0.15)" strokeWidth="1" />
        {players.map((_, i) => {
          const angle = (i * sectorAngle - 90) * (Math.PI / 180);
          const x2 = 50 + 46 * Math.cos(angle);
          const y2 = 50 + 46 * Math.sin(angle);
          return (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* Players Circle Around the Bottle */}
      {players.map((player, idx) => {
        const angleDeg = idx * sectorAngle - 90;
        const angleRad = angleDeg * (Math.PI / 180);
        const radiusPercent = 42;
        const leftPercent = 50 + radiusPercent * Math.cos(angleRad);
        const topPercent = 50 + radiusPercent * Math.sin(angleRad);

        const isTipTarget = idx === highlightedPlayerIndex;
        const isBaseTarget = mode === 'duo' && idx === highlightedBaseIndex;

        return (
          <div
            key={player.id}
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute flex flex-col items-center justify-center transition-all duration-150 z-10 ${
              isTipTarget
                ? 'scale-115 ring-2 ring-rose-500 shadow-lg shadow-rose-500/40'
                : isBaseTarget
                ? 'scale-105 ring-2 ring-amber-400 shadow-md shadow-amber-400/30'
                : 'opacity-85 hover:opacity-100'
            }`}
          >
            {/* Tag indicator if targeted */}
            {isTipTarget && (
              <span className="absolute -top-5 text-[10px] font-bold text-rose-400 bg-rose-950/90 border border-rose-500/40 px-1.5 py-0.5 rounded-full whitespace-nowrap shadow">
                🎯 {mode === 'duo' ? 'Víctima' : 'Turno'}
              </span>
            )}
            {isBaseTarget && (
              <span className="absolute -top-5 text-[10px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-1.5 py-0.5 rounded-full whitespace-nowrap shadow">
                🤝 Pareja
              </span>
            )}

            {/* Avatar Circle with Lego character */}
            <div
              className={`rounded-full flex items-center justify-center border-2 transition-transform ${
                isTipTarget
                  ? 'border-rose-400 bg-rose-950 shadow-[0_0_16px_rgba(244,63,94,0.6)]'
                  : isBaseTarget
                  ? 'border-amber-400 bg-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                  : 'border-white/20 bg-slate-900/90'
              }`}
            >
              <PlayerAvatar player={player} size="md" isHighlighted={isTipTarget || isBaseTarget} />
            </div>

            {/* Player Name and Gender */}
            <div className="mt-1 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 max-w-[76px]">
              <span className="text-[11px] font-semibold text-slate-100 truncate">
                {player.name}
              </span>
              <span className="text-[9px] opacity-75 shrink-0">
                {player.gender === 'hombre' ? '♂' : player.gender === 'mujer' ? '♀' : '⚧'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Central Bottle Interactive Rotating Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative z-20 w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
        title="Toca o desliza para girar la botella con impulso"
      >
        {/* Motion Blur Ghost Trail 2 (Lagged Farther) */}
        <div
          ref={trail2Ref}
          style={{ willChange: 'transform, opacity', display: 'none' }}
          className="absolute w-full h-full pointer-events-none flex items-center justify-center origin-center filter blur-xs"
        >
          <div className="w-28 h-44 sm:w-32 sm:h-48 flex items-center justify-center scale-95 opacity-50">
            {renderBottleGraphic()}
          </div>
        </div>

        {/* Motion Blur Ghost Trail 1 (Lagged Closely) */}
        <div
          ref={trail1Ref}
          style={{ willChange: 'transform, opacity', display: 'none' }}
          className="absolute w-full h-full pointer-events-none flex items-center justify-center origin-center filter blur-[1px]"
        >
          <div className="w-28 h-44 sm:w-32 sm:h-48 flex items-center justify-center scale-98 opacity-70">
            {renderBottleGraphic()}
          </div>
        </div>

        {/* GPU-Accelerated Primary Rotator Container */}
        <div
          ref={rotatorRef}
          style={{ willChange: 'transform' }}
          className="absolute w-full h-full pointer-events-none flex items-center justify-center origin-center"
        >
          {/* Laser Pointer Lines */}
          <div className="absolute top-1 w-1.5 h-8 bg-gradient-to-t from-rose-500/0 via-rose-500 to-rose-400 rounded-full shadow-[0_0_14px_#f43f5e]" />
          {mode === 'duo' && (
            <div className="absolute bottom-1 w-1 h-6 bg-gradient-to-b from-amber-400/0 to-amber-400 rounded-full shadow-[0_0_10px_#fbbf24]" />
          )}

          {/* Bottle Visual with 3D Precession Tilt & Physics Shadow */}
          <div
            ref={bottleVisualRef}
            style={{ willChange: 'transform, filter' }}
            className="relative w-28 h-44 sm:w-32 sm:h-48 flex items-center justify-center transition-all duration-75 origin-center"
          >
            {renderBottleGraphic()}
          </div>
        </div>

        {/* Center Pedestal Anchor */}
        <div className="absolute w-14 h-14 rounded-full bg-slate-900/85 border border-white/10 flex items-center justify-center pointer-events-none shadow-inner z-22">
          <Compass className="w-6 h-6 text-rose-400 opacity-60" />
        </div>
      </div>

      {/* Floating Center Spin CTA Button */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => triggerSpin()}
          disabled={isSpinning || numPlayers < 2}
          className={`h-13 px-8 rounded-full font-bold text-sm tracking-wide uppercase transition-all shadow-xl flex items-center gap-2.5 active:scale-95 ${
            isSpinning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-white/10'
              : numPlayers < 2
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-103'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{isSpinning ? '¡GIRANDO...!' : '¡GIRAR BOTELLA!'}</span>
        </button>
      </div>
    </div>
  );
};
