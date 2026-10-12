import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isHighlighted?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 'md',
  className = '',
  isHighlighted = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 sm:w-12 sm:h-12 text-lg sm:text-xl',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl',
  }[size];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden shrink-0 select-none ${sizeClasses} ${className}`}
    >
      {player.avatarImage && !imgError ? (
        <img
          src={player.avatarImage}
          alt={`Lego ${player.name}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top filter contrast-105 pointer-events-none"
        />
      ) : (
        /* Styled Lego Head Fallback */
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 to-amber-500 text-slate-900 font-bold"
          style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}
        >
          {/* Subtle Lego Stud Top Detail */}
          <div className="absolute top-0.5 w-2 h-1 rounded-xs bg-amber-300/80 pointer-events-none" />
          <span>{player.avatar}</span>
        </div>
      )}

      {/* Glossy Plastic Sheen Overlay (Authentic Lego Plastic Texture) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/30 pointer-events-none" />
    </div>
  );
};
