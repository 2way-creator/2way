import React, { useState, useEffect } from 'react';
import { Player, GameIntensity, SpinMode, BottleSkin, QuestionDareItem, GameCategory } from './types';
import { INITIAL_QUESTIONS_AND_DARES, DEFAULT_PLAYERS, GAME_CATEGORIES } from './data/questionsAndDares';
import { arenaTableImg } from './data/skins';
import { BottleSpinner } from './components/BottleSpinner';
import { TurnChallengeModal } from './components/TurnChallengeModal';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { CustomQuestionsModal } from './components/CustomQuestionsModal';
import { CategoriesModal } from './components/CategoriesModal';
import { CelebrationModal } from './components/CelebrationModal';
import { sound } from './utils/audio';
import {
  Users,
  Flame,
  Trophy,
  Sliders,
  PlusCircle,
  Wine,
  Sparkles,
  Volume2,
  VolumeX,
  History,
  RotateCw,
} from 'lucide-react';

interface GameLogEntry {
  id: string;
  playerName: string;
  partnerName?: string;
  type: 'completed' | 'shot' | 'skipped';
  timestamp: string;
}

export default function App() {
  // Saved states from localStorage
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('botellita_players');
      if (saved) {
        const parsed: Player[] = JSON.parse(saved);
        return parsed.map((p, idx) => {
          if (!p.avatarImage && DEFAULT_PLAYERS[idx]?.avatarImage) {
            return { ...p, avatarImage: DEFAULT_PLAYERS[idx].avatarImage };
          }
          return p;
        });
      }
    } catch {}
    return DEFAULT_PLAYERS;
  });

  const [intensity, setIntensity] = useState<GameIntensity>(() => {
    try {
      const saved = localStorage.getItem('botellita_intensity');
      if (saved) return saved as GameIntensity;
    } catch {}
    return 'party';
  });

  const [mode, setMode] = useState<SpinMode>(() => {
    try {
      const saved = localStorage.getItem('botellita_mode');
      if (saved) return saved as SpinMode;
    } catch {}
    return 'duo';
  });

  const [skin, setSkin] = useState<BottleSkin>(() => {
    try {
      const saved = localStorage.getItem('botellita_skin');
      if (saved) return saved as BottleSkin;
    } catch {}
    return 'lego';
  });

  const [deck, setDeck] = useState<QuestionDareItem[]>(() => {
    try {
      const saved = localStorage.getItem('botellita_custom_cards');
      if (saved) {
        const customItems: QuestionDareItem[] = JSON.parse(saved);
        return [...INITIAL_QUESTIONS_AND_DARES, ...customItems];
      }
    } catch {}
    return INITIAL_QUESTIONS_AND_DARES;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Turn state
  const [selectedTarget, setSelectedTarget] = useState<Player | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<Player | null>(null);
  const [isTurnModalOpen, setIsTurnModalOpen] = useState<boolean>(false);

  // UI Modals
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isScoreboardModalOpen, setIsScoreboardModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState<boolean>(false);

  const [celebratingData, setCelebratingData] = useState<{
    player: Player | null;
    secondPlayer: Player | null;
    card?: QuestionDareItem;
  } | null>(null);

  // Enabled Categories
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>(() => {
    try {
      const saved = localStorage.getItem('botellita_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return GAME_CATEGORIES.map((c) => c.id);
  });

  // Game activity log
  const [logs, setLogs] = useState<GameLogEntry[]>([]);

  // Persist players
  useEffect(() => {
    try {
      localStorage.setItem('botellita_players', JSON.stringify(players));
    } catch {}
  }, [players]);

  // Persist settings & categories
  useEffect(() => {
    try {
      localStorage.setItem('botellita_intensity', intensity);
      localStorage.setItem('botellita_mode', mode);
      localStorage.setItem('botellita_skin', skin);
      localStorage.setItem('botellita_categories', JSON.stringify(selectedCategories));
    } catch {}
  }, [intensity, mode, skin, selectedCategories]);

  const handleToggleCategory = (catId: GameCategory) => {
    sound.playTick(750);
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length <= 1) return prev; // Keep at least 1 category
        return prev.filter((id) => id !== catId);
      }
      return [...prev, catId];
    });
  };

  const handleSpinEnd = (targetPlayer: Player, secondPlayer: Player | null) => {
    setSelectedTarget(targetPlayer);
    setSelectedSecond(secondPlayer);
    setIsTurnModalOpen(true);
  };

  const handleTurnResolution = (
    playerId: string,
    result: 'completed' | 'shot' | 'skipped',
    card?: QuestionDareItem
  ) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        if (result === 'completed') {
          return {
            ...p,
            score: p.score + 10,
            daresCompleted: p.daresCompleted + 1,
          };
        }
        if (result === 'shot') {
          return {
            ...p,
            shotsCount: p.shotsCount + 1,
          };
        }
        return p;
      })
    );

    const target = players.find((p) => p.id === playerId);
    if (target) {
      if (result === 'completed') {
        setCelebratingData({
          player: target,
          secondPlayer: selectedSecond,
          card,
        });
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newEntry: GameLogEntry = {
        id: `log-${Date.now()}`,
        playerName: target.name,
        partnerName: selectedSecond ? selectedSecond.name : undefined,
        type: result,
        timestamp: timeStr,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 19)]);
    }
  };

  const handleAddCustomCard = (card: QuestionDareItem) => {
    const updated = [...deck, card];
    setDeck(updated);
    try {
      const customOnly = updated.filter((c) => c.isCustom);
      localStorage.setItem('botellita_custom_cards', JSON.stringify(customOnly));
    } catch {}
  };

  const handleRemoveCustomCard = (id: string) => {
    const updated = deck.filter((c) => c.id !== id);
    setDeck(updated);
    try {
      const customOnly = updated.filter((c) => c.isCustom);
      localStorage.setItem('botellita_custom_cards', JSON.stringify(customOnly));
    } catch {}
  };

  const handleResetScores = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        shotsCount: 0,
        daresCompleted: 0,
        truthsAnswered: 0,
      }))
    );
    setLogs([]);
  };

  const hombresCount = players.filter((p) => p.gender === 'hombre').length;
  const mujeresCount = players.filter((p) => p.gender === 'mujer').length;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* Background VIP Arena texture scrim */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={arenaTableImg}
          alt="VIP Arena Lounge"
          className="w-full h-full object-cover opacity-20 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/95 via-[#070913]/85 to-[#070913]" />
      </div>

      {/* TOP BAR CONTRACT: Zone 1 (Wordmark) — Zone 2 (4 Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="relative z-30 flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        {/* Zone 1: Logotipo oficial LA BOTELLITA con distintivo 2WAY */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-display text-lg sm:text-xl font-black tracking-tight text-white whitespace-nowrap">
            LA BOTELLITA
          </span>
          <span className="inline-flex items-center text-[10px] sm:text-[11px] font-black tracking-widest text-amber-200 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 px-2 sm:px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.45)] border border-amber-300/30">
            2WAY
          </span>
        </div>

        {/* Zone 2: 4-5 single-line clean text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setIsPlayersModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🧱 Minifiguras Lego ({players.length})</span>
          </button>
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Categorías ({selectedCategories.length}/6)</span>
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-white hover:scale-105 transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              Modo: {intensity === 'hot' ? 'Hot +18' : intensity === 'party' ? 'Fiesta' : 'Suave'}
            </span>
          </button>
          <button
            onClick={() => setIsScoreboardModalOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Marcador</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const next = !soundEnabled;
              sound.enabled = next;
              setSoundEnabled(next);
            }}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonido'}
            aria-label="Alternar sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl hover:from-rose-500 hover:to-pink-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all duration-200 shadow-md shadow-rose-600/30 whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">Ajustes</span>
          </button>
        </div>
      </header>

      {/* MAIN GAME CONTAINER: Full Viewport Presence */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 flex flex-col justify-center items-center">
        {/* Quick status bar */}
        <div className="w-full max-w-xl flex items-center justify-between text-xs text-slate-400 px-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-semibold">{players.length} en la mesa</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-300">{hombresCount} ♂</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-300">{mujeresCount} ♀</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-300 font-medium">
              {mode === 'duo' ? 'Dúo (Punta & Base)' : 'Individual'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-bold uppercase">
              {intensity === 'hot' ? '🌶️ Hot +18' : intensity === 'party' ? '🔥 Fiesta' : '🧊 Suave'}
            </span>
          </div>
        </div>

        {/* Central Arena: Desktop 2-column or centered layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left panel (desktop only: Party Rules & Live Group Info) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/75 border border-white/10 backdrop-blur-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                <Flame className="w-4 h-4" />
                Reglas de LA BOTELLITA de 2WAY
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {mode === 'duo'
                  ? 'La punta de la botella señala a la víctima y la base al cómplice o retador. ¡Si es hombre y mujer, la tensión aumenta!'
                  : 'Gira la botella. A quien señale la punta debe responder una verdad íntima o cumplir el reto atrevido.'}
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Cumplir el reto = +10 Puntos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Negarse o pasar = 1 Chupito 🥃</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Respeto y diversión ante todo</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-4 rounded-2xl bg-slate-900/75 border border-white/10 backdrop-blur-md space-y-2">
              <button
                onClick={() => setIsCategoriesModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Categorías de Retos
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  {selectedCategories.length}/6 activas
                </span>
              </button>

              <button
                onClick={() => setIsPlayersModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Minifiguras Lego
                </span>
                <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  {players.length} en mesa
                </span>
              </button>

              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                  Añadir Reto Secreto
                </span>
                <span className="text-[10px] text-purple-300">Nuevo</span>
              </button>
            </div>
          </div>

          {/* Center Column: The Interactive Bottle Spinner */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <BottleSpinner
              players={players}
              skin={skin}
              mode={mode}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </div>

          {/* Right panel (desktop only: Recent Activity Log) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/75 border border-white/10 backdrop-blur-md flex flex-col max-h-[380px]">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  Historial de la Noche
                </span>
                <button
                  onClick={() => setIsScoreboardModalOpen(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Ver Ranking
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
                {logs.length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-[11px]">
                    Aún no han girado la botella. ¡Presiona el botón o arrastra la botella para empezar!
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-100 truncate block">
                          {log.playerName}
                          {log.partnerName ? ` con ${log.partnerName}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.type === 'completed'
                            ? '✅ Cumplió el desafío'
                            : log.type === 'shot'
                            ? '🥃 Tomó un trago de castigo'
                            : '⏭️ Pasó el turno'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                        {log.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE THUMB-BAR (Ergonomic Natural Thumb Reach Zone) */}
      <nav className="relative z-30 md:hidden bg-slate-950/90 backdrop-blur-lg border-t border-white/10 px-3 py-2">
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          <button
            onClick={() => setIsPlayersModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          >
            <Users className="w-4.5 h-4.5 text-amber-400" />
            <span className="text-[9px] font-medium mt-1 truncate">Minifiguras</span>
          </button>

          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          >
            <Flame className="w-4.5 h-4.5 text-amber-400" />
            <span className="text-[9px] font-medium mt-1 truncate">Categorías</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          >
            <Sliders className="w-4.5 h-4.5 text-sky-400" />
            <span className="text-[9px] font-medium mt-1 truncate">Ajustes</span>
          </button>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          >
            <PlusCircle className="w-4.5 h-4.5 text-purple-400" />
            <span className="text-[9px] font-medium mt-1 truncate">Reto</span>
          </button>

          <button
            onClick={() => setIsScoreboardModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          >
            <Trophy className="w-4.5 h-4.5 text-yellow-400" />
            <span className="text-[9px] font-medium mt-1 truncate">Puntos</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      <TurnChallengeModal
        isOpen={isTurnModalOpen}
        targetPlayer={selectedTarget}
        secondPlayer={selectedSecond}
        intensity={intensity}
        deck={deck.filter((c) => selectedCategories.includes(c.category)).length > 0
          ? deck.filter((c) => selectedCategories.includes(c.category))
          : deck}
        onComplete={handleTurnResolution}
        onClose={() => setIsTurnModalOpen(false)}
      />

      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <PlayerSetupModal
        isOpen={isPlayersModalOpen}
        players={players}
        onSavePlayers={(newPlayers) => setPlayers(newPlayers)}
        onClose={() => setIsPlayersModalOpen(false)}
      />

      <GameSettingsModal
        isOpen={isSettingsModalOpen}
        intensity={intensity}
        setIntensity={setIntensity}
        mode={mode}
        setMode={setMode}
        skin={skin}
        setSkin={setSkin}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ScoreboardModal
        isOpen={isScoreboardModalOpen}
        players={players}
        onResetScores={handleResetScores}
        onClose={() => setIsScoreboardModalOpen(false)}
      />

      <CustomQuestionsModal
        isOpen={isCustomModalOpen}
        deck={deck}
        onAddCustomCard={handleAddCustomCard}
        onRemoveCustomCard={handleRemoveCustomCard}
        onClose={() => setIsCustomModalOpen(false)}
      />

      <CelebrationModal
        isOpen={celebratingData !== null}
        player={celebratingData?.player || null}
        secondPlayer={celebratingData?.secondPlayer || null}
        cardText={celebratingData?.card?.text}
        cardType={celebratingData?.card?.type}
        onClose={() => setCelebratingData(null)}
      />
    </div>
  );
}
