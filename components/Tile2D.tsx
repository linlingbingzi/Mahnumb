
import React from 'react';
import { Tile, Suit } from '../types';

interface Tile2DProps {
  tile: Tile;
  selected: boolean;
  onClick: () => void;
  isNew?: boolean;
  isHighlighted?: boolean;
  isHu?: boolean;
  isWait?: boolean;
  isPartOfHandMeld?: boolean;
  isPotential?: boolean;
}

const getSuitConfig = (suit: Suit) => {
  switch (suit) {
    case 'MAN': 
      return { 
        bg: 'bg-[#3370ff]', 
        label: 'Docx',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="14" y2="17" />
          </svg>
        )
      };
    case 'PIN': 
      return { 
        bg: 'bg-[#f85959]', 
        label: 'Pptx',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <circle cx="10" cy="14" r="3" />
            <path d="M10 11v3h3" />
          </svg>
        )
      };
    case 'SOU': 
      return { 
        bg: 'bg-[#28c63f]', 
        label: 'Xlsx',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 11h8v6H8z" />
            <path d="M12 11v6" />
            <path d="M8 14h8" />
          </svg>
        )
      };
    case 'HONOR': 
      return { 
        bg: 'bg-[#7c3aed]', 
        label: 'Conf',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="m9 13 2 2 4-4" />
          </svg>
        )
      };
    default: 
      return { bg: 'bg-gray-500', label: 'File', icon: null };
  }
};

export const Tile2D: React.FC<Tile2DProps> = ({ tile, selected, onClick, isHighlighted, isHu, isWait, isPartOfHandMeld, isPotential }) => {
  const config = getSuitConfig(tile.suit);

  return (
    <div
      onClick={onClick}
      className={`
        relative w-20 h-28 md:w-24 md:h-36 rounded-2xl cursor-pointer select-none transition-all duration-300
        flex flex-col items-center justify-between overflow-hidden
        ${config.bg} shadow-[0_6px_20px_rgba(0,0,0,0.2)] border border-white/20
        ${selected ? '-translate-y-12 shadow-[0_30px_60px_rgba(51,112,255,0.4)] ring-4 ring-white/90 scale-105 z-30' : 'hover:-translate-y-2'}
        ${tile.isDora ? 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]' : ''}
        ${isHighlighted ? 'meld-glow z-40' : ''}
        ${isPartOfHandMeld && !selected ? 'border-2 border-green-300 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : ''}
        ${isPotential && !selected ? 'ring-2 ring-emerald-300 animate-mini-glow shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}
        ${isHu ? 'ring-4 ring-yellow-400 animate-pulse shadow-[0_0_40px_rgba(250,204,21,0.8)]' : ''}
        ${isWait && !selected ? 'animate-electric z-20 scale-[1.02]' : ''}
      `}
      style={{
        clipPath: 'polygon(0 0, 85% 0, 100% 12%, 100% 100%, 0 100%)'
      }}
    >
      <div 
        className="absolute top-0 right-0 w-[18%] h-[12%] bg-white/30 pointer-events-none"
        style={{
          clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
          backgroundColor: 'rgba(255,255,255, 0.5)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-black/15 pointer-events-none" />
      
      {tile.isDora && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent)] animate-pulse" />
      )}

      {isWait && (
        <div className="absolute top-2 right-6 bg-[#00e5ff] text-gray-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-[0_0_10px_#00e5ff] z-20 animate-pulse">待上线</div>
      )}

      {isPotential && (
        <div className="absolute top-2 right-6 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-20">可对齐</div>
      )}

      <div className="w-full pt-2 px-3 flex justify-between items-center text-white/95 z-10">
        <span className="text-[14px] font-black tracking-tighter bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-md border border-white/10 shadow-sm">
          {tile.suit === 'HONOR' ? '⭐' : tile.value}
        </span>
        <div className="opacity-90 scale-110 drop-shadow-md">{config.icon}</div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full px-2 z-10 py-1">
        <span className={`text-white font-black leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] text-center tracking-tighter ${tile.suit === 'HONOR' ? 'text-[12px] md:text-[14px] uppercase tracking-tighter max-w-[90%]' : 'text-5xl md:text-7xl'}`}>
          {tile.label}
        </span>
      </div>

      <div className="w-full bg-black/30 py-1.5 px-3 z-10 border-t border-white/10">
        <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] block text-center truncate italic">
          .{config.label}
        </span>
      </div>
    </div>
  );
};
