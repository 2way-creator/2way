import React, { useEffect, useState } from 'react';
import { Player } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { PlayerAvatar } from './PlayerAvatar';
import { Trophy, Sparkles, Flame, CheckCircle2, Heart, ArrowRight } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  player: Player | null;
  secondPlayer: Player | null;
  cardText?: string;
  cardType?: 'truth' | 'dare' | 'kiss';
  onClose: () => void;
}

const CELEBRATION_TITLES = [
  '¡Sin Miedo al Éxito!',
  '¡El Alma de la Fiesta!',
  '¡Valentía Nivel Leyenda!',
  '¡Seducción al 100%!',
  '¡Cumplió como los Grandes!',
  '¡Ovación Total en la Mesa!',
];

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  player,
  secondPlayer,
  cardText,
  cardType,
  onClose,
}) => {
  const [randomTitle, setRandomTitle] = useState<string>('');

  useEffect(() => {
    if (isOpen && player) {
      // Pick random festive title
      setRandomTitle(CELEBRATION_TITLES[Math.floor(Math.random() * CELEBRATION_TITLES.length)]);

      // 1. Play epic synthesized victory fanfare
      sound.playEpicVictory();
      sound.vibrate([60, 40, 80, 50, 120]);

      // 2. Launch dual cannon confetti animation
      const duration = 2.4 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        // Left cannon
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#f43f5e', '#fbbf24', '#c084fc', '#38bdf8', '#10b981'],
        });
        // Right cannon
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#f43f5e', '#fbbf24', '#c084fc', '#38bdf8', '#10b981'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };

      // Big center initial burst
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#ffd700', '#ff007f', '#00e5ff', '#76ff03', '#ffffff'],
      });

      frame();
    }
  }, [isOpen, player]);

  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      {/* Radiant celebratory rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full bg-radial from-amber-500/25 via-rose-500/15 to-transparent blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.35)] text-center overflow-hidden">
        {/* Golden top ribbon badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase shadow-inner mb-4 animate-bounce">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{randomTitle || '¡RETO CUMPLIDO!'}</span>
        </div>

        {/* Big Spotlight Visual on Player(s) */}
        <div className="relative flex items-center justify-center my-3">
          {/* Pulsing ring aura */}
          <div className="absolute w-28 h-28 rounded-full bg-amber-400/20 animate-ping opacity-35" />

          {secondPlayer ? (
            /* Duo Celebration */
            <div className="flex items-center justify-center gap-4 relative z-10">
              <div className="flex flex-col items-center">
                <div className="p-1 rounded-full bg-rose-950 border-3 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                  <PlayerAvatar player={player} size="xl" />
                </div>
                <span className="text-sm font-bold text-white mt-1.5 truncate max-w-[90px]">
                  {player.name}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest mt-0.5">
                  DÚO
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-1 rounded-full bg-amber-950 border-3 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)]">
                  <PlayerAvatar player={secondPlayer} size="xl" />
                </div>
                <span className="text-sm font-bold text-white mt-1.5 truncate max-w-[90px]">
                  {secondPlayer.name}
                </span>
              </div>
            </div>
          ) : (
            /* Solo Player Celebration */
            <div className="flex flex-col items-center relative z-10">
              <div className="p-1 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 border-3 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.6)]">
                <PlayerAvatar player={player} size="xl" />
              </div>
              <h3 className="text-xl font-black text-white mt-2 tracking-tight">
                {player.name}
              </h3>
            </div>
          )}
        </div>

        {/* Score Award Highlight */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/30 flex items-center justify-around">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Premio de la Ronda
            </span>
            <span className="text-2xl font-black text-emerald-400 tabular-nums flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              +10 PTS
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Puntos Totales
            </span>
            <span className="text-2xl font-black text-amber-300 tabular-nums">
              {player.score + 10}
            </span>
          </div>
        </div>

        {/* Completed challenge recap */}
        {cardText && (
          <p className="text-xs text-slate-300 italic mb-5 line-clamp-2 px-2 bg-slate-950/40 py-2 rounded-xl border border-white/5">
            "{cardText}"
          </p>
        )}

        {/* Continue Action Button */}
        <button
          onClick={onClose}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-rose-950/60 active:scale-97 transition-all cursor-pointer"
        >
          <span>¡Continuar la Fiesta!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
