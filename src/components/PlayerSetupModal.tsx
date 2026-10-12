import React, { useState } from 'react';
import { Player, Gender } from '../types';
import { sound } from '../utils/audio';
import { UserPlus, Trash2, Users, Check, Sparkles } from 'lucide-react';
import {
  LEGO_AVATARS,
  legoGentlemanImg,
  legoLadyImg,
  legoRockerImg,
  legoGlamourImg,
  legoDjImg,
  legoChicImg,
  legoPirateImg,
  legoRebelImg,
} from '../data/legoAvatars';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerSetupModalProps {
  isOpen: boolean;
  players: Player[];
  onSavePlayers: (players: Player[]) => void;
  onClose: () => void;
}

const COLOR_OPTIONS = ['#38bdf8', '#fb7185', '#34d399', '#c084fc', '#fbbf24', '#f43f5e', '#a855f7', '#06b6d4'];

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  isOpen,
  players,
  onSavePlayers,
  onClose,
}) => {
  const [list, setList] = useState<Player[]>(players);
  const [newName, setNewName] = useState<string>('');
  const [newGender, setNewGender] = useState<Gender>('hombre');
  const [selectedLegoId, setSelectedLegoId] = useState<string>('lego-gentleman');

  if (!isOpen) return null;

  const currentLego = LEGO_AVATARS.find((l) => l.id === selectedLegoId) || LEGO_AVATARS[0];

  const handleGenderChange = (gender: Gender) => {
    setNewGender(gender);
    // Auto-select first matching Lego avatar for that gender
    const match = LEGO_AVATARS.find((l) => l.gender === gender);
    if (match) setSelectedLegoId(match.id);
  };

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (list.length >= 12) return;

    sound.playTick(1000);
    const color = COLOR_OPTIONS[list.length % COLOR_OPTIONS.length];
    const lego = LEGO_AVATARS.find((l) => l.id === selectedLegoId) || LEGO_AVATARS[0];

    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      gender: newGender,
      avatar: lego.emojiFallback,
      avatarImage: lego.image,
      color,
      score: 0,
      shotsCount: 0,
      daresCompleted: 0,
      truthsAnswered: 0,
    };

    const updated = [...list, newPlayer];
    setList(updated);
    setNewName('');
    handleGenderChange(newGender === 'hombre' ? 'mujer' : 'hombre');
  };

  const handleRemovePlayer = (id: string) => {
    if (list.length <= 2) return;
    sound.playTick(400);
    setList(list.filter((p) => p.id !== id));
  };

  const handleApplyPreset = (type: 'balanced6' | 'balanced8' | 'pairs4') => {
    sound.playSuccess();
    if (type === 'balanced6') {
      setList([
        { id: 'p1', name: 'Carlos', gender: 'hombre', avatar: '🤵‍♂️', avatarImage: legoGentlemanImg, color: '#38bdf8', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p2', name: 'Sofía', gender: 'mujer', avatar: '💃', avatarImage: legoLadyImg, color: '#fb7185', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p3', name: 'Mateo', gender: 'hombre', avatar: '😎', avatarImage: legoRockerImg, color: '#34d399', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p4', name: 'Valentina', gender: 'mujer', avatar: '✨', avatarImage: legoGlamourImg, color: '#c084fc', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p5', name: 'Diego', gender: 'hombre', avatar: '🎧', avatarImage: legoDjImg, color: '#fbbf24', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p6', name: 'Camila', gender: 'mujer', avatar: '🧢', avatarImage: legoRebelImg, color: '#f43f5e', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
      ]);
    } else if (type === 'balanced8') {
      setList([
        { id: 'p1', name: 'Lucas', gender: 'hombre', avatar: '🤵‍♂️', avatarImage: legoGentlemanImg, color: '#38bdf8', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p2', name: 'Lucía', gender: 'mujer', avatar: '💃', avatarImage: legoLadyImg, color: '#fb7185', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p3', name: 'Sebas', gender: 'hombre', avatar: '😎', avatarImage: legoRockerImg, color: '#34d399', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p4', name: 'Elena', gender: 'mujer', avatar: '✨', avatarImage: legoGlamourImg, color: '#c084fc', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p5', name: 'Julián', gender: 'hombre', avatar: '🎧', avatarImage: legoDjImg, color: '#fbbf24', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p6', name: 'Martina', gender: 'mujer', avatar: '💅', avatarImage: legoChicImg, color: '#f43f5e', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p7', name: 'Andrés', gender: 'hombre', avatar: '🏴‍☠️', avatarImage: legoPirateImg, color: '#a855f7', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p8', name: 'Isabela', gender: 'mujer', avatar: '🧢', avatarImage: legoRebelImg, color: '#06b6d4', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
      ]);
    } else {
      setList([
        { id: 'p1', name: 'Álvaro', gender: 'hombre', avatar: '🤵‍♂️', avatarImage: legoGentlemanImg, color: '#38bdf8', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p2', name: 'Sara', gender: 'mujer', avatar: '💃', avatarImage: legoLadyImg, color: '#fb7185', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p3', name: 'Bruno', gender: 'hombre', avatar: '😎', avatarImage: legoRockerImg, color: '#34d399', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
        { id: 'p4', name: 'Clara', gender: 'mujer', avatar: '✨', avatarImage: legoGlamourImg, color: '#c084fc', score: 0, shotsCount: 0, daresCompleted: 0, truthsAnswered: 0 },
      ]);
    }
  };

  const handleSave = () => {
    onSavePlayers(list);
    onClose();
  };

  const hombresCount = list.filter((p) => p.gender === 'hombre').length;
  const mujeresCount = list.filter((p) => p.gender === 'mujer').length;
  const otrosCount = list.filter((p) => p.gender === 'otro').length;

  const filteredLegoList = LEGO_AVATARS.filter((l) => l.gender === newGender || newGender === 'otro');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm">
              🧱
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Personajes Lego de la Mesa</h3>
              <p className="text-xs text-slate-400">
                {list.length} en total · {hombresCount} hombres, {mujeresCount} mujeres{otrosCount > 0 ? `, ${otrosCount} otros` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Plantillas de Lego rápidas:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleApplyPreset('pairs4')}
                className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-[11px] font-medium text-slate-200 border border-white/5 active:scale-98 transition-all"
              >
                2 Parejas (4)
              </button>
              <button
                onClick={() => handleApplyPreset('balanced6')}
                className="py-1.5 px-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-[11px] font-semibold text-rose-300 border border-rose-500/20 active:scale-98 transition-all"
              >
                Grupo 6 (3H + 3M)
              </button>
              <button
                onClick={() => handleApplyPreset('balanced8')}
                className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-[11px] font-medium text-slate-200 border border-white/5 active:scale-98 transition-all"
              >
                Fiesta 8 (4H + 4M)
              </button>
            </div>
          </div>

          {/* Add New Player Form */}
          <form onSubmit={handleAddPlayer} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              Añadir Personaje Lego
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del jugador/a..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={14}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!newName.trim() || list.length >= 12}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                Añadir
              </button>
            </div>

            {/* Gender Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">Género:</span>
              <button
                type="button"
                onClick={() => handleGenderChange('hombre')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium border transition-colors ${
                  newGender === 'hombre'
                    ? 'bg-sky-950 border-sky-400 text-sky-200 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                👨 Hombre
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('mujer')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium border transition-colors ${
                  newGender === 'mujer'
                    ? 'bg-rose-950 border-rose-400 text-rose-200 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                👩 Mujer
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('otro')}
                className={`py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
                  newGender === 'otro'
                    ? 'bg-purple-950 border-purple-400 text-purple-200 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                🌈 Otro
              </button>
            </div>

            {/* Lego Minifigure Avatar Gallery */}
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                Selecciona tu Minifigura Lego:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {filteredLegoList.map((lego) => {
                  const isSelected = selectedLegoId === lego.id;
                  return (
                    <button
                      key={lego.id}
                      type="button"
                      onClick={() => setSelectedLegoId(lego.id)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/50 shadow-md scale-102'
                          : 'border-white/5 bg-slate-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-950 border border-white/10">
                        {lego.image ? (
                          <img
                            src={lego.image}
                            alt={lego.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="text-xl">{lego.emojiFallback}</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-200 truncate w-full text-center">
                        {lego.name.replace('Lego ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Current Players List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              En la mesa ({list.length}/12):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {list.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PlayerAvatar player={p} size="sm" />
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-100 truncate block">
                        {idx + 1}. {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.gender === 'hombre' ? 'Hombre' : p.gender === 'mujer' ? 'Mujer' : 'Otro'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemovePlayer(p.id)}
                    disabled={list.length <= 2}
                    className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                    title="Eliminar jugador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            {list.length < 2 ? 'Mínimo 2 jugadores' : '¡Listo para jugar!'}
          </span>
          <button
            onClick={handleSave}
            disabled={list.length < 2}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-rose-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Minifiguras</span>
          </button>
        </div>
      </div>
    </div>
  );
};
