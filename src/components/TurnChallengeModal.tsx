import React, { useState } from 'react';
import { Player, QuestionDareItem, CardType, GameIntensity, GameCategory } from '../types';
import { GAME_CATEGORIES } from '../data/questionsAndDares';
import { sound } from '../utils/audio';
import { PlayerAvatar } from './PlayerAvatar';
import { Flame, Heart, ShieldAlert, Wine, RotateCw, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface TurnChallengeModalProps {
  isOpen: boolean;
  targetPlayer: Player | null;
  secondPlayer: Player | null;
  intensity: GameIntensity;
  deck: QuestionDareItem[];
  onComplete: (playerId: string, type: 'completed' | 'shot' | 'skipped', card?: QuestionDareItem) => void;
  onClose: () => void;
}

export const TurnChallengeModal: React.FC<TurnChallengeModalProps> = ({
  isOpen,
  targetPlayer,
  secondPlayer,
  intensity,
  deck,
  onComplete,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [currentCard, setCurrentCard] = useState<QuestionDareItem | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  if (!isOpen || !targetPlayer) return null;

  // Filter pool based on intensity & type
  const pickCard = (type: CardType) => {
    setSelectedType(type);
    sound.playTick(900);

    // Find cards matching intensity (or lower) and type
    const candidateCards = deck.filter((c) => {
      if (c.type !== type) return false;
      if (intensity === 'hot') return true; // hot can pick anything, especially hot
      if (intensity === 'party') return c.intensity === 'party' || c.intensity === 'soft';
      return c.intensity === 'soft';
    });

    const pool = candidateCards.length > 0 ? candidateCards : deck.filter((c) => c.type === type);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setCurrentCard(chosen);
  };

  const handleReroll = () => {
    if (!selectedType) return;
    sound.playDrinkShot();
    sound.vibrate(30);
    // Charge 1 shot penalty for rerolling
    onComplete(targetPlayer.id, 'shot');
    pickCard(selectedType);
  };

  const handleFinishSuccess = () => {
    onComplete(targetPlayer.id, 'completed', currentCard || undefined);
    resetAndClose();
  };

  const handleTakeShot = () => {
    sound.playDrinkShot();
    sound.vibrate([60, 40, 60]);
    onComplete(targetPlayer.id, 'shot');
    resetAndClose();
  };

  const handleSkip = () => {
    onComplete(targetPlayer.id, 'skipped');
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedType(null);
    setCurrentCard(null);
    onClose();
  };

  // Quick fallback AI generator for spontaneous customized dares
  const handleGenerateCustom = async () => {
    setIsGeneratingAI(true);
    sound.playTick(1200);

    // Smart prompt based on player names and gender combo
    const isMixed = secondPlayer && targetPlayer.gender !== secondPlayer.gender;
    const partnerName = secondPlayer ? secondPlayer.name : 'alguien del grupo';

    setTimeout(() => {
      const generatedList = [
        `Mírale fijamente los labios a ${partnerName} durante 10 segundos y luego dile qué sabor de cóctel te recuerda.`,
        `Describe en 3 palabras qué te atrae más de la personalidad de ${partnerName} y dale un trago a su vaso.`,
        `Hazle una confesión al oído a ${partnerName} que nadie más en este grupo sepa.`,
        `Si tuvieras que pasar 24 horas a solas en una cabaña con ${partnerName}, ¿cuál sería el primer plan que propondrías?`,
        `Bailen una canción lenta de 20 segundos abrazados en el centro de la mesa con las luces atenuadas.`,
      ];
      const randomCustom = generatedList[Math.floor(Math.random() * generatedList.length)];
      setCurrentCard({
        id: `ai-${Date.now()}`,
        type: 'dare',
        category: 'duo_mix',
        intensity,
        text: randomCustom,
        shotsPenalty: 2,
        isCustom: true,
      });
      setSelectedType('dare');
      setIsGeneratingAI(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-rose-500/30 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Targeted Player(s) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Target Player Lego Avatar */}
            <div className="flex flex-col items-center">
              <div className="p-0.5 rounded-full bg-rose-950 border-2 border-rose-400 shadow-lg shadow-rose-500/40">
                <PlayerAvatar player={targetPlayer} size="lg" />
              </div>
              <span className="text-xs font-bold text-rose-300 mt-1 max-w-[80px] truncate">
                {targetPlayer.name}
              </span>
            </div>

            {secondPlayer && (
              <>
                <div className="flex flex-col items-center px-1">
                  <span className="text-xs font-black text-amber-400 tracking-wider">CON</span>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse my-0.5" />
                </div>
                {/* Second Player Lego Avatar */}
                <div className="flex flex-col items-center">
                  <div className="p-0.5 rounded-full bg-amber-950 border-2 border-amber-400 shadow-lg shadow-amber-500/40">
                    <PlayerAvatar player={secondPlayer} size="lg" />
                  </div>
                  <span className="text-xs font-bold text-amber-300 mt-1 max-w-[80px] truncate">
                    {secondPlayer.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {secondPlayer
              ? `¡Dúo de la Botella!`
              : `¡Turno de ${targetPlayer.name}!`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {secondPlayer
              ? `${targetPlayer.name} y ${secondPlayer.name} deben resolver este desafío juntos`
              : `Elige tu destino: ¿confesión íntima o reto atrevido?`}
          </p>
        </div>

        {/* Stage 1: Choose Card Type */}
        {!currentCard ? (
          <div className="relative z-10 mt-6 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selecciona una categoría:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => pickCard('truth')}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 hover:border-indigo-400 flex flex-col items-center justify-center gap-2 hover:scale-102 transition-all active:scale-98 shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                  💬
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Verdad Íntima</div>
                  <div className="text-[10px] text-indigo-300">Confesiones sin filtro</div>
                </div>
              </button>

              <button
                onClick={() => pickCard('dare')}
                className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/60 to-orange-900/60 border border-rose-500/30 hover:border-rose-400 flex flex-col items-center justify-center gap-2 hover:scale-102 transition-all active:scale-98 shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Reto Atrevido</div>
                  <div className="text-[10px] text-rose-300">Acción y adrenalina</div>
                </div>
              </button>
            </div>

            {/* Special Kiss / Romantic option if duo mode or hot */}
            {(secondPlayer || intensity === 'hot') && (
              <button
                onClick={() => pickCard('kiss')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-pink-900/50 via-rose-900/50 to-red-900/50 border border-pink-500/40 hover:border-pink-300 flex items-center justify-center gap-3 hover:scale-101 transition-all active:scale-98 shadow-md"
              >
                <span className="text-xl">💋</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-pink-200">Desafío de Beso / Contacto</div>
                  <div className="text-[10px] text-pink-300">Piquito, caricia o juego sensual</div>
                </div>
              </button>
            )}

            {/* AI Custom Surprise Generator */}
            <button
              onClick={handleGenerateCustom}
              disabled={isGeneratingAI}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAI ? 'Generando reto a medida...' : 'Sorpresa Especial con IA'}</span>
            </button>
          </div>
        ) : (
          /* Stage 2: Display Revealed Card */
          <div className="relative z-10 mt-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 text-left shadow-inner">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  {currentCard.type === 'truth' && '💬 Verdad Íntima'}
                  {currentCard.type === 'dare' && '⚡ Reto Atrevido'}
                  {currentCard.type === 'kiss' && '💋 Desafío de Beso'}
                </span>
                <span className="text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Wine className="w-2.5 h-2.5" />
                  Castigo: {currentCard.shotsPenalty} {currentCard.shotsPenalty === 1 ? 'Chupito' : 'Chupitos'}
                </span>
              </div>

              {/* Category indicator */}
              {(() => {
                const cat = GAME_CATEGORIES.find((c) => c.id === currentCard.category);
                return cat ? (
                  <div className="text-[10px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <span>{cat.emoji}</span>
                    <span className="text-slate-300">{cat.name}</span>
                  </div>
                ) : null;
              })()}

              <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                {currentCard.text}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleFinishSuccess}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Reto Cumplido! (+10 pts)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTakeShot}
                  className="h-11 rounded-xl bg-amber-950/70 border border-amber-600/40 hover:bg-amber-900/60 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Wine className="w-3.5 h-3.5" />
                  <span>Tomar Trago / Chupito</span>
                </button>

                <button
                  onClick={handleReroll}
                  className="h-11 rounded-xl bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  title="Cambia la carta pero suma un chupito de castigo"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Cambiar (+1 Chupito)</span>
                </button>
              </div>

              <button
                onClick={handleSkip}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Pasar turno sin puntos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
