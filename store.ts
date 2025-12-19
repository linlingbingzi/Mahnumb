
import { create } from 'zustand';
import { Tile, GameState, Suit, WorkplaceMessage, PigeonDoc, Meld } from './types';

const PIGEON_DOCS_POOL: PigeonDoc[] = [
  { id: 'pd_align', name: '颗粒度对齐', description: '每张代码(万)牌提供 +4 倍率。这是对齐逻辑的基石。', price: 4, rarity: 'Common', effectType: 'mult', value: 4 },
  { id: 'pd_logic', name: '底层逻辑', description: '总倍率 X 1.25。深入底层，重构认知。', price: 6, rarity: 'Uncommon', effectType: 'xMult', value: 1.25 },
  { id: 'pd_grip', name: '抓手', description: 'PPT(筒)牌的基础工作量 +20。寻找痛点，精准切入分析。', price: 4, rarity: 'Common', effectType: 'chips', value: 20 },
  { id: 'pd_empower', name: '赋能', description: '每张黑话(字)牌提供 +50 工作量。为业务插上想象的翅膀。', price: 5, rarity: 'Common', effectType: 'chips', value: 50 },
  { id: 'pd_combo', name: '组合拳', description: '如果包含刻子(三张相同)，倍率 +12。连招打出，势如破竹。', price: 8, rarity: 'Uncommon', effectType: 'mult', value: 12 },
  { id: 'pd_closed_loop', name: '闭环', description: '胡牌时，总倍率 X 2。形成闭环，自驱动增长。', price: 15, rarity: 'Rare', effectType: 'special', value: 2 },
  { id: 'pd_methodology', name: '方法论', description: '每剩余 1 次重构机会，+1 倍率。抽象沉淀，复用成功。', price: 10, rarity: 'Rare', effectType: 'mult', value: 1 },
];

const ONBOARDING_MESSAGES: WorkplaceMessage[] = [
  { id: 'ob1', sender: '产品-小王', role: 'BOSS', content: '哈喽，新来的同学！我是 PM 小王，欢迎加入对齐小组。', time: '10:00', type: 'chat' },
  { id: 'ob2', sender: '产品-小王', role: 'BOSS', content: '咱们本季度的核心目标是把这堆“乱如麻”的业务模块全部对齐。', time: '10:01', type: 'chat' },
  { id: 'ob3', sender: 'HRBP-张姐', role: 'BOSS', content: '@所有人 记得及时同步进度。KPI 达成率直接影响大家的年终文档。', time: '10:05', type: 'chat' },
  { id: 'ob4', sender: '技术总监-老李', role: 'BOSS', content: '大家一定要找到业务抓手。如果颗粒度对齐不了，年底可能要面临“优化”。', time: '10:10', type: 'chat' },
  { id: 'ob5', sender: '张总 (CEO)', role: 'BOSS', content: '不要只会低头写代码，要抬头看路。我们要以闭环交付为终极导向。', time: '10:12', type: 'chat' },
  { id: 'ob6', sender: '张总 (CEO)', role: 'BOSS', content: '现在，去采购你们需要的“鸽子文档”，开始第一轮迭代吧！', time: '10:13', type: 'chat' },
  { id: 'ob7', sender: '系统通知', role: 'SYSTEM', content: '⚠️ 待处理业务需求已加载。请通过“报送 DEMO”或“常规上线”达成 KPI。', time: '10:15', type: 'system' },
];

const WORK_RANDOM_MESSAGES = [
  "记得填周报，别忘了。",
  "那个Bug修复了吗？线上等着呢。",
  "下午3点的会记得参加，讨论颗粒度。",
  "老板刚才在群里点名了，你还没回。",
  "今天的咖啡不错，要不要来一杯？",
  "这个需求改一下，很简单，就加个按钮。",
  "颗粒度没对齐啊，再改改。",
  "底层逻辑还没跑通，需要重构。",
  "刚才那个会你咋没开摄像头？",
  "文档权限开一下，我看看细节。"
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
  workplaceMessages: WorkplaceMessage[];
  onboardingMessages: WorkplaceMessage[];
  doras: { suit: Suit; value: number }[];
  waits: Tile[]; 
  tenpaiMap: Record<string, Tile[]>; 
  canHu: boolean;
  lastDrawnId: string | null;
  ownedDocs: PigeonDoc[];
  shopDocs: PigeonDoc[];
  pendingOptions: Tile[] | null;
  
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
}

const SUITS: Suit[] = ['MAN', 'PIN', 'SOU'];
const HONORS_LABELS = ['OKR', '绩效', '述职', '复盘', '周报', '双月', '对齐'];

const getKPITarget = (year: number, stage: number) => {
  const baseTable = [200, 450, 800, 1500];
  const multiplier = Math.pow(1.9, year - 1);
  const stageBase = baseTable[stage - 1];
  return Math.floor(stageBase * multiplier / 10) * 10;
};

const checkMahjongWin = (allTiles: Tile[]): boolean => {
  if (allTiles.length < 2) return false;
  const counts: Record<string, number> = {};
  allTiles.forEach(t => {
    const key = `${t.suit}-${t.value}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  const isComplete = (rem: Record<string, number>, hasPair: boolean): boolean => {
    const keys = Object.keys(rem).filter(k => rem[k] > 0).sort();
    if (keys.length === 0) return true;
    const k = keys[0];
    const [suit, valStr] = k.split('-');
    const val = parseInt(valStr);
    if (!hasPair && rem[k] >= 2) {
      const next = { ...rem, [k]: rem[k] - 2 };
      if (isComplete(next, true)) return true;
    }
    if (rem[k] >= 3) {
      const next = { ...rem, [k]: rem[k] - 3 };
      if (isComplete(next, hasPair)) return true;
    }
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
  if (allTiles.length === 14) {
    const pairs = Object.values(counts).filter(c => c >= 2).length;
    const fourOfAKind = Object.values(counts).filter(c => c === 4).length;
    if (pairs + fourOfAKind === 7) return true;
  }
  return isComplete(counts, false);
};

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
  workplaceMessages: [],
  onboardingMessages: ONBOARDING_MESSAGES,
  doras: [],
  waits: [],
  tenpaiMap: {},
  canHu: false,
  lastDrawnId: null,
  ownedDocs: [],
  shopDocs: [],
  pendingOptions: null,

  startOnboarding: () => set({ state: 'ONBOARDING' }),

  initGame: () => {
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
    const initialHand = shuffled.slice(0, 14).map(t => ({
      ...t,
      isDora: doras.some(d => d.suit === t.suit && d.value === t.value)
    }));
    
    const year = get().currentYear;
    const stage = get().currentStage;
    const target = getKPITarget(year, stage);

    const initialMsg: WorkplaceMessage = { 
      id: 'm0', sender: '系统通知', role: 'SYSTEM', 
      content: `[通知] 开始 Year ${year} Q${stage} 迭代。目标 KPI: ${target}`, 
      time: '09:00', type: 'system' 
    };

    set({
      state: 'PLAYING',
      targetScore: target,
      deck: shuffled.slice(14),
      hand: initialHand,
      melds: [],
      selectedIndices: [],
      turnsLeft: 20,
      doras,
      score: 0,
      canHu: checkMahjongWin(initialHand),
      lastDrawnId: initialHand[13].id,
      workplaceMessages: [initialMsg],
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
    const newDeck = [...deck];
    const options = newDeck.splice(0, 2).map(t => ({
      ...t,
      isDora: doras.some(d => d.suit === t.suit && d.value === t.value)
    }));
    set({ deck: newDeck, pendingOptions: options });
  },

  confirmIteration: (chosenTile: Tile) => {
    const { hand, selectedIndices, turnsLeft, workplaceMessages } = get();
    const newHand = [...hand];
    newHand[selectedIndices[0]] = chosenTile;
    
    let nextMsgs = [...workplaceMessages];
    if (Math.random() > 0.7) {
      const senders = ["产品-小王", "HRBP-张姐", "架构-老李", "张总"];
      const randSender = senders[Math.floor(Math.random() * senders.length)];
      nextMsgs.push({
        id: Math.random().toString(),
        sender: randSender,
        role: 'BOSS',
        content: WORK_RANDOM_MESSAGES[Math.floor(Math.random() * WORK_RANDOM_MESSAGES.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'chat'
      });
    }

    set({ 
      hand: newHand, 
      selectedIndices: [], 
      pendingOptions: null, 
      turnsLeft: turnsLeft - 1, 
      lastDrawnId: chosenTile.id,
      workplaceMessages: nextMsgs
    });
    get().checkStatus();
  },

  executeDemoMeld: () => {
    const { hand, selectedIndices, melds, money, score, deck, doras, workplaceMessages, targetScore, currentYear, currentStage } = get();
    const selectedTiles = selectedIndices.map(i => hand[i]);
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

    const bonusScore = type === 'KONG' ? 1500 : type === 'PUNG' ? 500 : 250;
    const bonusMoney = type === 'KONG' ? 6 : type === 'PUNG' ? 2 : 1;
    
    const newMeld: Meld = { id: Math.random().toString(), type, tiles: selectedTiles };
    let newHand = hand.filter((_, i) => !selectedIndices.includes(i));
    let newDeck = [...deck];
    let drawTileId = get().lastDrawnId;

    if (type === 'KONG' && newDeck.length > 0) {
      const drawnTile = newDeck.shift()!;
      const processedTile = { ...drawnTile, isDora: doras.some(d => d.suit === drawnTile.suit && d.value === drawnTile.value) };
      newHand.push(processedTile);
      drawTileId = processedTile.id;
    }
    
    const newScore = score + bonusScore;
    const meldMsg: WorkplaceMessage = {
      id: Math.random().toString(), sender: '我', role: 'USER', content: `【对齐成功】报送 [${type}] 模块`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'meld',
      details: { chips: bonusScore, mult: 1, total: bonusScore, name: `交付: ${type}`, tiles: selectedTiles }
    };

    set({
      hand: newHand, deck: newDeck, melds: [...melds, newMeld], selectedIndices: [],
      lastDrawnId: drawTileId, score: newScore, money: money + bonusMoney,
      workplaceMessages: [...workplaceMessages, meldMsg]
    });

    if (newScore >= targetScore) {
       const isEndGame = currentYear === 8 && currentStage === 4;
       const nextShopDocs = !isEndGame ? [...PIGEON_DOCS_POOL].sort(() => Math.random() - 0.5).slice(0, 3) : [];
       
       set(s => ({
         state: isEndGame ? 'VICTORY' : 'SHOP',
         shopDocs: nextShopDocs,
         workplaceMessages: [...s.workplaceMessages, {
           id: Math.random().toString(), sender: '系统通知', role: 'SYSTEM',
           content: '✨ 核心业务指标已达成，提前进入季度结算。',
           time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           type: 'system'
         }]
       }));
    }

    get().checkStatus();
  },

  submitHand: () => {
    const { hand, melds, ownedDocs, score, targetScore, canHu, turnsLeft, currentYear, currentStage, workplaceMessages } = get();
    let chips = 0; let mult = 1;
    const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
    allTiles.forEach(t => {
      chips += t.suit === 'HONOR' ? 10 : t.value;
      if (t.isDora) { chips += 20; mult += 2; }
    });
    ownedDocs.forEach(doc => {
      if (doc.effectType === 'chips') chips += doc.value;
      if (doc.effectType === 'mult') mult += doc.value;
      if (doc.effectType === 'xMult') mult *= doc.value;
      if (doc.id === 'pd_align') mult += allTiles.filter(t => t.suit === 'MAN').length * doc.value;
      if (doc.id === 'pd_empower') chips += allTiles.filter(t => t.suit === 'HONOR').length * doc.value;
      if (doc.id === 'pd_methodology') mult += turnsLeft * doc.value;
    });
    melds.forEach(m => {
      if (m.type === 'KONG') { chips += 120; mult += 6; }
      if (m.type === 'PUNG') { chips += 60; mult += 3; }
      if (m.type === 'CHOW') { chips += 40; mult += 2; }
    });
    let finalCalculation = chips * mult;
    if (canHu) {
      finalCalculation *= 2;
      const closedLoopDoc = ownedDocs.find(d => d.id === 'pd_closed_loop');
      if (closedLoopDoc) finalCalculation *= closedLoopDoc.value;
    }
    const totalRoundScore = score + Math.floor(finalCalculation);
    const success = totalRoundScore >= targetScore;
    const isEndGame = currentYear === 8 && currentStage === 4;
    
    const resultMsg: WorkplaceMessage = {
      id: Math.random().toString(), sender: '系统通知', role: 'SYSTEM',
      content: success ? "🚀 迭代成功！交付价值颗粒度已对齐。" : "❌ 迭代失败，KPI 指标未达成。",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'result',
      details: { chips, mult, total: Math.floor(finalCalculation), name: canHu ? '核心闭环交付' : '普通上线交付' }
    };

    const nextShopDocs = success && !isEndGame ? [...PIGEON_DOCS_POOL].sort(() => Math.random() - 0.5).slice(0, 3) : [];

    set(s => ({
      score: totalRoundScore,
      workplaceMessages: [...workplaceMessages, resultMsg],
      state: success ? (isEndGame ? 'VICTORY' : 'SHOP') : 'GAMEOVER',
      shopDocs: nextShopDocs
    }));
  },

  checkStatus: () => {
    const { hand, melds } = get();
    const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
    const win = checkMahjongWin(allTiles);
    set({ canHu: win });
  },

  sortHand: () => {
    const { hand } = get();
    const sorted = [...hand].sort((a,b) => (a.suit + a.value).localeCompare(b.suit + b.value));
    set({ hand: sorted, selectedIndices: [] });
  },

  buyDoc: (doc) => {
    const { money, ownedDocs } = get();
    if (money >= doc.price && ownedDocs.length < 5) {
      set({ money: money - doc.price, ownedDocs: [...ownedDocs, doc] });
    }
  },

  nextRound: () => {
    set(s => {
      let ny = s.currentYear; let ns = s.currentStage + 1;
      if (ns > 4) { ns = 1; ny += 1; }
      return { currentYear: ny, currentStage: ns };
    });
    get().initGame();
  },

  resetGame: () => set({ state: 'MENU', currentYear: 1, currentStage: 1, score: 0, money: 4, hand: [], melds: [], ownedDocs: [], workplaceMessages: [] })
}));
