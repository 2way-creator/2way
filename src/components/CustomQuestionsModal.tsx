import React, { useState } from 'react';
import { QuestionDareItem, CardType, GameIntensity, GameCategory } from '../types';
import { PlusCircle, Trash2, Edit3, MessageSquarePlus, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface CustomQuestionsModalProps {
  isOpen: boolean;
  deck: QuestionDareItem[];
  onAddCustomCard: (card: QuestionDareItem) => void;
  onRemoveCustomCard: (id: string) => void;
  onClose: () => void;
}

export const CustomQuestionsModal: React.FC<CustomQuestionsModalProps> = ({
  isOpen,
  deck,
  onAddCustomCard,
  onRemoveCustomCard,
  onClose,
}) => {
  const [text, setText] = useState<string>('');
  const [type, setType] = useState<CardType>('dare');
  const [intensity, setIntensity] = useState<GameIntensity>('party');
  const [category, setCategory] = useState<GameCategory>('party_dares');
  const [penalty, setPenalty] = useState<number>(2);

  if (!isOpen) return null;

  const customCards = deck.filter((c) => c.isCustom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    sound.playSuccess();
    const newCard: QuestionDareItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      category,
      intensity,
      text: trimmed,
      shotsPenalty: penalty,
      isCustom: true,
    };

    onAddCustomCard(newCard);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Retos y Preguntas Secretas</h3>
              <p className="text-xs text-slate-400">Añade preguntas o desafíos inventados por el grupo</p>
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
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {/* Add form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 block">
              Crear Nuevo Reto o Verdad:
            </span>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe aquí tu reto atrevido o pregunta picante..."
              rows={3}
              maxLength={220}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />

            {/* Type & Intensity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Tipo:</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setType('truth')}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-semibold border ${
                      type === 'truth'
                        ? 'bg-indigo-950 border-indigo-400 text-indigo-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    💬 Verdad
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('dare')}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-semibold border ${
                      type === 'dare'
                        ? 'bg-rose-950 border-rose-400 text-rose-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    ⚡ Reto
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('kiss')}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-semibold border ${
                      type === 'kiss'
                        ? 'bg-pink-950 border-pink-400 text-pink-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    💋 Beso
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Castigo:</label>
                <div className="flex gap-1">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPenalty(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold border ${
                        penalty === num
                          ? 'bg-amber-950 border-amber-400 text-amber-200'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {num} 🥃
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!text.trim()}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-md shadow-purple-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Añadir a la Baraja</span>
            </button>
          </form>

          {/* List of Custom cards */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Cartas creadas por ustedes ({customCards.length}):
            </span>

            {customCards.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                Aún no hay retos personalizados. ¡Escribe uno para sorprender al grupo!
              </div>
            ) : (
              <div className="space-y-2">
                {customCards.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">
                          {c.type === 'truth' ? 'Verdad' : c.type === 'dare' ? 'Reto' : 'Beso'}
                        </span>
                        <span className="text-[10px] text-amber-400">
                          {c.shotsPenalty} {c.shotsPenalty === 1 ? 'shot' : 'shots'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{c.text}</p>
                    </div>

                    <button
                      onClick={() => onRemoveCustomCard(c.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all active:scale-95"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
