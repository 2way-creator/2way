import React from 'react';
import { GAME_CATEGORIES, INITIAL_QUESTIONS_AND_DARES } from '../data/questionsAndDares';
import { GameCategory } from '../types';
import { Layers, Sparkles, Check, Heart, Flame, Wine, Users2 } from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  selectedCategories: GameCategory[];
  onToggleCategory: (catId: GameCategory) => void;
  onClose: () => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  selectedCategories,
  onToggleCategory,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Categorías de Retos y Preguntas</h3>
              <p className="text-xs text-slate-400">Diseñadas especialmente para grupos mixtos (hombres y mujeres)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content list with 6 Categories and 3 examples each */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-white/5">
            💡 Puedes activar o desactivar las categorías que desees para personalizar tu noche. Cada categoría incluye retos y preguntas cuidadosamente calibradas para crear complicidad, risas y tensión sana.
          </p>

          <div className="space-y-4">
            {GAME_CATEGORIES.map((cat) => {
              const isEnabled = selectedCategories.includes(cat.id);
              const examples = INITIAL_QUESTIONS_AND_DARES.filter((q) => q.category === cat.id).slice(0, 3);

              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEnabled
                      ? 'bg-slate-950/80 border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Category Title & Toggle */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-900 border border-white/10 shrink-0">
                        {cat.emoji}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all shrink-0 active:scale-95 ${
                        isEnabled
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isEnabled ? 'Activa' : 'Pausada'}
                    </button>
                  </div>

                  {/* 3 Concrete Examples for this category */}
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Ejemplos destacados:
                    </span>
                    {examples.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-200 flex items-start gap-2"
                      >
                        <span className="text-[10px] font-bold uppercase shrink-0 mt-0.5 px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.type === 'truth' ? 'Verdad' : item.type === 'kiss' ? 'Beso' : 'Reto'}
                        </span>
                        <span className="leading-snug">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            {selectedCategories.length} de {GAME_CATEGORIES.length} categorías activas
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-rose-600/30"
          >
            Guardar y Volver
          </button>
        </div>
      </div>
    </div>
  );
};
