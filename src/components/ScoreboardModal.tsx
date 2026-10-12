import React from 'react';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { Trophy, Wine, Flame, MessageCircle, RotateCcw } from 'lucide-react';

interface ScoreboardModalProps {
  isOpen: boolean;
  players: Player[];
  onResetScores: () => void;
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  players,
  onResetScores,
  onClose,
}) => {
  if (!isOpen) return null;

  // Sort by total score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // Top party drinker
  const topDrinker = [...players].sort((a, b) => b.shotsCount - a.shotsCount)[0];
  // Top dare master
  const topDaredevil = [...players].sort((a, b) => b.daresCompleted - a.daresCompleted)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Marcador &amp; Récords</h3>
              <p className="text-xs text-slate-400">Quién va ganando y quién ha bebido más</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-2 gap-2 py-3">
          {topDaredevil && topDaredevil.daresCompleted > 0 && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center gap-2.5">
              <PlayerAvatar player={topDaredevil} size="sm" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-rose-400 block truncate">
                  🔥 Más Atrevido/a
                </span>
                <span className="font-bold text-xs text-white truncate block">
                  {topDaredevil.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {topDaredevil.daresCompleted} retos cumplidos
                </span>
              </div>
            </div>
          )}

          {topDrinker && topDrinker.shotsCount > 0 && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/20 flex items-center gap-2.5">
              <PlayerAvatar player={topDrinker} size="sm" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">
                  🥃 Rey del Shot
                </span>
                <span className="font-bold text-xs text-white truncate block">
                  {topDrinker.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {topDrinker.shotsCount} tragos tomados
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Table of Players */}
        <div className="overflow-y-auto py-2 space-y-2 flex-1 pr-1">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                idx === 0
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-slate-950/60 border-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 text-center font-bold text-xs text-slate-400">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>
                <PlayerAvatar player={p} size="sm" />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white truncate block">{p.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-rose-400" />
                      {p.daresCompleted} retos
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Wine className="w-3 h-3 text-amber-400" />
                      {p.shotsCount} shots
                    </span>
                  </div>
                </div>
              </div>

              {/* Score pill */}
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-rose-400 tabular-nums">
                  {p.score} pts
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onResetScores}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors py-1 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Marcador</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
