
import React from 'react';
import { useGameStore } from '../store';
import { Suit } from '../types';

const getSuitLabel = (suit: Suit) => {
  switch (suit) {
    case 'MAN': return '代码 (Docx)';
    case 'PIN': return '幻灯片 (Pptx)';
    case 'SOU': return '数据 (Xlsx)';
    case 'HONOR': return '黑话 (Conf)';
    default: return '未知';
  }
};

const getSuitColor = (suit: Suit) => {
  switch (suit) {
    case 'MAN': return 'bg-[#3370ff]';
    case 'PIN': return 'bg-[#f85959]';
    case 'SOU': return 'bg-[#28c63f]';
    case 'HONOR': return 'bg-[#7c3aed]';
    default: return 'bg-gray-400';
  }
};

export const HandStatistics: React.FC = () => {
  const { hand, melds, doras } = useGameStore();

  const allTiles = React.useMemo(() => [
    ...hand,
    ...melds.flatMap(m => m.tiles)
  ], [hand, melds]);

  const stats = React.useMemo(() => {
    const suitCounts: Record<Suit, number> = { MAN: 0, PIN: 0, SOU: 0, HONOR: 0 };
    const valueCounts: number[] = Array(10).fill(0);
    let doraCount = 0;

    allTiles.forEach(t => {
      suitCounts[t.suit]++;
      if (t.suit !== 'HONOR') {
        valueCounts[t.value]++;
      }
      if (t.isDora) doraCount++;
    });

    const dominantSuit = (Object.entries(suitCounts) as [Suit, number][])
      .reduce((a, b) => b[1] > a[1] ? b : a)[0];

    return { suitCounts, valueCounts, doraCount, dominantSuit, total: allTiles.length };
  }, [allTiles]);

  return (
    <div className="flex flex-col gap-6 p-2 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">赋能强度</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-orange-500 italic">x{stats.doraCount * 2 || 1}</span>
            <span className="text-[9px] font-bold text-gray-300 mb-1">Dora x {stats.doraCount}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">主攻领域</p>
          <p className={`text-sm font-black italic ${getSuitColor(stats.dominantSuit).replace('bg-', 'text-')}`}>
            {getSuitLabel(stats.dominantSuit).split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Suit Distribution */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3">业务领域分布</h4>
        <div className="space-y-4">
          {(Object.entries(stats.suitCounts) as [Suit, number][]).map(([suit, count]) => (
            <div key={suit} className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-600">{getSuitLabel(suit)}</span>
                <span className="text-gray-400">{count} / {stats.total}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getSuitColor(suit)} transition-all duration-1000 ease-out`}
                  style={{ width: `${(count / stats.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Heatmap */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-orange-500 pl-3">模块成熟度分布 (1-9)</h4>
        <div className="grid grid-cols-9 gap-1.5">
          {stats.valueCounts.slice(1).map((count, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div 
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                  count > 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-50 text-gray-200'
                }`}
                style={{ opacity: count > 0 ? 0.3 + (count * 0.2) : 1 }}
              >
                {count > 0 ? count : ''}
              </div>
              <span className="text-[8px] font-bold text-gray-300">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="mt-auto p-5 bg-blue-50/50 rounded-[32px] border border-blue-100">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">职场智库分析</p>
        <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
          {stats.dominantSuit === 'MAN' && "当前【代码】模块密集，建议寻找【颗粒度对齐】文档以实现倍率爆破。"}
          {stats.dominantSuit === 'PIN' && "【幻灯片】模块占主导，请重点对齐【抓手】文档提升基础产出。"}
          {stats.dominantSuit === 'SOU' && "【数据】模块丰富，需配合【闭环】逻辑完成高质量交付。"}
          {stats.dominantSuit === 'HONOR' && "【黑话】模块较多，建议加强【赋能】力度，提升单点突破能力。"}
        </p>
      </div>
    </div>
  );
};
