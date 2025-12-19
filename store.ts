
import { create } from 'zustand';
import { Tile, GameState, Suit, WorkplaceMessage, PigeonDoc, Meld } from './types';
import { PIGEON_DOCS_POOL, getKPITarget, SUITS, HONORS_LABELS, NEWBIE_PROTECTION_DOC, BACK_LOW_STAR_DOC } from './config';

const ONBOARDING_MESSAGES: WorkplaceMessage[] = [
  { id: 'ob1', sender: '产品-小王', role: 'BOSS', content: '哈喽，新来的同学！我是 PM 小王，欢迎加入对齐小组。', time: '10:00', type: 'chat' },
  { id: 'ob2', sender: '产品-小王', role: 'BOSS', content: '咱们本季度的核心目标是把这堆“乱如麻”的业务模块全部对齐。', time: '10:01', type: 'chat' },
  { id: 'ob3', sender: 'HRBP-张姐', role: 'BOSS', content: '@所有人 记得及时同步进度。KPI 达成率直接影响大家的年终文档。', time: '10:05', type: 'chat' },
  { id: 'ob4', sender: '技术总监-老李', role: 'BOSS', content: '大家一定要找到业务抓手。如果颗粒度对齐不了，年底可能要面临优化。', time: '10:10', type: 'chat' },
  { id: 'ob5', sender: '张总 (CEO)', role: 'BOSS', content: '不要只会低头写代码，要抬头看路。我们要以闭环交付为终极导向。', time: '10:12', type: 'chat' },
    { id: 'ob6', sender: '张总 (CEO)', role: 'BOSS', content: '先去完成第一轮迭代证明你的价值，拿到预算后再去采购"飞鸽文档"赋能！', time: '10:13', type: 'chat' },
  { id: 'ob7', sender: '系统通知', role: 'SYSTEM', content: '⚠️ 待处理业务需求已加载。请通过“报送 DEMO”或“常规上线”达成 KPI。', time: '10:15', type: 'system' },
];

const WORK_RANDOM_MESSAGES: { sender: string, content: string, role: 'BOSS' | 'USER' | 'SYSTEM' }[] = [
  { sender: "HRBP-张姐", content: "记得填周报，别忘了。", role: 'BOSS' },
  { sender: "技术总监-老李", content: "那个Bug修复了吗？线上等着呢。", role: 'BOSS' },
  { sender: "产品-小王", content: "下午3点的会记得参加，讨论颗粒度。", role: 'BOSS' },
  { sender: "老板", content: "大家努力干，年底给大家发奖金！", role: 'BOSS' },
  { sender: "同事-小陈", content: "今天的咖啡不错，要不要来一杯？", role: 'BOSS' },
  { sender: "产品-小王", content: "这个需求改一下，很简单，就加个按钮。", role: 'BOSS' },
  { sender: "技术总监-老李", content: "颗粒度没对齐啊，再改改。", role: 'BOSS' },
  { sender: "技术总监-老李", content: "底层逻辑还没跑通，需要重构。", role: 'BOSS' },
  { sender: "产品-小王", content: "文档权限开一下，我看看细节。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "这个链路没闭环，逻辑上有漏洞。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "我们要打一套组合拳，把这个点打透。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "现在的痛点是缺乏一个强有力的抓手。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "这个方案的延展性不够，得再打磨。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "我们在下半场要找到新的增长极。", role: 'BOSS' },
  { sender: "同事-小陈", content: "今天食堂的饭菜有点咸，差评。", role: 'BOSS' },
  { sender: "同事-小陈", content: "谁有点位？借我用一下。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "这个项目我们要高举高打，快速占领心智。", role: 'BOSS' },
  { sender: "HRBP-张姐", content: "大家的协同效率还有提升空间。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "我们要深度赋能业务，实现价值最大化。", role: 'BOSS' },
  { sender: "产品-小王", content: "这个需求的优先级是 P0，今晚必须上线。", role: 'BOSS' },
  { sender: "技术总监-老李", content: "线上环境崩了，全员集合排查！", role: 'BOSS' },
  { sender: "同事-小陈", content: "刚才那个会我没听懂，谁能给我复述一下？", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "我们要建立一个可持续发展的生态系统。", role: 'BOSS' },
  { sender: "产品-小王", content: "这个功能怎么还没跑通？研发在干嘛？", role: 'BOSS' },
  { sender: "产品-小王", content: "产品文档更新了，大家记得看。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "老板说明天要看这个项目的 Demo。", role: 'BOSS' },
  { sender: "HRBP-张姐", content: "周五晚上的团建，大家一定要参加哦。", role: 'BOSS' },
  { sender: "技术总监-老李", content: "这个 Bug 我怎么复现不出来？奇怪。", role: 'BOSS' },
  { sender: "张总 (CEO)", content: "我们要以结果为导向，拒绝无效加班。", role: 'BOSS' },
  { sender: "同事-小陈", content: "今天天气不错，好想下班去逛逛。", role: 'USER' }
];

interface GameStore {
  state: GameState;
  money: number;
  currentYear: number;
  currentStage: number;
  targetScore: number;
  hand: Tile[];
  melds: Meld[];
  deck: Tile[];
  selectedIndices: number[];
  score: number;
  turnsLeft: number;
  discardsThisRound: number; 
  cardsPlayedThisRound: number; 
  turnsPlayedThisRound: number; 
  workplaceMessages: WorkplaceMessage[];
  onboardingMessages: WorkplaceMessage[];
  doras: { suit: Suit; value: number }[];
  tenpaiMap: Record<string, Tile[]>; 
  canHu: boolean;
  lastDrawnId: string | null;
  ownedDocs: PigeonDoc[];
  shopDocs: PigeonDoc[];
  purchasedDocIds: string[]; // 已购买的文档ID列表（全局，整个游戏只能买一次）
  pendingOptions: Tile[] | null;
  tutorialStep: number; // 0 means no tutorial or finished
  setTutorialStep: (step: number) => void;
  
  startOnboarding: () => void;
  initGame: () => void;
  selectTile: (index: number) => void;
  requestIteration: () => void;
  confirmIteration: (chosenTile: Tile) => void;
  executeDemoMeld: () => void;
  submitHand: () => void;
  nextRound: () => void;
  checkStatus: () => void;
  sortHand: () => void;
  resetGame: () => void;
  buyDoc: (doc: PigeonDoc) => void;
  sellDoc: (doc: PigeonDoc) => void;
}

// --- Audio Helper ---
export const playSound = (type: 'message' | 'demo' | 'iteration' | 'hu') => {
  const sounds = {
    message: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    demo: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    iteration: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    hu: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Ignore autoplay blocks
};

// --- Mahjong Logic Helpers ---

const checkMahjongWin = (allTiles: Tile[]): boolean => {
  if (allTiles.length === 0) return false;
  const counts: Record<string, number> = {};
  allTiles.forEach(t => {
    const key = `${t.suit}-${t.value}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  // 1. 七对子 (Seven Pairs) - Special case for 14 cards
  if (allTiles.length === 14) {
    const pairs = Object.values(counts).filter(c => c >= 2).length;
    const fourOfAKind = Object.values(counts).filter(c => c === 4).length;
    if (pairs + (fourOfAKind * 2) === 7) return true;
  }

  // 2. Standard 4 Melds + 1 Pair
  const isComplete = (rem: Record<string, number>, hasPair: boolean): boolean => {
    const keys = Object.keys(rem).filter(k => rem[k] > 0).sort((a, b) => {
        const [suitA, valA] = a.split('-');
        const [suitB, valB] = b.split('-');
        if (suitA !== suitB) return suitA === 'HONOR' ? 1 : -1;
        return parseInt(valA) - parseInt(valB);
    });
    if (keys.length === 0) return true;
    const k = keys[0];
    const [suit, valStr] = k.split('-');
    const val = parseInt(valStr);
    
    // Try Pair
    if (!hasPair && rem[k] >= 2) {
      const next = { ...rem, [k]: rem[k] - 2 };
      if (isComplete(next, true)) return true;
    }
    // Try Pung
    if (rem[k] >= 3) {
      const next = { ...rem, [k]: rem[k] - 3 };
      if (isComplete(next, hasPair)) return true;
    }
    // Try Chow
    if (suit !== 'HONOR') {
      const k2 = `${suit}-${val + 1}`;
      const k3 = `${suit}-${val + 2}`;
      if (rem[k] > 0 && rem[k2] > 0 && rem[k3] > 0) {
        const next = { ...rem, [k]: rem[k] - 1, [k2]: rem[k2] - 1, [k3]: rem[k3] - 1 };
        if (isComplete(next, hasPair)) return true;
      }
    }
    return false;
  };
  return isComplete(counts, false);
};

const getPatternFan = (allTiles: Tile[]): { fan: number, name: string } => {
  if (allTiles.length === 0) return { fan: 1, name: '碎片交付' };
  
  let fan = 0;
  let name = '常规上线';
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:126',message:'getPatternFan start',data:{tilesCount:allTiles.length,fan},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const suits = new Set(allTiles.map(t => t.suit));
  const counts: Record<string, number> = {};
  allTiles.forEach(t => { const k = `${t.suit}-${t.value}`; counts[k] = (counts[k] || 0) + 1; });

  // 1. Flush Checks
  if (suits.size === 1) {
    if (allTiles[0].suit === 'HONOR') { fan += 10; name = '全黑话对齐 (All Honors)'; }
    else { fan += 16; name = '清一色 (Full Flush)'; }
  } else if (suits.size === 2 && suits.has('HONOR')) {
    fan += 6; name = '混一色 (Half Flush)';
  }

  // 2. Simple/Terminal Checks
  const isAllSimple = allTiles.every(t => t.suit !== 'HONOR' && t.value > 1 && t.value < 9);
  const isAllTerminal = allTiles.every(t => t.suit === 'HONOR' || t.value === 1 || t.value === 9);
  
  if (isAllSimple) { fan += 2; name = name === '常规上线' ? '断幺九 (All Simples)' : `${name} + 断幺九`; }
  if (isAllTerminal) { fan += 4; name = name === '常规上线' ? '全带么 (All Terminals)' : `${name} + 全带么`; }

  // 3. Seven Pairs special
  if (allTiles.length === 14) {
    const pairs = Object.values(counts).filter(c => c >= 2).length;
    if (pairs === 7) { fan += 24; name = '七对子 (Seven Pairs)'; }
  }

  const result = { fan: Math.max(1, fan), name };
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:154',message:'getPatternFan return',data:{fan:result.fan,name:result.name,rawFan:fan},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return result;
};

export const calculateFinalScore = (state: { 
  hand: Tile[], 
  melds: Meld[], 
  ownedDocs: PigeonDoc[], 
  discardsThisRound: number, 
  cardsPlayedThisRound: number,
  money: number,
  canHu: boolean,
  turnsLeft: number,
  isEstimate?: boolean
}) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:157',message:'calculateFinalScore entry',data:{meldsCount:state.melds.length,ownedDocsCount:state.ownedDocs.length,ownedDocsIds:state.ownedDocs.map(d=>d.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  let chips = 0; 
  let mult = 0; // 初始倍率为0
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:169',message:'mult initial value',data:{mult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  const allTiles = [...state.hand, ...state.melds.flatMap(m => m.tiles)];
  
  // 1. 基础工作量 (Base Chips)
  allTiles.forEach(t => {
    chips += t.suit === 'HONOR' ? 10 : t.value;
    if (t.isDora) chips += 20;
  });

  // 2. 基础倍率 (Base Mult from Patterns & Melds)
  const pattern = getPatternFan(allTiles);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:179',message:'getPatternFan result',data:{patternFan:pattern.fan,patternName:pattern.name,multBefore:mult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // 常规上线是1倍，其他模式也是对应的倍率值
  mult += pattern.fan;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:181',message:'after pattern.fan addition',data:{mult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // 加算副露的番数 (Pung/Chow +1, Kong +2)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:183',message:'before melds processing',data:{mult,meldsCount:state.melds.length,meldsTypes:state.melds.map(m=>m.type)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  state.melds.forEach(m => {
    if (m.type === 'KONG') mult += 2;
    else if (m.type === 'PUNG' || m.type === 'CHOW') mult += 1;
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:187',message:'after melds processing',data:{mult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // 3. 飞鸽文档赋能 (Doc Effects)
  // 需要排除有动态计算的文档，它们不应该有基础值
  const dynamicMultDocs = ['pd_align', 'pd_shuai_guo', 'pd_manage_up', 'pd_endless_sync', 'pd_top_design'];
  
  state.ownedDocs.forEach(doc => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:193',message:'processing doc',data:{docId:doc.id,docName:doc.name,effectType:doc.effectType,value:doc.value,multBefore:mult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (doc.effectType === 'chips') chips += doc.value;
    // 只有非动态计算的文档才添加基础值
    if (doc.effectType === 'mult' && !dynamicMultDocs.includes(doc.id)) {
      mult += doc.value;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:197',message:'after mult doc addition',data:{docId:doc.id,mult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    
    // Dynamic multipliers（这些文档没有基础值，只有动态计算）
    if (doc.id === 'pd_align') mult += allTiles.filter(t => t.suit === 'MAN').length * doc.value;
    if (doc.id === 'pd_grip') chips += allTiles.filter(t => t.suit === 'PIN').length * doc.value;
    if (doc.id === 'pd_empower') chips += allTiles.filter(t => t.suit === 'HONOR').length * doc.value;
    if (doc.id === 'pd_shuai_guo') mult += state.discardsThisRound * doc.value;
    
    if (doc.id === 'pd_daily_report') {
      // 只计算打出的牌（melds），不包括手牌
      state.melds.flatMap(m => m.tiles).filter(t => t.value % 2 === 0).forEach(() => chips += doc.value);
    }
    // 冰美式续命：本轮第一次出牌时触发（在 executeDemoMeld 或 submitHand 中，cardsPlayedThisRound 还未增加）
    // 注意：这个检查在 calculateFinalScore 中执行，此时 cardsPlayedThisRound 还是当前值
    if (doc.id === 'pd_coffee_iv' && state.cardsPlayedThisRound === 0) {
      chips += doc.value;
    }
    if (doc.id === 'pd_manage_up') {
      allTiles.filter(t => t.suit === 'HONOR').forEach(() => mult += doc.value);
    }
    if (doc.id === 'pd_endless_sync') {
      mult += allTiles.length * doc.value;
    }
    if (doc.id === 'pd_996_blessing') {
      chips += allTiles.length * doc.value;
    }
    if (doc.id === 'pd_top_design') {
      if (allTiles.length >= 16) mult += doc.value;
    }
    
    // 新手保护和背低星：通过 effectType === 'mult' 处理，不需要单独处理（避免重复计算）

    // 乘法倍率 (xMult)
    if (doc.effectType === 'xMult') {
      if (doc.id === 'pd_big_pie') {
        if (!state.isEstimate) {
          if (Math.random() < 0.25) mult *= doc.value;
        }
      } else if (doc.id === 'pd_matrix') {
        const suits = new Set(allTiles.map(t => t.suit));
        if (suits.size >= 3) mult *= doc.value;
      } else if (doc.id === 'pd_ppt_master') {
        if (allTiles.every(t => t.suit === 'PIN')) mult *= doc.value;
      } else if (doc.id === 'pd_optimization') {
        if (allTiles.length === 1) mult *= doc.value;
      } else if (doc.id === 'pd_hotfix_deploy') {
        if (state.turnsLeft === 1) mult *= doc.value;
      } else if (doc.id === 'pd_golden_handcuffs') {
        mult *= (1 + (Math.floor(state.money / 10) * 0.2));
      } else if (doc.id === 'pd_unicorn') {
        if (chips > 500) mult *= doc.value;
      } else if (doc.id === 'pd_logic') {
        // 底层逻辑改为加法倍率，不再使用乘法
        // mult *= doc.value; // 已移除，改为在mult类型中处理
      }
    }
    
    if (doc.id === 'pd_deep_dive') {
       const suits = new Set(allTiles.map(t => t.suit));
       if (suits.size === 1 && allTiles.length >= 5) chips += doc.value;
    }
  });

  // 4. 核心交付奖励 (Hu / Closed Loop)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:264',message:'final mult before return',data:{mult,chips,canHu:state.canHu},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  let total = Math.floor(chips * mult);
  if (state.canHu) {
    total *= 2;
    const closedLoop = state.ownedDocs.find(d => d.id === 'pd_closed_loop');
    if (closedLoop) total *= closedLoop.value;
  }
  
  return { chips, mult, total, patternName: pattern.name };
};

// 分析倍率来源，用于UI展示
export const analyzeMultSources = (state: {
  hand: Tile[],
  melds: Meld[],
  ownedDocs: PigeonDoc[],
  discardsThisRound: number,
  cardsPlayedThisRound: number,
  money: number,
  canHu: boolean,
  turnsLeft: number,
  isEstimate?: boolean
}) => {
  const sources: Array<{ name: string; value: number; type: 'base' | 'add' | 'multiply'; color?: string }> = [];
  const allTiles = [...state.hand, ...state.melds.flatMap(m => m.tiles)];
  
  // 1. 基础番型
  const pattern = getPatternFan(allTiles);
  if (pattern.fan > 0) {
    sources.push({ name: pattern.name, value: pattern.fan, type: 'base', color: '#3370ff' });
  }
  
  // 2. 副露加成
  state.melds.forEach(m => {
    if (m.type === 'KONG') {
      sources.push({ name: '杠 (+2)', value: 2, type: 'add', color: '#10b981' });
    } else if (m.type === 'PUNG') {
      sources.push({ name: '刻 (+1)', value: 1, type: 'add', color: '#10b981' });
    } else if (m.type === 'CHOW') {
      sources.push({ name: '顺 (+1)', value: 1, type: 'add', color: '#10b981' });
    }
  });
  
  // 3. 文档加算效果
  // 需要排除有动态计算的文档，它们不应该显示基础值
  const dynamicMultDocs = ['pd_align', 'pd_shuai_guo', 'pd_manage_up', 'pd_endless_sync', 'pd_top_design'];
  
  state.ownedDocs.forEach(doc => {
    // 新手保护和背低星：特殊处理
    if (doc.id === 'pd_newbie_protection') {
      sources.push({ name: '新手保护', value: doc.value, type: 'add', color: '#f59e0b' });
    } else if (doc.id === 'pd_back_low_star') {
      sources.push({ name: '背低星', value: doc.value, type: 'add', color: '#ef4444' });
    }
    // 只有非动态计算的文档才显示基础值
    else if (doc.effectType === 'mult' && !dynamicMultDocs.includes(doc.id)) {
      sources.push({ name: doc.name, value: doc.value, type: 'add', color: '#8b5cf6' });
    }
    
    // 动态加算（这些文档没有基础值，只有动态计算）
    if (doc.id === 'pd_align') {
      const count = allTiles.filter(t => t.suit === 'MAN').length;
      if (count > 0) {
        sources.push({ name: `${doc.name} (${count}张)`, value: count * doc.value, type: 'add', color: '#8b5cf6' });
      }
    }
    if (doc.id === 'pd_shuai_guo' && state.discardsThisRound > 0) {
      sources.push({ name: `${doc.name} (${state.discardsThisRound}次)`, value: state.discardsThisRound * doc.value, type: 'add', color: '#8b5cf6' });
    }
    if (doc.id === 'pd_manage_up') {
      const count = allTiles.filter(t => t.suit === 'HONOR').length;
      if (count > 0) {
        sources.push({ name: `${doc.name} (${count}张)`, value: count * doc.value, type: 'add', color: '#8b5cf6' });
      }
    }
    if (doc.id === 'pd_endless_sync' && allTiles.length > 0) {
      sources.push({ name: `${doc.name} (${allTiles.length}张)`, value: allTiles.length * doc.value, type: 'add', color: '#8b5cf6' });
    }
    if (doc.id === 'pd_top_design' && allTiles.length >= 16) {
      sources.push({ name: doc.name, value: doc.value, type: 'add', color: '#8b5cf6' });
    }
    
    // 乘法倍率
    if (doc.effectType === 'xMult') {
      let shouldAdd = false;
      let multValue = 1;
      let displayName = doc.name;
      
      if (doc.id === 'pd_big_pie') {
        // 预估时也显示，标注为概率触发
        displayName = `${doc.name} (25%概率)`;
        multValue = doc.value;
        shouldAdd = true;
      } else if (doc.id === 'pd_matrix') {
        const suits = new Set(allTiles.map(t => t.suit));
        if (suits.size >= 3) {
          shouldAdd = true;
          multValue = doc.value;
        }
      } else if (doc.id === 'pd_ppt_master') {
        if (allTiles.every(t => t.suit === 'PIN')) {
          shouldAdd = true;
          multValue = doc.value;
        }
      } else if (doc.id === 'pd_optimization') {
        if (allTiles.length === 1) {
          shouldAdd = true;
          multValue = doc.value;
        }
      } else if (doc.id === 'pd_hotfix_deploy') {
        if (state.turnsLeft === 1) {
          shouldAdd = true;
          multValue = doc.value;
        }
      } else if (doc.id === 'pd_golden_handcuffs') {
        const bonus = Math.floor(state.money / 10) * 0.2;
        if (bonus > 0) {
          shouldAdd = true;
          multValue = 1 + bonus;
          displayName = `${doc.name} (${Math.floor(state.money / 10)}×$10)`;
        }
      } else if (doc.id === 'pd_unicorn') {
        // 需要先计算chips来判断
        let chips = 0;
        allTiles.forEach(t => {
          chips += t.suit === 'HONOR' ? 10 : t.value;
          if (t.isDora) chips += 20;
        });
        // 加上文档的基础工作量加成
        state.ownedDocs.forEach(d => {
          if (d.effectType === 'chips') chips += d.value;
          if (d.id === 'pd_grip') chips += allTiles.filter(t => t.suit === 'PIN').length * d.value;
          if (d.id === 'pd_empower') chips += allTiles.filter(t => t.suit === 'HONOR').length * d.value;
          if (d.id === 'pd_996_blessing') chips += allTiles.length * d.value;
        });
        if (chips > 500) {
          shouldAdd = true;
          multValue = doc.value;
          displayName = `${doc.name} (工作量>500)`;
        }
      }
      
      if (shouldAdd) {
        sources.push({ name: displayName, value: multValue, type: 'multiply', color: '#f59e0b' });
      }
    }
  });
  
  // #region agent log
  let calculatedMult = 0;
  let multiplyFactor = 1;
  sources.forEach(s => {
    if (s.type === 'base' || s.type === 'add') {
      calculatedMult += s.value;
    } else if (s.type === 'multiply') {
      multiplyFactor *= s.value;
    }
  });
  calculatedMult = calculatedMult * multiplyFactor;
  fetch('http://127.0.0.1:7242/ingest/20245aa5-ec9d-4de1-957e-0da62790d108',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:452',message:'analyzeMultSources return',data:{sourcesCount:sources.length,calculatedMult,multiplyFactor,sources:sources.map(s=>({name:s.name,value:s.value,type:s.type}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  return sources;
};

const TUTORIAL_MESSAGES: WorkplaceMessage[] = [
  { id: 't1', sender: '产品-小王', role: 'BOSS', content: '【任务】凑齐 4 组顺子/刻子 + 1 对将牌，点击“闭环交付”达成 KPI！', time: '09:01', type: 'chat' },
  { id: 't2', sender: '系统通知', role: 'SYSTEM', content: '💡 提示：点击牌后点“重构”换牌，选中 3 张牌点“报送 DEMO”固定。', time: '09:02', type: 'system' },
];

export const useGameStore = create<GameStore>((set, get) => ({
  state: 'MENU',
  money: 4,
  currentYear: 1,
  currentStage: 1,
  targetScore: 200,
  hand: [],
  melds: [],
  deck: [],
  selectedIndices: [],
  score: 0,
  turnsLeft: 20,
  discardsThisRound: 0,
  cardsPlayedThisRound: 0,
  turnsPlayedThisRound: 0,
  workplaceMessages: [],
  onboardingMessages: ONBOARDING_MESSAGES,
  doras: [],
  tenpaiMap: {},
  canHu: false,
  lastDrawnId: null,
  ownedDocs: [],
  shopDocs: [],
  purchasedDocIds: [],
  pendingOptions: null,
  tutorialStep: 0,
  setTutorialStep: (step: number) => set({ tutorialStep: step }),

  startOnboarding: () => set({ state: 'ONBOARDING' }),

  initGame: () => {
    const { ownedDocs, currentYear, currentStage } = get();
    
    // 新手保护机制：第一年自动赠送新手保护文档
    let newOwnedDocs = [...ownedDocs];
    let newWorkplaceMessages: WorkplaceMessage[] = [];
    
    const target = getKPITarget(currentYear, currentStage);
    
    // 如果是第一年第一季，加入详细教程
    let tutorialStep = 0;
    if (currentYear === 1 && currentStage === 1) {
      newWorkplaceMessages.push(...TUTORIAL_MESSAGES);
      tutorialStep = 1; // 开始新手教程第一步
    }
    
    if (currentYear === 1 && currentStage === 1 && !ownedDocs.find(d => d.id === 'pd_newbie_protection') && !ownedDocs.find(d => d.id === 'pd_back_low_star')) {
      newOwnedDocs = [...newOwnedDocs, NEWBIE_PROTECTION_DOC];
      // 添加系统消息提示获得新手保护
      newWorkplaceMessages.push({
        id: `newbie_protection_${Date.now()}`,
        sender: '系统通知',
        role: 'SYSTEM',
        content: '🎁 恭喜！你获得了"新手保护"文档，绩效倍率 +2。在第二年到来前可以卖出，否则将自动变为"背低星"。',
        time: '09:00',
        type: 'system'
      });
    }
    
    // 添加默认的开始对齐消息
    newWorkplaceMessages.push({
      id: 'm0',
      sender: '系统通知',
      role: 'SYSTEM',
      content: `[通知] 开始对齐。目标 KPI: ${target}`,
      time: '09:00',
      type: 'system'
    });

    if (newWorkplaceMessages.length > 0) playSound('message');
    
    const finalOwnedDocs = newOwnedDocs;
    const deck: Tile[] = [];
    SUITS.forEach(suit => {
      for (let v = 1; v <= 9; v++) {
        for (let i = 0; i < 4; i++) deck.push({ id: `${suit}-${v}-${i}`, suit, value: v, label: `${v}` });
      }
    });
    HONORS_LABELS.forEach((h, idx) => {
      for (let i = 0; i < 4; i++) deck.push({ id: `HONOR-${idx}-${i}`, suit: 'HONOR', value: idx + 1, label: h });
    });
    const shuffled = deck.sort(() => Math.random() - 0.5);
    const doras = SUITS.map(s => ({ suit: s, value: Math.floor(Math.random() * 9) + 1 }));

    let handSize = 14;
    if (finalOwnedDocs.find(d => d.id === 'pd_crisis')) handSize -= 2;
    if (finalOwnedDocs.find(d => d.id === 'pd_endless_sync')) handSize -= 1;
    if (finalOwnedDocs.find(d => d.id === 'pd_top_design')) handSize += 2;

    const initialHand = shuffled.slice(0, handSize).map(t => ({
      ...t,
      isDora: doras.some(d => d.suit === t.suit && d.value === t.value)
    }));

    let initialTurns = 20;
    if (finalOwnedDocs.find(d => d.id === 'pd_agile_sprint')) initialTurns += 1;

    set({
      state: 'PLAYING',
      targetScore: target,
      deck: shuffled.slice(handSize),
      hand: initialHand,
      melds: [],
      selectedIndices: [],
      turnsLeft: initialTurns,
      discardsThisRound: 0,
      cardsPlayedThisRound: 0,
      turnsPlayedThisRound: 0,
      doras,
      score: 0,
      canHu: checkMahjongWin(initialHand),
      lastDrawnId: initialHand.length > 0 ? initialHand[initialHand.length - 1].id : null,
      ownedDocs: finalOwnedDocs, // 更新文档列表（可能包含新手保护）
      workplaceMessages: newWorkplaceMessages,
      tutorialStep: tutorialStep,
    });
    get().checkStatus();
  },

  selectTile: (index) => set(s => ({
    selectedIndices: s.selectedIndices.includes(index) 
      ? s.selectedIndices.filter(i => i !== index) 
      : [...s.selectedIndices, index]
  })),

  requestIteration: () => {
    const { selectedIndices, turnsLeft, deck, doras } = get();
    if (selectedIndices.length !== 1 || turnsLeft <= 0 || deck.length === 0) return;
    playSound('iteration');
    const newDeck = [...deck];
    const options = newDeck.splice(0, 2).map(t => ({
      ...t,
      isDora: doras.some(d => d.suit === t.suit && d.value === t.value)
    }));
    set({ deck: newDeck, pendingOptions: options });
  },

  confirmIteration: (chosenTile: Tile) => {
    const { hand, selectedIndices, turnsLeft, workplaceMessages, discardsThisRound, turnsPlayedThisRound } = get();
    if (selectedIndices.length !== 1 || selectedIndices[0] >= hand.length) return;
    const newHand = [...hand];
    newHand[selectedIndices[0]] = chosenTile;
    
    set({ 
      hand: newHand, 
      selectedIndices: [], 
      pendingOptions: null, 
      turnsLeft: turnsLeft - 1, 
      discardsThisRound: discardsThisRound + 1,
      turnsPlayedThisRound: turnsPlayedThisRound + 1,
      lastDrawnId: chosenTile.id,
      workplaceMessages: Math.random() > 0.8 ? (() => {
        playSound('message');
        const randomMsg = WORK_RANDOM_MESSAGES[Math.floor(Math.random() * WORK_RANDOM_MESSAGES.length)];
        return [...workplaceMessages, {
          id: Math.random().toString(),
          sender: randomMsg.sender,
          role: randomMsg.role as 'BOSS',
          content: randomMsg.content,
          time: 'Now',
          type: 'chat'
        }];
      })() : workplaceMessages
    });
    get().checkStatus();
  },

  executeDemoMeld: () => {
    const { hand, selectedIndices, melds, money, score, workplaceMessages, targetScore, currentStage, ownedDocs, turnsPlayedThisRound, cardsPlayedThisRound, discardsThisRound, turnsLeft, doras } = get();
    if (selectedIndices.length < 3 || selectedIndices.some(i => i >= hand.length)) return;
    const selectedTiles = selectedIndices.map(i => hand[i]);
    
    // Pattern Check for the Meld
    const isSame = selectedTiles.every(t => t.suit === selectedTiles[0].suit && t.value === selectedTiles[0].value);
    let type: Meld['type'] | null = null;
    if (isSame && selectedTiles.length === 3) type = 'PUNG';
    if (isSame && selectedTiles.length === 4) type = 'KONG';
    if (!type) {
      const sorted = [...selectedTiles].sort((a,b) => a.value - b.value);
      const isSeq = selectedTiles.length === 3 && 
                   selectedTiles.every(t => t.suit !== 'HONOR' && t.suit === selectedTiles[0].suit) &&
                   sorted[1].value === sorted[0].value + 1 && sorted[2].value === sorted[1].value + 1;
      if (isSeq) type = 'CHOW';
    }
    if (!type) return;

    playSound('demo');
    // Use Formula for Meld Score
    const tempMeld: Meld = { id: 'temp', type, tiles: selectedTiles };
    const { chips, mult, total: bonusScore } = calculateFinalScore({
      hand: [], // Scoring only the meld part
      melds: [tempMeld],
      ownedDocs,
      discardsThisRound,
      cardsPlayedThisRound,
      money,
      canHu: false,
      turnsLeft
    });

    // Special logic for Kong doc
    if (type === 'KONG' && ownedDocs.find(d => d.id === 'pd_resource_exchange')) {
      set(s => ({ money: s.money + 5 }));
    }

    const bonusMoney = type === 'KONG' ? 6 : type === 'PUNG' ? 2 : 1;
    const newMeld: Meld = { id: Math.random().toString(), type, tiles: selectedTiles };
    let newHand = hand.filter((_, i) => !selectedIndices.includes(i));
    
    // Draw 1 replacement if it's a Kong (Mahjong rule)
    if (type === 'KONG' && get().deck.length > 0) {
      const newDeck = [...get().deck];
      const drawn = newDeck.shift()!;
      newHand.push({ ...drawn, isDora: doras.some(d => d.suit === drawn.suit && d.value === drawn.value) });
      set({ deck: newDeck });
    }

    const newScore = score + bonusScore;
    const isSuccess = newScore >= targetScore;
    
    // 福报扣费：每交付一张牌扣 $1
    let blessingCost = 0;
    if (ownedDocs.find(d => d.id === 'pd_996_blessing')) {
      blessingCost = selectedTiles.length;
    }
    
    let pipBonus = 0;
    if (isSuccess && ownedDocs.find(d => d.id === 'pd_pip_agreement')) {
      // 检查重构次数（discardsThisRound），而不是回合数
      if (discardsThisRound <= 3) pipBonus = 25;
      else set({ money: 0 }); 
    }

    const stageBonus = currentStage === 4 ? 6 : 4;

    set(s => ({
      hand: newHand, melds: [...melds, newMeld], selectedIndices: [],
      score: newScore, 
      money: Math.max(0, s.money + bonusMoney - blessingCost + (isSuccess ? stageBonus + pipBonus : 0)),
      cardsPlayedThisRound: cardsPlayedThisRound + 1,
      state: isSuccess ? 'SHOP' : s.state,
      shopDocs: isSuccess ? [...PIGEON_DOCS_POOL]
        .filter(d => !s.purchasedDocIds.includes(d.id)) // 排除已购买的文档
        .sort(() => Math.random() - 0.5)
        .slice(0, 3) : s.shopDocs,
      workplaceMessages: [...workplaceMessages, {
        id: Math.random().toString(), sender: '我', role: 'USER', content: `【交付成功】报送 [${type}] 模块 ${isSuccess ? `\n(KPI已对齐，获得奖金 ￥${stageBonus})` : ''}`,
        time: 'Now', type: 'meld',
        details: { chips, mult, total: bonusScore, name: `报送: ${type}`, tiles: selectedTiles }
      }]
    }));

    get().checkStatus();
  },

  submitHand: () => {
    const { hand, melds, ownedDocs, score, targetScore, canHu, discardsThisRound, money, currentStage, workplaceMessages, cardsPlayedThisRound, turnsLeft, turnsPlayedThisRound } = get();
    
    // 只有当有可胡的番型才能交付上线
    if (!canHu) return;
    
    playSound('hu');
    const { chips, mult, total: finalRoundScore, patternName } = calculateFinalScore({
      hand, melds, ownedDocs, discardsThisRound, cardsPlayedThisRound, money, canHu, turnsLeft
    });

    if (finalRoundScore < 200 && ownedDocs.find(d => d.id === 'pd_forced_fun')) {
      set(s => ({ money: s.money + 3 }));
    }

    // 福报扣费逻辑：每交付一张牌扣 $1（在 calculateFinalScore 中已计算工作量加成）
    // 这里只扣费，不重复计算工作量
    if (ownedDocs.find(d => d.id === 'pd_996_blessing')) {
      const allTilesCount = hand.length + melds.flatMap(m => m.tiles).length;
      set(s => ({ money: Math.max(0, s.money - allTilesCount) }));
    }

    const total = score + finalRoundScore;
    const success = total >= targetScore;
    
    let pipBonus = 0;
    if (success && ownedDocs.find(d => d.id === 'pd_pip_agreement')) {
      // 检查重构次数（discardsThisRound），而不是回合数
      if (discardsThisRound <= 3) pipBonus = 25;
      else set({ money: 0 });
    }

    const stageBonus = currentStage === 4 ? 6 : 4;

    set(s => {
      playSound('message');
      return {
        score: total,
        money: success ? s.money + stageBonus + pipBonus : s.money,
        state: success ? 'SHOP' : 'GAMEOVER',
        cardsPlayedThisRound: s.cardsPlayedThisRound + 1,
        shopDocs: success ? [...PIGEON_DOCS_POOL]
          .filter(d => !s.purchasedDocIds.includes(d.id)) // 排除已购买的文档
          .sort(() => Math.random() - 0.5)
          .slice(0, 3) : [],
        workplaceMessages: [...workplaceMessages, {
          id: Math.random().toString(), sender: '系统', role: 'SYSTEM', 
          content: success 
            ? `🎉 模块对齐成功！KPI 已达成。本次交付价值：${finalRoundScore.toLocaleString()}。发放关卡奖金：￥${stageBonus}`
            : `⚠️ 模块对齐失败。本次交付价值：${finalRoundScore.toLocaleString()}。`, 
          time: 'Now', type: success ? 'system' : 'result',
          details: { chips, mult, total: finalRoundScore, name: patternName }
        }]
      };
    });
  },

  checkStatus: () => {
    const { hand, melds, ownedDocs } = get();
    const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
    const win = checkMahjongWin(allTiles);
    const tenpaiMap: Record<string, Tile[]> = {};
    const possibleTiles = [];
    SUITS.forEach(suit => { for (let v = 1; v <= 9; v++) possibleTiles.push({ id: `TYPE-${suit}-${v}`, suit, value: v, label: `${v}` }); });
    HONORS_LABELS.forEach((h, idx) => { possibleTiles.push({ id: `TYPE-HONOR-${idx}`, suit: 'HONOR', value: idx + 1, label: h }); });
    
    let baseHandSize = 14;
    if (ownedDocs.find(d => d.id === 'pd_crisis')) baseHandSize -= 2;
    if (ownedDocs.find(d => d.id === 'pd_endless_sync')) baseHandSize -= 1;
    if (ownedDocs.find(d => d.id === 'pd_top_design')) baseHandSize += 2;

    // 计算当前应有的手牌数量（考虑副露的杠）
    // 麻将规则：每个副露的杠会减少3张手牌（因为杠用4张，但补摸1张）
    const kongCount = melds.filter(m => m.type === 'KONG').length;
    const expectedHandSize = baseHandSize - 3 * kongCount;

    // 听牌检查：手牌数量必须等于期望值，打掉1张后，再摸1张能胡
    // 听牌 = 打掉1张后，剩余手牌 + 已打出的melds，再摸任意1张能胡
    if (hand.length === expectedHandSize) { 
      hand.forEach((discardCandidate) => {
        const tempHand = hand.filter(t => t.id !== discardCandidate.id);
        // 打掉1张后，应该剩 expectedHandSize - 1 张手牌
        if (tempHand.length !== expectedHandSize - 1) return;
        
        const tempAllTiles = [...tempHand, ...melds.flatMap(m => m.tiles)];
        const handWaits: Tile[] = [];
        
        // 检查摸任意一张牌能否胡（总共应该是14张：剩余手牌 + melds + 新摸的1张）
        possibleTiles.forEach(p => { 
          if (checkMahjongWin([...tempAllTiles, p])) {
            handWaits.push(p);
          }
        });
        
        // 只有当确实有等待的牌时才记录听牌
        if (handWaits.length > 0) {
          tenpaiMap[discardCandidate.id] = handWaits;
        }
      });
    }
    set({ canHu: win, tenpaiMap });
  },

  sortHand: () => set(s => ({ hand: [...s.hand].sort((a,b) => (a.suit + a.value).localeCompare(b.suit + b.value)), selectedIndices: [] })),
  buyDoc: (doc) => set(s => {
    // 检查：资金足够、未持有超过5个
    // 允许卖出过的文档再次购买（卖出时会从purchasedDocIds中移除）
    if (s.money >= doc.price && s.ownedDocs.length < 5) {
      playSound('demo');
      const newPurchasedIds = s.purchasedDocIds.includes(doc.id) 
        ? s.purchasedDocIds 
        : [...s.purchasedDocIds, doc.id]; // 如果未购买过，添加到已购买列表
      return { 
        money: s.money - doc.price, 
        ownedDocs: [...s.ownedDocs, doc],
        purchasedDocIds: newPurchasedIds
      };
    }
    return {};
  }),
  sellDoc: (doc) => set(s => {
    // 不能卖出新手保护（特殊文档），但背低星可以出售
    if (doc.id === 'pd_newbie_protection') {
      return {};
    }
    
    // 卖出价格为买入的一半（向下取整）
    const sellPrice = Math.floor(doc.price / 2);
    
    // 从持有列表中移除
    const newOwnedDocs = s.ownedDocs.filter(d => d.id !== doc.id);
    
    // 从已购买列表中移除，允许再次购买
    const newPurchasedIds = s.purchasedDocIds.filter(id => id !== doc.id);
    
    playSound('iteration');
    return {
      money: s.money + sellPrice,
      ownedDocs: newOwnedDocs,
      purchasedDocIds: newPurchasedIds
    };
  }),
  nextRound: () => {
    set(s => {
      let ny = s.currentYear; let ns = s.currentStage + 1;
      let updatedOwnedDocs = [...s.ownedDocs];
      
      if (ns > 4) { 
        ns = 1; 
        ny += 1; 
        
        // 新手保护转换：进入第二年时，如果还有新手保护，自动变为背低星
        if (ny === 2) {
          const newbieIndex = updatedOwnedDocs.findIndex(d => d.id === 'pd_newbie_protection');
          if (newbieIndex !== -1) {
            updatedOwnedDocs[newbieIndex] = BACK_LOW_STAR_DOC;
          }
        }
        
        // 完成8年后胜利
        if (ny > 8) {
          return { state: 'VICTORY', currentYear: 8, currentStage: 4, ownedDocs: updatedOwnedDocs };
        }
      }
      return { currentYear: ny, currentStage: ns, ownedDocs: updatedOwnedDocs };
    });
    const state = get().state;
    if (state !== 'VICTORY') {
      get().initGame();
    }
  },
  resetGame: () => set({ state: 'MENU', currentYear: 1, currentStage: 1, score: 0, money: 4, hand: [], melds: [], ownedDocs: [], purchasedDocIds: [], workplaceMessages: [] })
}));
