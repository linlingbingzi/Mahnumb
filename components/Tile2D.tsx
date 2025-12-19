
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
        relative w-14 h-20 md:w-16 md:h-24 rounded-xl cursor-pointer select-none transition-all duration-300
        flex flex-col items-center justify-between overflow-hidden
        ${config.bg} shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/20
        ${selected ? '-translate-y-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)] ring-4 ring-white/80 scale-110 z-20' : 'hover:-translate-y-2'}
        ${tile.isDora ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}
        ${isHighlighted ? 'meld-glow z-30' : ''}
        ${isPartOfHandMeld && !selected ? 'border-2 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}
        ${isPotential && !selected ? 'ring-2 ring-white animate-pulse border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : ''}
        ${isHu ? 'ring-4 ring-yellow-400 animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.8)]' : ''}
        ${isWait ? 'ring-2 ring-blue-400 animate-bounce shadow-[0_0_15px_rgba(59,130,245,0.6)]' : ''}
      `}
      style={{
        clipPath: 'polygon(0 0, 80% 0, 100% 15%, 100% 100%, 0 100%)'
      }}
    >
      <div 
        className="absolute top-0 right-0 w-[20%] h-[15%] bg-white/20 pointer-events-none"
        style={{
          clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
          backgroundColor: 'rgba(255,255,255, 0.4)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
      
      {tile.isDora && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent)] animate-pulse" />
      )}

      {isWait && (
        <div className="absolute top-1 right-5 bg-blue-500 text-white text-[7px] font-black px-1 rounded shadow-sm z-20">WAIT</div>
      )}

      {isPotential && (
        <div className="absolute top-1 right-5 bg-green-500 text-white text-[7px] font-black px-1 rounded shadow-sm z-20">MELD?</div>
      )}

      <div className="w-full pt-1.5 px-2 flex justify-between items-center text-white/90 z-10">
        <span className="text-[10px] font-black tracking-tight bg-black/30 px-1.5 rounded-md backdrop-blur-sm">
          {tile.suit === 'HONOR' ? '⭐' : tile.value}
        </span>
        <div className="opacity-90 scale-100 drop-shadow-sm">{config.icon}</div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full px-1 z-10">
        <span className={`text-white font-black leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-center ${tile.suit === 'HONOR' ? 'text-[9px] uppercase tracking-tighter max-w-[85%]' : 'text-3xl md:text-5xl'}`}>
          {tile.label}
        </span>
      </div>

      <div className="w-full bg-black/20 py-1 px-2 z-10 border-t border-white/10">
        <span className="text-[8px] font-black text-white/80 uppercase tracking-widest block text-center truncate italic">
          .{config.label}
        </span>
      </div>
    </div>
  );
};
