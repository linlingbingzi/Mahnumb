
import { PigeonDoc, Suit } from './types';

/**
 * 飞鸽文档 (Pigeon Documents) 全量配置表
 */
// 新手保护文档（第一年自动赠送）
export const NEWBIE_PROTECTION_DOC: PigeonDoc = {
  id: 'pd_newbie_protection',
  name: '新手保护',
  description: '第一年专属保护，绩效倍率 +2。第二年未卖出将自动变为"背低星"。',
  price: 0,
  rarity: '1星',
  effectType: 'mult',
  value: 2
};

// 背低星文档（新手保护转换而来）
export const BACK_LOW_STAR_DOC: PigeonDoc = {
  id: 'pd_back_low_star',
  name: '背低星',
  description: '新手保护过期后的产物，绩效倍率 -1。曾经的新手，现在的背锅侠。',
  price: 0,
  rarity: '1星',
  effectType: 'mult',
  value: -1
};

export const PIGEON_DOCS_POOL: PigeonDoc[] = [
  // --- 1星文档：基础赋能与摸鱼技巧 ---
  { 
    id: 'pd_align', 
    name: '颗粒度对齐', 
    description: '每张代码(万)牌提供 +4 绩效倍率。这是对齐逻辑的基石。', 
    price: 4, 
    rarity: '1星', 
    effectType: 'mult', 
    value: 4 
  },
  { 
    id: 'pd_grip', 
    name: '抓手', 
    description: '每张PPT(筒)牌的基础工作量 +20。精准切入业务核心。', 
    price: 4, 
    rarity: '1星', 
    effectType: 'chips', 
    value: 20 
  },
  { 
    id: 'pd_empower', 
    name: '赋能', 
    description: '每张黑话(字)牌提供 +50 工作量。为业务激发潜能。', 
    price: 5, 
    rarity: '1星', 
    effectType: 'chips', 
    value: 50 
  },
  { 
    id: 'pd_shuai_guo', 
    name: '技术性甩锅', 
    description: '每次弃牌（重构）时，本局绩效倍率 +2。不是我的问题。', 
    price: 4, 
    rarity: '1星', 
    effectType: 'mult', 
    value: 2 
  },
  { 
    id: 'pd_daily_report', 
    name: '精美日报', 
    description: '每张打出的偶数牌，提供 +30 工作量。日报写得妙，绩效少不了。', 
    price: 4, 
    rarity: '1星', 
    effectType: 'chips', 
    value: 30 
  },
  { 
    id: 'pd_coffee_iv', 
    name: '冰美式续命', 
    description: '本轮第一次出牌时，额外获得 +120 工作量。早C晚A，全靠这口仙气。', 
    price: 4, 
    rarity: '1星', 
    effectType: 'chips', 
    value: 120
  },
  { 
    id: 'pd_agile_sprint', 
    name: '小步快跑', 
    description: '每轮额外获得 +1 次重构机会。敏捷开发，快速试错。', 
    price: 5, 
    rarity: '1星', 
    effectType: 'special', 
    value: 1 
  },
  { 
    id: 'pd_forced_fun', 
    name: '团建占周末', 
    description: '如果单次交付分数小于 200 分，获得 $3 精神损失费。', 
    price: 4, 
    rarity: '1星', 
    effectType: 'special', 
    value: 3 
  },

  // --- 2星文档：管理层艺术 ---
  { 
    id: 'pd_logic', 
    name: '底层逻辑', 
    description: '最终总绩效倍率 +1.25。深入底层，重构认知。', 
    price: 7, 
    rarity: '2星', 
    effectType: 'mult', 
    value: 1.25
  },
  { 
    id: 'pd_big_pie', 
    name: '画大饼', 
    description: '有 1/4 的概率总绩效倍率 X 4，否则 X 1。大家再坚持一下！', 
    price: 8, 
    rarity: '2星', 
    effectType: 'xMult', 
    value: 4 
  },
  { 
    id: 'pd_manage_up', 
    name: '向上管理', 
    description: '打出的牌中每包含一张黑话(字)牌，绩效倍率 +15。搞定老板。', 
    price: 9, 
    rarity: '2星', 
    effectType: 'mult', 
    value: 15 
  },
  { 
    id: 'pd_matrix', 
    name: '业务矩阵', 
    description: '若交付同时包含万、筒、索三个领域，总绩效倍率 X 1.5。', 
    price: 10, 
    rarity: '2星', 
    effectType: 'xMult', 
    value: 1.5 
  },
  { 
    id: 'pd_crisis', 
    name: '公关危机', 
    description: '手牌上限 -2，但每一手交付总绩效倍率 X 1.5。全员高压运作。', 
    price: 10, 
    rarity: '2星', 
    effectType: 'xMult', 
    value: 1.5 
  },
  { 
    id: 'pd_ppt_master', 
    name: 'PPT 造车', 
    description: '若打出的牌全部为 PPT(筒)牌，总绩效倍率 X 1.8。拉投资必备。', 
    price: 11, 
    rarity: '2星', 
    effectType: 'xMult', 
    value: 1.8 
  },
  { 
    id: 'pd_endless_sync', 
    name: '马拉松会议', 
    description: '手牌上限 -1，但每交付一张牌，绩效倍率 +5。全天会议无休。', 
    price: 9, 
    rarity: '2星', 
    effectType: 'mult', 
    value: 5 
  },
  { 
    id: 'pd_deep_dive', 
    name: '垂直深耕', 
    description: '若打出的牌包含 5 张同花色牌，基础工作量 +150。在一个赛道做到极致。', 
    price: 10, 
    rarity: '2星', 
    effectType: 'chips', 
    value: 150 
  },

  // --- 3星文档：资本家形态 ---
  { 
    id: 'pd_closed_loop', 
    name: '闭环', 
    description: '胡牌（核心交付）时，总绩效倍率 X 3。自驱动增长。', 
    price: 15, 
    rarity: '3星', 
    effectType: 'special', 
    value: 3 
  },
  { 
    id: 'pd_optimization', 
    name: '结构性优化', 
    description: '若打出的交付只包含 1 张牌（单张），总绩效倍率 X 3.5。', 
    price: 16, 
    rarity: '3星', 
    effectType: 'xMult', 
    value: 3.5 
  },
  { 
    id: 'pd_996_blessing', 
    name: '福报', 
    description: '每交付一张牌，资金 -$1，但该张牌的基础工作量 +100。用命换钱。', 
    price: 15, 
    rarity: '3星', 
    effectType: 'chips', 
    value: 100 
  },
  { 
    id: 'pd_golden_handcuffs', 
    name: '金手铐', 
    description: '每拥有 $10 资金，总绩效倍率 X 1.2。赶都赶不走。', 
    price: 18, 
    rarity: '3星', 
    effectType: 'xMult', 
    value: 1.2 
  },
  { 
    id: 'pd_unicorn', 
    name: '独角兽', 
    description: '若当前工作量超过 500，总绩效倍率额外 X 2.5。估值飞升。', 
    price: 18, 
    rarity: '3星', 
    effectType: 'xMult', 
    value: 2.5 
  },
  { 
    id: 'pd_hotfix_deploy', 
    name: '周五紧急上线', 
    description: '当剩余出牌（重构）次数为 1 时，总绩效倍率 X 2.5。先上线再说。', 
    price: 16, 
    rarity: '3星', 
    effectType: 'xMult', 
    value: 2.5 
  },
  { 
    id: 'pd_pip_agreement', 
    name: '签署 PIP', 
    description: '如果在 3 次重构内通关本轮，获得 $25 奖金；否则失去所有资金。', 
    price: 18, 
    rarity: '3星', 
    effectType: 'special', 
    value: 25 
  },
  { 
    id: 'pd_resource_exchange', 
    name: '资源置换', 
    description: '每次触发“杠”（4张），获得 $5 资金。拓展公司杠杆。', 
    price: 20, 
    rarity: '3星', 
    effectType: 'special', 
    value: 5 
  },
  { 
    id: 'pd_top_design', 
    name: '顶层设计', 
    description: '手牌上限 +2。高维度看问题，赋能全体。', 
    price: 19, 
    rarity: '3星', 
    effectType: 'mult', 
    value: 10 
  }
];

/**
 * 8年完整数值曲线设计
 * 设计理念：
 * - Year 1-2: 新手期，温和增长
 * - Year 3-4: 成长期，开始挑战
 * - Year 5-6: 高难度期，需要策略
 * - Year 7-8: 极限挑战，匹配后期倍率组合的恐怖增长
 */
export const getKPITarget = (year: number, stage: number) => {
  // 基础值：[Q1, Q2, Q3, Q4] - 季度之间差距拉大
  const baseTable = [200, 550, 1400, 3000];
  
  // 年度倍数设计（8年完整曲线）
  // 使用分段函数，让增长更平滑但更陡峭
  let multiplier: number;
  if (year === 1) {
    multiplier = 1.0; // Year 1: 基准
  } else if (year === 2) {
    multiplier = 2.2; // Year 2: 2.2倍
  } else if (year === 3) {
    multiplier = 5.0; // Year 3: 5.0倍
  } else if (year === 4) {
    multiplier = 11.0; // Year 4: 11.0倍
  } else if (year === 5) {
    multiplier = 24.0; // Year 5: 24.0倍
  } else if (year === 6) {
    multiplier = 52.0; // Year 6: 52.0倍
  } else if (year === 7) {
    multiplier = 112.0; // Year 7: 112.0倍
  } else {
    // Year 8 及以后：使用指数增长
    multiplier = 112.0 * Math.pow(2.4, year - 7); // Year 8: 268.8倍, Year 9: 645倍...
  }
  
  const stageBase = baseTable[stage - 1];
  
  // 季度递增系数：Q1=1.0, Q2=1.3, Q3=1.6, Q4=2.0
  // 让同一年的季度之间也有明显差距
  const stageMultiplier = 1 + (stage - 1) * 0.33;
  
  return Math.floor(stageBase * multiplier * stageMultiplier / 10) * 10;
};

export const SUITS: Suit[] = ['MAN', 'PIN', 'SOU'];
export const HONORS_LABELS = ['OKR', '绩效', '述职', '复盘', '周报', '双月', '对齐'];
