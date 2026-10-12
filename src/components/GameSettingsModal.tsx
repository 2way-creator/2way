import React from 'react';
import { GameIntensity, SpinMode, BottleSkin } from '../types';
import { BOTTLE_SKINS } from '../data/skins';
import { sound } from '../utils/audio';
import { Sliders, Flame, Users2, Wine, Volume2, VolumeX, Sparkles, Check } from 'lucide-react';

interface GameSettingsModalProps {
  isOpen: boolean;
  intensity: GameIntensity;
  setIntensity: (intensity: GameIntensity) => void;
  mode: SpinMode;
  setMode: (mode: SpinMode) => void;
  skin: BottleSkin;
  setSkin: (skin: BottleSkin) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onClose: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  intensity,
  setIntensity,
  mode,
  setMode,
  skin,
  setSkin,
  soundEnabled,
  setSoundEnabled,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Configuración del Juego</h3>
              <p className="text-xs text-slate-400">Ajusta la intensidad y las reglas de la botella</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Nivel de Intensidad */}
          <div>
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Nivel de Intensidad y Preguntas
            </span>

            <div className="space-y-2">
              {/* Soft */}
              <button
                onClick={() => {
                  sound.playTick(600);
                  setIntensity('soft');
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  intensity === 'soft'
                    ? 'bg-sky-950/40 border-sky-400 ring-1 ring-sky-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-sky-300">
                    <span>🧊 Suave / Rompehielos</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Risas, anécdotas, confesiones divertidas y retos ligeros.
                  </div>
                </div>
                {intensity === 'soft' && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
              </button>

              {/* Party */}
              <button
                onClick={() => {
                  sound.playTick(800);
                  setIntensity('party');
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  intensity === 'party'
                    ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                    <span>🔥 Fiesta &amp; Tragos (Recomendado)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Secretos atrevidos, bailes pegaditos, tragos y coqueteo.
                  </div>
                </div>
                {intensity === 'party' && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
              </button>

              {/* Hot +18 */}
              <button
                onClick={() => {
                  sound.playTick(1100);
                  setIntensity('hot');
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  intensity === 'hot'
                    ? 'bg-rose-950/50 border-rose-500 ring-1 ring-rose-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
                    <span>🌶️🔥 Íntimo &amp; Atrevido (+18)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Besos con mordisco, confesiones de cama, prendas y deseo.
                  </div>
                </div>
                {intensity === 'hot' && <Check className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
              </button>
            </div>
          </div>

          {/* Modo de Giro: 1 persona vs Dúo */}
          <div>
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <Users2 className="w-4 h-4 text-purple-400" />
              Dinámica de la Ruleta
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playTick(700);
                  setMode('single');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  mode === 'single'
                    ? 'bg-purple-950/40 border-purple-400 ring-1 ring-purple-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-purple-300">Modo Individual</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  La punta señala solo a 1 persona que asume el reto.
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playTick(900);
                  setMode('duo');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  mode === 'duo'
                    ? 'bg-pink-950/40 border-pink-400 ring-1 ring-pink-400/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-pink-300">Modo Parejas / Dúo</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Punta = Víctima, Base = Pareja (retos cruzados o beso).
                </div>
              </button>
            </div>
          </div>

          {/* Estilo de la Botella */}
          <div>
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <Wine className="w-4 h-4 text-amber-400" />
              Diseño de la Botella
            </span>

            <div className="grid grid-cols-2 gap-2">
              {BOTTLE_SKINS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playTick(800);
                    setSkin(s.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    skin === s.id
                      ? 'bg-slate-800 border-amber-400/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-8 h-8 rounded-lg object-contain bg-black/60 p-0.5"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: s.accentColor }}
                    >
                      B
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{s.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{s.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Effects Toggle */}
          <div className="pt-1">
            <button
              onClick={() => {
                const next = !soundEnabled;
                sound.enabled = next;
                setSoundEnabled(next);
                if (next) sound.playSuccess();
              }}
              className="w-full p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Efectos de Sonido &amp; Ruleta</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  soundEnabled
                    ? 'text-emerald-400 bg-emerald-950/50'
                    : 'text-slate-500 bg-slate-800'
                }`}
              >
                {soundEnabled ? 'Activado' : 'Silencio'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-rose-600/30"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
