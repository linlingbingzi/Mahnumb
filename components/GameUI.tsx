
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useGameStore } from '../store';
import { Tile2D } from './Tile2D';
import { PigeonDoc, Tile, WorkplaceMessage } from '../types';
import { HandStatistics } from './HandStatistics';

const MessageBubble: React.FC<{ msg: WorkplaceMessage; animate?: boolean }> = ({ msg, animate = true }) => {
  const isUser = msg.role === 'USER';
  const isSystem = msg.role === 'SYSTEM';

  if (isSystem) {
    return (
      <div className={`flex justify-center my-6 ${animate ? 'animate-in fade-in zoom-in duration-500' : ''}`}>
        <div className="bg-gray-200/40 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100/30">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col mb-8 ${animate ? 'animate-in slide-in-from-bottom-3 duration-400' : ''} ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-4 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Feishu Style Avatar */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg shrink-0 border-2 border-white transform hover:scale-110 transition-transform ${isUser ? 'bg-[#3370ff]' : (msg.sender.includes('张总') ? 'bg-red-600' : (msg.sender.includes('PM') || msg.sender.includes('产品') ? 'bg-orange-500' : 'bg-emerald-500'))}`}>
          {msg.sender[0]}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`flex gap-3 items-baseline mb-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
            <span className="text-[12px] font-black text-gray-700 tracking-tight">{msg.sender}</span>
            <span className="text-[10px] font-bold text-gray-300">{msg.time}</span>
          </div>
          
          <div className={`relative px-5 py-4 rounded-2xl shadow-md border max-w-[280px] ${isUser ? 'bg-[#3370ff] text-white rounded-tr-none border-[#3370ff]/10 shadow-blue-500/20' : 'bg-white border-gray-100 text-gray-700 rounded-tl-none shadow-gray-200/50'}`}>
            <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
            
            {msg.type === 'meld' && msg.details?.tiles && (
              <div className="mt-4 flex gap-1 p-2 bg-black/5 rounded-xl border border-black/5 overflow-hidden justify-center">
                {msg.details.tiles.map(t => (
                  <div key={t.id} className="scale-[0.25] origin-center -mx-7 -my-10">
                    <Tile2D tile={t} selected={false} onClick={()=>{}} />
                  </div>
                ))}
              </div>
            )}
            
            {msg.type === 'result' && msg.details && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{msg.details.name}</span>
                  <span className="text-lg font-black text-gray-900 tracking-tighter">+{msg.details.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-gray-400">
                  <span>工作量: {msg.details.chips}</span>
                  <span>绩效倍率: {msg.details.mult.toFixed(1)}x</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 shadow-[0_0_8px_#3370ff] transition-all duration-1000" style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GameUI: React.FC = () => {
  const { 
    score, turnsLeft, hand, melds, deck, selectedIndices, targetScore, currentYear, currentStage,
    requestIteration, confirmIteration, submitHand, executeDemoMeld, state, startOnboarding, initGame, nextRound, money,
    workplaceMessages, onboardingMessages, canHu, doras, selectTile, sortHand, resetGame, 
    ownedDocs, shopDocs, buyDoc, pendingOptions, tenpaiMap
  } = useGameStore();

  const chatRef = useRef<HTMLDivElement>(null);
  const onboardingChatRef = useRef<HTMLDivElement>(null);
  const [hoverDoc, setHoverDoc] = useState<PigeonDoc | null>(null);
  const [visibleOnboardingCount, setVisibleOnboardingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'STATS'>('CHAT');

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [workplaceMessages, activeTab]);

  useEffect(() => {
    if (onboardingChatRef.current) onboardingChatRef.current.scrollTop = onboardingChatRef.current.scrollHeight;
  }, [visibleOnboardingCount]);

  // Onboarding sequence
  useEffect(() => {
    if (state === 'ONBOARDING' && visibleOnboardingCount < onboardingMessages.length) {
      const timer = setTimeout(() => {
        setVisibleOnboardingCount(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, visibleOnboardingCount, onboardingMessages]);

  const selectedWaits = useMemo(() => {
    if (selectedIndices.length !== 1) return null;
    const tileId = hand[selectedIndices[0]].id;
    return tenpaiMap[tileId] || null;
  }, [selectedIndices, hand, tenpaiMap]);

  const colleagueNames = ["隔壁老王", "架构小李", "测试阿强", "前端小美", "运维大叔"];
  const randomColleague = useMemo(() => colleagueNames[Math.floor(Math.random() * colleagueNames.length)], [selectedWaits]);

  if (state === 'MENU') {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#f0f2f5] p-4 overflow-hidden">
         <div className="scanline" />
         <div className="crt-noise" />
        <div className="w-full max-w-[1000px] h-[680px] bg-white rounded-[60px] shadow-2xl flex overflow-hidden border border-gray-200 relative z-10">
          <div className="w-[45%] bg-[#3370ff] p-20 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
            <h1 className="text-9xl font-black italic tracking-tighter drop-shadow-2xl glitch-text">牛麻</h1>
            <div className="space-y-4">
              <p className="text-3xl font-black italic leading-tight">打工人的麻将逆袭</p>
              <p className="text-lg opacity-70 font-medium">在 8 年职场长跑中对齐颗粒度，<br/>用鸽子文档赋能业务，实现商业闭环。</p>
            </div>
            <button onClick={startOnboarding} className="w-full py-6 bg-white text-blue-600 rounded-[30px] font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all shadow-blue-800/20 italic">办理入职</button>
          </div>
          <div className="w-[55%] flex flex-col justify-center p-20 bg-white space-y-10">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">在这里，对齐就是正义</h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">📈</div>
                <p className="text-gray-500 font-medium text-lg">对齐代码、PPT 和数据模块，产生高额绩效价值。</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">📄</div>
                <p className="text-gray-500 font-medium text-lg">采购强大的“鸽子文档”，为你的迭代插上想象的翅膀。</p>
              </div>
            </div>
            <div className="flex gap-6 p-8 bg-gray-50 rounded-[40px] border border-gray-100 shadow-inner">
              <div className="flex-1 text-center"><p className="text-3xl font-black text-gray-900 tracking-tighter">8 Years</p><p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">职业寿命</p></div>
              <div className="flex-1 text-center border-x border-gray-200"><p className="text-3xl font-black text-gray-900 tracking-tighter">¥4</p><p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">初始期权</p></div>
              <div className="flex-1 text-center"><p className="text-3xl font-black text-gray-900 tracking-tighter">200+</p><p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">首季挑战</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'ONBOARDING') {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-xl p-4 animate-in fade-in duration-500">
        <div className="w-full max-w-[550px] h-[720px] bg-white rounded-[50px] shadow-2xl flex flex-col overflow-hidden border border-white/20 relative">
          <div className="p-8 bg-white border-b flex justify-between items-center shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3370ff] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner italic">飞</div>
              <div>
                <h3 className="text-lg font-black text-gray-800 tracking-tight italic">飞书 · 核心对齐战斗群</h3>
                <p className="text-[10px] text-green-500 font-black animate-pulse uppercase tracking-widest flex items-center gap-1">
                  <span className="block w-2 h-2 bg-green-500 rounded-full" /> 
                  正在对齐路线图
                </p>
              </div>
            </div>
          </div>

          <div ref={onboardingChatRef} className="flex-1 overflow-y-auto p-8 space-y-2 no-scrollbar bg-[#f8f9fa] scroll-smooth">
            {onboardingMessages.slice(0, visibleOnboardingCount).map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </div>

          <div className="p-10 border-t bg-white shrink-0 flex flex-col items-center gap-4">
            {visibleOnboardingCount >= onboardingMessages.length ? (
              <button 
                onClick={() => {
                  setVisibleOnboardingCount(0);
                  initGame();
                }} 
                className="w-full py-5 bg-[#3370ff] text-white rounded-[30px] font-black text-xl shadow-xl hover:scale-105 transition-all animate-in zoom-in duration-500 italic shadow-blue-500/20"
              >
                我已深刻领会，开始对齐！
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" />
                </div>
                <span className="text-gray-400 text-[11px] font-black italic uppercase tracking-widest">PM 正在输入业务痛点...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-10 flex bg-[#f0f2f5] transition-all duration-700 ${canHu ? 'hu-overlay' : ''}`}>
      <div className="scanline" />
      <div className="crt-noise" />

      {/* Main Board */}
      <div className="flex-1 flex flex-col relative border-r border-gray-200 bg-white shadow-inner">
        
        {/* Top Header */}
        <div className="h-[80px] border-b border-gray-200 px-12 flex items-center justify-between bg-white/95 backdrop-blur-md z-30 shadow-sm">
          <div className="flex items-center gap-8">
             <div className="px-5 py-2 bg-red-600 text-white rounded-2xl text-[12px] font-black tracking-tighter shadow-lg shadow-red-500/20">
                YEAR {currentYear} Q{currentStage}
             </div>
             <div>
               <h3 className="font-black text-3xl text-gray-900 tracking-tight italic leading-none">
                 {currentStage === 4 ? "年终大促 (BOSS)" : "季度迭代 (Sprint)"}
               </h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">High-Granularity Alignment</p>
             </div>
          </div>
          
          <div className="flex gap-16 items-center">
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">季度 KPI 目标</span>
               <span className="text-4xl font-black text-red-500 tracking-tighter drop-shadow-sm">{targetScore.toLocaleString()}</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">当前交付价值</span>
               <span className={`text-4xl font-black tracking-tighter transition-all duration-500 drop-shadow-sm ${score >= targetScore ? 'text-green-500 scale-110 glitch-text' : 'text-[#3370ff]'}`}>{score.toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Pigeon Docs Area */}
        <div className="h-[160px] bg-gray-50/70 border-b border-gray-100 flex items-center px-12 gap-10 overflow-visible z-40 relative">
           <div className="flex flex-col shrink-0">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">持有文档 (Inventory)</span>
             <span className="text-xs text-blue-500 font-black italic mt-1 bg-blue-50 px-2 py-0.5 rounded-full">{ownedDocs.length} / 5</span>
           </div>
           
           <div className="flex gap-6">
              {ownedDocs.map(doc => (
                <div 
                  key={doc.id} 
                  onMouseEnter={() => setHoverDoc(doc)}
                  onMouseLeave={() => setHoverDoc(null)}
                  className="group relative w-24 h-24 bg-white border-2 border-blue-100 rounded-[32px] shadow-sm flex items-center justify-center hover:shadow-xl hover:-translate-y-3 transition-all cursor-help border-t-4 border-t-blue-500"
                >
                    <div className="text-4xl group-hover:scale-125 transition-all">📄</div>
                    <div className="absolute inset-0 bg-blue-500/5 rounded-[32px] opacity-0 group-hover:opacity-100 transition-all" />
                    <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full border border-blue-100 text-[10px] font-black text-blue-600 shadow-md whitespace-nowrap z-10">{doc.name}</div>
                </div>
              ))}
              {Array.from({ length: 5 - ownedDocs.length }).map((_, i) => (
                <div key={i} className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-[32px] bg-white/20 flex items-center justify-center">
                   <span className="text-gray-300 text-[10px] font-black italic">待对齐</span>
                </div>
              ))}
           </div>

           {/* Hover Buff Tooltip */}
           {hoverDoc && (
             <div className="absolute top-[140px] left-12 w-80 bg-gray-900/95 backdrop-blur-md text-white p-8 rounded-[40px] shadow-2xl z-[100] animate-in fade-in slide-in-from-top-6 duration-300 border border-white/10 ring-1 ring-blue-500/30">
                <div className="flex justify-between items-start mb-5">
                  <h4 className="text-2xl font-black tracking-tight text-blue-100 italic">{hoverDoc.name}</h4>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${hoverDoc.rarity === 'Rare' ? 'bg-purple-600' : hoverDoc.rarity === 'Uncommon' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    {hoverDoc.rarity}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium italic opacity-90 mb-6 border-l-2 border-blue-500 pl-4">{hoverDoc.description}</p>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">赋能类型</span>
                     <span className="text-xs font-bold text-gray-400 uppercase">{hoverDoc.effectType}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">强度</span>
                     <span className="text-2xl font-black text-blue-200">+{hoverDoc.value}</span>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Central Work Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#fafbfc] overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center select-none">
               <span className="text-[50vw] font-black rotate-[-12deg]">牛</span>
            </div>

            {selectedWaits && (
              <div className="absolute top-10 flex flex-col items-center animate-in slide-in-from-top duration-400 z-50 max-w-lg">
                <div className="flex gap-6 items-start">
                   {/* Avatar for the tip */}
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-black shrink-0 text-xl">
                      {randomColleague[0]}
                   </div>
                   <div className="flex flex-col gap-2 items-start">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{randomColleague} (好心同事)</span>
                      <div className="bg-white px-6 py-5 rounded-[32px] rounded-tl-none shadow-2xl border border-blue-100/50 flex flex-col gap-4 relative overflow-visible">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        <p className="text-[14px] font-bold text-gray-700 italic leading-snug">哥们，打掉选中的模块，再对齐下面这些颗粒度就能上线了！</p>
                        <div className="flex gap-4 p-4 bg-emerald-50/40 rounded-[24px] border border-emerald-100/50 overflow-visible justify-center">
                           {selectedWaits.map((wait, idx) => (
                             <div key={idx} className="scale-[0.5] origin-center -mx-5 -my-8">
                                <Tile2D tile={wait} selected={false} onClick={()=>{}} isWait={true} />
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {pendingOptions && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-600/10 backdrop-blur-md">
                <div className="bg-white p-16 rounded-[70px] shadow-2xl border border-gray-200 flex flex-col items-center gap-12 max-w-3xl w-full animate-in zoom-in duration-500 border-t-8 border-t-blue-500">
                  <h4 className="text-5xl font-black text-[#3370ff] tracking-tighter italic animate-pulse drop-shadow-sm">对齐哪份颗粒度？</h4>
                  <div className="flex gap-12">
                    {pendingOptions.map(t => (
                      <div key={t.id} onClick={() => confirmIteration(t)} className="hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-2xl group relative">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all -m-2" />
                        <Tile2D tile={t} selected={false} onClick={()=>{}} />
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 font-bold italic">选择一个模块进行重构迭代</p>
                </div>
              </div>
            )}

            {canHu && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 pointer-events-none">
                <div className="text-[180px] font-black text-[#3370ff] drop-shadow-2xl italic leading-none glitch-text">胡!!</div>
                <div className="mt-8 bg-gray-900 text-white px-12 py-4 text-2xl font-black rounded-full shadow-2xl tracking-[1em] animate-pulse border-2 border-blue-500">核心闭环交付</div>
              </div>
            )}
            
            {!canHu && score >= targetScore && (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <div className="text-5xl font-black text-green-500 italic tracking-tighter animate-bounce drop-shadow-sm">KPI 已达成</div>
                <p className="text-gray-500 text-lg font-bold mt-4 italic">您可以继续追求更高绩效，或选择“常规上线”进入结算。</p>
              </div>
            )}
        </div>

        {/* Bottom Interaction Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-30">
           <div className="max-w-full mx-auto space-y-10">
              <div className="flex justify-between items-center border-b border-gray-100 pb-5 px-6">
                 <div className="flex gap-16 text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                    <span className="flex items-center gap-2">重构机会: <span className={`text-lg ml-2 font-black ${turnsLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>{turnsLeft} / 20</span></span>
                    <span className="flex items-center gap-2">剩余需求: <span className="text-gray-900 text-lg ml-2 font-black">{deck.length}</span></span>
                 </div>
                 <button onClick={sortHand} className="px-6 py-2.5 bg-gray-50 rounded-2xl text-gray-500 text-[11px] font-black border border-gray-200 hover:bg-gray-100 hover:text-[#3370ff] transition-all active:translate-y-1 italic">自动理牌</button>
              </div>

              {/* Hand Area - Fixed clipping with padding-top and removed overflow-hidden */}
              <div className="min-h-[300px] bg-gray-50/50 rounded-[50px] border border-gray-100 relative">
                 <div className="flex items-center gap-2 flex-nowrap justify-center overflow-x-auto no-scrollbar w-full pt-16 pb-8 px-10">
                    {hand.map((tile, idx) => {
                      const isDiscardWaiting = !!tenpaiMap[tile.id];
                      const isPotentialMeld = selectedIndices.length > 0 && selectedIndices.length < 3 && !selectedIndices.includes(idx) && (
                        hand[idx].suit === hand[selectedIndices[0]].suit && (
                           Math.abs(hand[idx].value - hand[selectedIndices[0]].value) <= 2 || 
                           hand[idx].value === hand[selectedIndices[0]].value
                        )
                      );

                      return (
                        <div key={tile.id} className="shrink-0 transition-all duration-300">
                          <Tile2D 
                            tile={tile} selected={selectedIndices.includes(idx)} 
                            onClick={() => selectTile(idx)} isHu={canHu}
                            isWait={isDiscardWaiting}
                            isPotential={isPotentialMeld}
                          />
                        </div>
                      );
                    })}
                 </div>
              </div>

              <div className="flex gap-8 h-20 px-6">
                 <button 
                   onClick={requestIteration} disabled={selectedIndices.length !== 1 || turnsLeft <= 0}
                   className="flex-1 bg-white border-2 border-[#3370ff] text-[#3370ff] rounded-[30px] font-black text-lg hover:bg-blue-50 transition-all disabled:opacity-20 active:scale-95 shadow-sm italic"
                 >
                   颗粒度重构 (迭代)
                 </button>
                 <button 
                   onClick={executeDemoMeld} disabled={selectedIndices.length < 3}
                   className="flex-1 bg-emerald-500 text-white rounded-[30px] font-black text-lg hover:bg-emerald-600 transition-all disabled:opacity-20 active:scale-95 shadow-xl shadow-emerald-200 italic"
                 >
                   报送 DEMO (阶段交付)
                 </button>
                 <button 
                   onClick={submitHand}
                   className={`flex-[1.8] rounded-[30px] font-black text-3xl text-white transition-all active:scale-[0.97] shadow-2xl italic ${canHu ? 'bg-[#3370ff] animate-extreme-hu' : (score >= targetScore ? 'bg-green-600 shadow-green-400' : 'bg-gray-900')}`}
                 >
                   {canHu ? '闭环交付 (HU!)' : (score >= targetScore ? '常规上线 (PASS)' : '交付上线')}
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Right Sidebar: Feishu Sync / Statistics */}
      <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col shrink-0 z-20 relative shadow-2xl">
        <div className="flex border-b bg-gray-50 shrink-0 shadow-sm">
           <button 
             onClick={() => setActiveTab('CHAT')}
             className={`flex-1 py-4 flex flex-col items-center justify-center transition-all border-b-2 ${activeTab === 'CHAT' ? 'border-[#3370ff] bg-white' : 'border-transparent grayscale opacity-50'}`}
           >
              <span className="text-[10px] font-black text-[#3370ff] uppercase tracking-widest italic">飞书实时同步</span>
              <span className="text-[9px] font-bold text-gray-400">消息对齐</span>
           </button>
           <button 
             onClick={() => setActiveTab('STATS')}
             className={`flex-1 py-4 flex flex-col items-center justify-center transition-all border-b-2 ${activeTab === 'STATS' ? 'border-orange-500 bg-white' : 'border-transparent grayscale opacity-50'}`}
           >
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">手牌效能分析</span>
              <span className="text-[9px] font-bold text-gray-400">数据建模</span>
           </button>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-8 space-y-2 no-scrollbar bg-[#fcfdfe] scroll-smooth">
           {activeTab === 'CHAT' ? (
             workplaceMessages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
           ) : (
             <HandStatistics />
           )}
        </div>

        {/* Bottom Stats */}
        <div className="p-10 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
           <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[11px] font-black text-gray-400 mb-1.5 uppercase tracking-widest italic">可用预算 (Budget)</p>
                <p className="text-5xl font-black text-[#3370ff] tracking-tighter italic drop-shadow-sm">¥{money}</p>
              </div>
              <div 
                onClick={() => setActiveTab(activeTab === 'CHAT' ? 'STATS' : 'CHAT')}
                className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center text-2xl border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer"
              >
                {activeTab === 'CHAT' ? '📊' : '💬'}
              </div>
           </div>
           <div className="flex gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-700 shadow-sm ${i < ownedDocs.length ? 'bg-[#3370ff] shadow-blue-500/30' : 'bg-gray-100'}`} />
              ))}
           </div>
        </div>
      </div>

      {/* Shop Overlay */}
      {state === 'SHOP' && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-gray-900/70 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="w-full max-w-[1100px] bg-[#f0f2f5] rounded-[70px] shadow-2xl flex flex-col overflow-hidden max-h-[85vh] border-8 border-white/50 relative">
              <div className="h-[120px] bg-white border-b flex items-center justify-between px-20 shrink-0 shadow-sm">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-yellow-400 rounded-[24px] flex items-center justify-center text-4xl shadow-xl animate-bounce shadow-yellow-500/20">☕</div>
                    <div>
                      <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">茶水间 · 资源赋能</h2>
                      <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest mt-1 italic">Strategic Resource Procurement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-16">
                    <div className="text-right">
                        <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">当前预算</p>
                        <p className="text-5xl font-black text-yellow-600 italic tracking-tighter drop-shadow-sm">¥{money}</p>
                    </div>
                    <button onClick={nextRound} className="h-20 px-20 bg-[#3370ff] text-white rounded-[32px] font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-blue-500/20 italic">对齐下季目标</button>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-16 no-scrollbar bg-gray-50/50">
                  <div className="grid grid-cols-3 gap-16">
                    {shopDocs.map(doc => (
                      <div key={doc.id} className="bg-white rounded-[50px] border border-gray-100 shadow-xl p-14 flex flex-col justify-between hover:-translate-y-5 transition-all group hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                          <div className="text-center mb-12 relative z-10">
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 inline-block shadow-sm ${doc.rarity === 'Rare' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                              {doc.rarity}
                            </span>
                            <h4 className="text-4xl font-black text-gray-900 mb-8 tracking-tight leading-none group-hover:text-[#3370ff] transition-colors italic">{doc.name}</h4>
                            <p className="text-gray-400 text-base font-medium leading-relaxed italic opacity-90 border-t border-gray-100 pt-6">{doc.description}</p>
                          </div>
                          <button 
                            onClick={() => buyDoc(doc)} disabled={money < doc.price || ownedDocs.length >= 5} 
                            className={`w-full py-7 rounded-[32px] font-black text-2xl shadow-xl transition-all relative z-10 ${money >= doc.price && ownedDocs.length < 5 ? 'bg-gray-900 text-white hover:bg-[#3370ff] shadow-gray-900/20 hover:shadow-blue-500/30' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                          >
                            ¥{doc.price} 采购赋能
                          </button>
                      </div>
                    ))}
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* GameOver Overlay */}
      {state === 'GAMEOVER' && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-red-600/20 backdrop-blur-2xl animate-in zoom-in duration-600">
           <div className="bg-white w-full max-w-[650px] rounded-[80px] shadow-2xl flex flex-col overflow-hidden p-24 text-center border-4 border-red-500 relative">
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
              <h2 className="text-7xl font-black mb-10 text-red-500 tracking-tighter italic glitch-text uppercase">优 离 礼 包</h2>
              <p className="text-gray-500 mb-14 font-bold text-2xl leading-relaxed italic">由于您未能对齐核心颗粒度，<br/>HRBP 已为您申请“优化”礼包。<br/>感谢您对公司业务的付出。</p>
              <div className="p-12 bg-red-50 rounded-[55px] mb-14 border border-red-100 shadow-inner">
                 <p className="text-[14px] font-black text-red-400 uppercase tracking-widest mb-5 italic">职场生涯回顾</p>
                 <div className="flex justify-around">
                   <div className="text-center">
                      <p className="text-3xl font-black text-gray-900 tracking-tighter italic">{currentYear}Y {currentStage}Q</p>
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-2">坚持时长</p>
                   </div>
                   <div className="text-center">
                      <p className="text-3xl font-black text-gray-900 tracking-tighter italic">{score.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-2">最高对齐价值</p>
                   </div>
                 </div>
              </div>
              <button onClick={resetGame} className="w-full h-24 bg-gray-900 text-white rounded-[35px] font-black text-3xl hover:bg-black transition-all active:scale-95 shadow-2xl shadow-gray-900/30 italic">寻找新的抓手</button>
           </div>
        </div>
      )}
    </div>
  );
};
