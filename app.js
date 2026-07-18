/* =========================================================
   pop'n music風ポップ君クリッカー
   ---------------------------------------------------------
   ・notesCount    : 所持しているノーツの数
   ・perClick      : クリック1回あたりの獲得量
   ・generators    : キャラクター（レベルアップで強くなる）
   ・upgrades      : キャラクターの強化
   ・unlock        : 解放条件
   ・achievements  : 実績
   ・save/load     : window.storage / localStorage で保存
   ========================================================= */

const GENERATOR_DEFS = [
  { id:"g1", name:"ミミ", iconSrc:"icon/mimi.png", desc:"ミミちゃんが応援してくれるよ", baseCost:12, growth:1.13, cps:0.12, unlock:[] },
  { id:"g2", name:"ニャミ", iconSrc:"icon/nyami.png", desc:"ニャミちゃんが一緒にノーツを増やしてくれるよ", baseCost:100, growth:1.14, cps:1, unlock:[ {type:"generatorLevel",target:"g1",value:5} ] },
  { id:"g3", name:"ポエット", iconSrc:"icon/poet.png", desc:"ポエットちゃんが成長しながらお手伝いしてくれるよ", baseCost:1000, growth:1.14, cps:7, unlock:[ {type:"generatorLevel",target:"g2",value:5} ] },
  { id:"g4", name:"ちぇるみん", iconSrc:"icon/chermin.png", desc:"ちぇるみんが見守ってくれるよ。だからやさしく見守ってあげてね", baseCost:12000, growth:1.14, cps:50, unlock:[ {type:"generatorLevel",target:"g3",value:5} ] },
  { id:"g5", name:"スペース🪐マコ", iconSrc:"icon/mako.png", desc:"マコちゃんが魔法の力でサポートしてくれるよ", baseCost:140000, growth:1.14, cps:400, unlock:[ {type:"generatorLevel",target:"g4",value:5} ] },
  { id:"g6", name:"ニア", iconSrc:"icon/nia.png", desc:"ニアちゃんが逃げずに助けてくれるよ", baseCost:1600000, growth:1.14, cps:3000, unlock:[ {type:"generatorLevel",target:"g5",value:5} ] },
  { id:"g7", name:"Σ", iconSrc:"icon/sigma.png", desc:"シグマ様が素数の世界からちょっとだけ手助けしてくれるよ", baseCost: 17999927, growth:1.15, cps:29989, unlock:[ {type:"generatorLevel",target:"g6",value:5} ] },
];

const UPGRADE_DEFS = [
  { id:"click1", name:"ポップ君を叩け～♪", iconSrc: "icon/minipop.png", desc: "クリック獲得量が2倍になるよ！", cost:99, type:"clickMult", value:2, unlock:[ {type:"clickCount",value:50} ] },
  { id:"click2", name:"3・2・1・プーッシュ！", iconSrc: "icon/minipop.png", desc: "クリック獲得量が3倍になるよ！", cost:500, type:"clickMult", value:3, unlock:[ {type:"clickCount",value:300} ] },
  { id:"click3", name:"ゲリラのように落ちてくる", iconSrc: "icon/minipop.png", desc: "全部まとめて ぱぱっと連打。クリック獲得量が4倍になるよ！", cost:4000, type:"clickMult", value:4, unlock:[ {type:"clickCount",value:700} ] },
  { id: "all1", name: "パーティーのはじまり", iconSrc: "icon/minipop.png", desc: "ポップンパーティでみんな大はしゃぎ！全員の能力が2倍になるよ！", cost: 50000, type: "globalMult", value: 2, unlock: [{ type: "totalNotesCount", value: 50000 }] },

  { id:"g1_10", name:"うさぎグッズ", iconSrc: "icon/mimi.png", desc: "お気に入りのグッズを身に着けて、ミミちゃんの能力が3倍になるよ", cost:300, type:"targetMult", target:"g1", value:3, unlock:[ {type:"generatorLevel",target:"g1",value:10} ] },
  { id:"g1_20", name:"丸い蛍光灯", iconSrc: "icon/mimi.png", desc: "頭につけると無表情になっちゃうけど、ミミちゃんの能力が3倍になるよ", cost:1800, type:"targetMult", target:"g1", value:3, unlock:[ {type:"generatorLevel",target:"g1",value:20} ] },
  { id:"g1_42", name:"風車とアンテナ", iconSrc: "icon/mimi.png", desc: "不思議な夢を見たミミちゃん。起きたら能力が10倍になってたよ", cost:20000, type:"targetMult", target:"g1", value:10, unlock:[ {type:"generatorLevel",target:"g1",value:42} ] },

  { id:"g2_10", name:"ジェットコースター", iconSrc: "icon/nyami.png", desc: "スリル満点！ニャミちゃんの能力が2倍になるよ", cost:1500, type:"targetMult", target:"g2", value:2, unlock:[ {type:"generatorLevel",target:"g2",value:10} ] },
  { id:"g2_20", name:"懐中時計", iconSrc: "icon/nyami.png", desc: "お気に入りのアイテムでニャミちゃんの能力が3倍になるよ", cost:9000, type:"targetMult", target:"g2", value:3, unlock:[ {type:"generatorLevel",target:"g2",value:20} ] },
  { id:"g2_m30", name:"ミミちゃんの応援", iconSrc: "icon/mimi.png", desc: "ミミちゃんからの応援でニャミちゃんの能力が2倍になるよ", cost:15000, type:"targetMult", target:"g2", value:3, unlock:[ {type:"generatorLevel",target:"g1",value:30} ] },

  { id:"g3_5", name:"大きな安全ピン", iconSrc: "icon/poet.png", desc: "見習い天使の必需品。ポエットちゃんの能力が2倍になるよ", cost:15000, type:"targetMult", target:"g3", value:2, unlock:[ {type:"generatorLevel",target:"g3",value:5} ] },
  { id:"g3_10", name:"魚の一家", iconSrc: "icon/poet.png", desc: "加藤さん一家の協力でポエットちゃんの能力が2倍になるよ", cost:50000, type:"targetMult", target:"g3", value:2, unlock:[ {type:"generatorLevel",target:"g3",value:10} ] },
  { id:"g3_15", name:"シスター服", iconSrc: "icon/poet.png", desc: "不思議な力でポエットちゃんの能力が2倍になるよ", cost:100000, type:"targetMult", target:"g3", value:2, unlock:[ {type:"generatorLevel",target:"g3",value:15} ] },
  { id:"g3_20", name:"金色のラッパ", iconSrc: "icon/poet.png", desc: "いつかママみたいな天使に！ポエットちゃんの能力が3倍になるよ", cost:150000, type:"targetMult", target:"g3", value:3, unlock:[ {type:"generatorLevel",target:"g3",value:20} ] },

  { id:"g4_10", name:"あまいおくすり", iconSrc: "icon/chermin.png", desc: "真っ暗な夜にとけこんで、ちぇるみんの能力が2倍になるよ", cost:150000, type:"targetMult", target:"g4", value:2, unlock:[ {type:"generatorLevel",target:"g4",value:10} ] },
  { id:"g4_20", name:"まっぷたツートンソウル", iconSrc: "icon/chermin.png", desc: "運命の相手が見つかって、ちぇるみんの能力が5倍になるよ", cost:900000, type:"targetMult", target:"g4", value:5, unlock:[ {type:"generatorLevel",target:"g4",value:20} ] },

  { id:"g5_10", name:"テクニカルマイコンパクト", iconSrc: "icon/mako.png", desc: "変身アイテムでスペース🪐マコの能力が3倍になるよ", cost:1500000, type:"targetMult", target:"g5", value:3, unlock:[ {type:"generatorLevel",target:"g5",value:10} ] },
  { id:"g5_20", name:"キング様からの応援", iconSrc: "icon/mako.png", desc: "憧れの人からの応援でスペース🪐マコの能力が5倍になるよ", cost:9000000, type:"targetMult", target:"g5", value:5, unlock:[ {type:"generatorLevel",target:"g5",value:20} ] },

  { id:"g6_10", name:"コスプレ衣装", iconSrc: "icon/nia.png", desc: "こっそり着替えてニアちゃんの能力が3倍になるよ", cost:15000000, type:"targetMult", target:"g6", value:3, unlock:[ {type:"generatorLevel",target:"g6",value:10} ] },
  { id:"g6_20", name:"暗くて狭い部屋", iconSrc: "icon/nia.png", desc: "落ち着く環境でニアちゃんの能力が6倍になるよ", cost:90000000, type:"targetMult", target:"g6", value:6, unlock:[ {type:"generatorLevel",target:"g6",value:20} ] },

  { id:"g8_7", name:"ネクタル", iconSrc: "icon/sigma.png", desc: "神々のためのお酒。シグマ様の能力が3倍になるよ", cost:150000001, type:"targetMult", target:"g7", value:3, unlock:[ {type:"generatorLevel",target:"g7",value:7} ] },
  { id:"g7_17", name:"シグマ様親衛隊", iconSrc: "icon/sigma.png", desc: "リソスとその仲間の力で、シグマ様の能力が7倍になるよ", cost:900000011, type:"targetMult", target:"g7", value:7, unlock:[ {type:"generatorLevel",target:"g7",value:17} ] },
];

const ACHIEVEMENT_DEFS = [
  { id: "first_click", name: "はじめの一歩", iconSrc: "icon/minipop.png", desc: "はじめてポップ君をクリックする", unlock: [{ type: "clickCount", value: 1 }] },
  { id: "click_100", name: "100コンボ", iconSrc: "icon/minipop.png", desc: "ポップ君を100回クリックする", unlock: [{ type: "clickCount", value: 100 }] },
  { id: "click_1025", name: "準辛ゲージ", iconSrc: "icon/minipop.png", desc: "ポップ君を1025回クリックする", unlock: [{ type: "clickCount", value: 1025 }] },
  { id: "click_1537", name: "これが辛ゲージです", iconSrc: "icon/minipop.png", desc: "ポップ君を1537回クリックする", unlock: [{ type: "clickCount", value: 1537 }] },
  { id: "earn_1000", name: "ポップ君大集合", iconSrc: "icon/minipop.png", desc: "累計で1000ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 1000 }] },
  { id: "earn_6573", name: "トイサイダー村", iconSrc: "icon/minipop.png", desc: "累計で6573ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 6573 }] },
  { id: "earn_50all", name: "Lv50全ノーツ相当", iconSrc: "icon/minipop.png", desc: "(THX 4まで全26譜面)累計で46115ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 46115 }] },
  { id: "first_upgrade", name: "アップグレード！", iconSrc: "icon/nyami.png", desc: "はじめて強化をする", unlock: [{ type: "upgradesOwnedCount", value: 1 }] },
  { id: "playtime_16min", name: "タイムプレーモード", iconSrc: "icon/minipop.png", desc: "累計16分間プレイする", unlock: [{ type: "playTimeSeconds", value: 960 }] },
  { id: "first_generator", name: "キャラクターご招待", iconSrc: "icon/mimi.png", desc: "はじめてキャラクターを呼ぶ", unlock: [{ type: "generatorLevel", target: "g1", value: 1 }] },
  { id: "first_sigma", name: "素数の世界へ", iconSrc: "icon/sigma.png", desc: "はじめてΣ様を呼ぶ", unlock: [{ type: "generatorLevel", target: "g7", value: 1 }] },
  { id: "end", name: "おしまい", iconSrc: "icon/sigma.png", desc: "今このゲームでできることは大体全部終わったよ。また遊んでね", unlock: [{ type: "generatorLevel", target: "g7", value: 17 }] },
];

let state = {
  notesCount: 0,
  totalNotesCount: 0,
  clickCount: 0,
  playTimeSeconds: 0,
  perClick: 1,
  clickMult: 1,
  globalMult: 1,
  generators: {},
  upgradesOwned: [],
  achievementsUnlocked: [],
  achievementUnlockTimes: {},
};

function earnNotes(amount) {
  state.notesCount += amount;
  state.totalNotesCount += amount;
}

GENERATOR_DEFS.forEach(g => {
  state.generators[g.id] = { level: 0, mult: 1 };
});

function formatNumber(n) {
  if (n < 10000) {
    if (Number.isInteger(n)) return n.toString();
    return (Math.round(n * 100) / 100).toString();
  }
  const units = ["万", "億", "兆", "京"];
  let unitIndex = -1;
  while (n >= 10000 && unitIndex < units.length - 1) {
    n /= 10000;
    unitIndex++;
  }
  return n.toFixed(2) + units[unitIndex];
}

function generatorCost(def, level) {
  return Math.ceil(def.baseCost * Math.pow(def.growth, level));
}

function achievementBonusRate() {
  // 実績1つ解除ごとに5%のcpsボーナス
  return state.achievementsUnlocked.length * 0.05;
}

function achievementBonusMult() {
  return 1 + achievementBonusRate();
}

function totalCps() {
  let total = 0;
  GENERATOR_DEFS.forEach(def => {
    const g = state.generators[def.id];
    total += def.cps * g.level * g.mult;
  });
  return total * state.globalMult * achievementBonusMult();
}

function perClickValue() {
  return state.perClick * state.clickMult;
}

/* ---------- 獲得プレビュー用ツールチップ ---------- */

function formatPaybackTime(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  return formatPlayTime(Math.ceil(seconds));
}

function cpsEfficiencyRow(cost, diff) {
  if (diff <= 0) {
    return `<div class="tooltip-row tooltip-efficiency"><span>⏱ 回収時間</span><span>—</span></div>`;
  }
  const paybackSeconds = cost / diff;
  return `<div class="tooltip-row tooltip-efficiency"><span>⏱ 回収時間</span><span>${formatPaybackTime(paybackSeconds)}</span></div>`;
}

function unitEfficiencyRow(cost, diff) {
  if (diff <= 0) {
    return `<div class="tooltip-row tooltip-efficiency"><span>💡 コスト効率</span><span>—</span></div>`;
  }
  const perUnitCost = cost / diff;
  return `<div class="tooltip-row tooltip-efficiency"><span>💡 コスト効率</span><span>${formatNumber(perUnitCost)} ノーツ/+1</span></div>`;
}

function affordabilityRow(cost) {
  if (state.notesCount >= cost) return "";
  const cps = totalCps();
  const needed = cost - state.notesCount;
  if (cps <= 0) {
    return `<div class="tooltip-row tooltip-wait"><span>⏳ 獲得まで</span><span>収入がないため不明</span></div>`;
  }
  const secondsNeeded = needed / cps;
  return `<div class="tooltip-row tooltip-wait"><span>⏳ 獲得まで</span><span>あと${formatPaybackTime(secondsNeeded)}</span></div>`;
}

function generatorTooltipHtml(def) {
  const g = state.generators[def.id];
  const cost = generatorCost(def, g.level);
  const currentContribution = def.cps * g.level * g.mult * state.globalMult * achievementBonusMult();
  const nextContribution = def.cps * (g.level + 1) * g.mult * state.globalMult * achievementBonusMult();
  const diff = nextContribution - currentContribution;

  return `
    <div class="tooltip-title">${def.name} を獲得 (Lv.${g.level} → Lv.${g.level + 1})</div>
    <div class="tooltip-row"><span>現在の生産量</span><span>${formatNumber(currentContribution)}/秒</span></div>
    <div class="tooltip-row"><span>獲得後の生産量</span><span>${formatNumber(nextContribution)}/秒</span></div>
    <div class="tooltip-row tooltip-highlight"><span>増加量</span><span>+${formatNumber(diff)}/秒</span></div>
    <div class="tooltip-row"><span>コスト</span><span>${formatNumber(cost)} ノーツ</span></div>
    ${affordabilityRow(cost)}
    ${cpsEfficiencyRow(cost, diff)}
  `;
}

function upgradeTooltipHtml(def) {
  let rows = "";
  let diff = 0;
  let isCps = true;

  if (def.type === "clickMult") {
    const current = perClickValue();
    const next = current * def.value;
    diff = next - current;
    isCps = false;
    rows = `
      <div class="tooltip-row"><span>現在のクリック獲得量</span><span>+${formatNumber(current)}</span></div>
      <div class="tooltip-row"><span>獲得後のクリック獲得量</span><span>+${formatNumber(next)}</span></div>
      <div class="tooltip-row tooltip-highlight"><span>増加量</span><span>+${formatNumber(diff)}</span></div>
    `;
  } else if (def.type === "globalMult") {
    const current = totalCps();
    const next = current * def.value;
    diff = next - current;
    rows = `
      <div class="tooltip-row"><span>現在の毎秒獲得量（全体）</span><span>${formatNumber(current)}/秒</span></div>
      <div class="tooltip-row"><span>獲得後の毎秒獲得量（全体）</span><span>${formatNumber(next)}/秒</span></div>
      <div class="tooltip-row tooltip-highlight"><span>増加量</span><span>+${formatNumber(diff)}/秒</span></div>
    `;
  } else if (def.type === "targetMult") {
    const targetDef = GENERATOR_DEFS.find(d => d.id === def.target);
    const g = state.generators[def.target];
    const current = targetDef.cps * g.level * g.mult * state.globalMult * achievementBonusMult();
    const next = targetDef.cps * g.level * (g.mult * def.value) * state.globalMult * achievementBonusMult();
    diff = next - current;
    rows = `
      <div class="tooltip-row"><span>${targetDef.name}の現在の生産量</span><span>${formatNumber(current)}/秒</span></div>
      <div class="tooltip-row"><span>獲得後の生産量</span><span>${formatNumber(next)}/秒</span></div>
      <div class="tooltip-row tooltip-highlight"><span>増加量</span><span>+${formatNumber(diff)}/秒</span></div>
    `;
  }

  const effRow = isCps ? cpsEfficiencyRow(def.cost, diff) : unitEfficiencyRow(def.cost, diff);

  return `
    <div class="tooltip-title">${def.name} を獲得</div>
    ${rows}
    <div class="tooltip-row"><span>コスト</span><span>${formatNumber(def.cost)} ノーツ</span></div>
    ${affordabilityRow(def.cost)}
    ${effRow}
  `;
}

function positionTooltip(x, y) {
  const offset = 16;
  const margin = 8;
  let left = x + offset;
  let top = y + offset;
  const rect = itemTooltip.getBoundingClientRect();
  if (left + rect.width > window.innerWidth - margin) {
    left = x - rect.width - offset;
  }
  if (top + rect.height > window.innerHeight - margin) {
    top = y - rect.height - offset;
  }
  itemTooltip.style.left = Math.max(margin, left) + "px";
  itemTooltip.style.top = Math.max(margin, top) + "px";
}

let hoveredTooltip = null; // { kind: 'generator' | 'upgrade', def, x, y }

function showGeneratorTooltip(def, x, y) {
  hoveredTooltip = { kind: "generator", def, x, y };
  itemTooltip.innerHTML = generatorTooltipHtml(def);
  itemTooltip.style.display = "block";
  positionTooltip(x, y);
}

function showUpgradeTooltip(def, x, y) {
  hoveredTooltip = { kind: "upgrade", def, x, y };
  itemTooltip.innerHTML = upgradeTooltipHtml(def);
  itemTooltip.style.display = "block";
  positionTooltip(x, y);
}

function hideItemTooltip() {
  hoveredTooltip = null;
  itemTooltip.style.display = "none";
}

function refreshItemTooltip() {
  if (!hoveredTooltip) return;
  if (hoveredTooltip.kind === "generator") {
    showGeneratorTooltip(hoveredTooltip.def, hoveredTooltip.x, hoveredTooltip.y);
  } else if (hoveredTooltip.kind === "upgrade") {
    showUpgradeTooltip(hoveredTooltip.def, hoveredTooltip.x, hoveredTooltip.y);
  }
}

function isUnlocked(unlockConditions) {
  if (!unlockConditions || unlockConditions.length === 0) return true;
  return unlockConditions.every(cond => {
    if (cond.type === "totalNotesCount") {
      return state.totalNotesCount >= cond.value;
    }
    if (cond.type === "currentNotes") {
      return state.notesCount >= cond.value;
    }
    if (cond.type === "generatorLevel") {
      const g = state.generators[cond.target];
      return g ? g.level >= cond.value : false;
    }
    if (cond.type === "clickCount") {
      return state.clickCount >= cond.value;
    }
    if (cond.type === "playTimeSeconds") {
      return state.playTimeSeconds >= cond.value;
    }
    if (cond.type === "upgradesOwnedCount") {
      return state.upgradesOwned.length >= cond.value;
    }
    console.warn("未知の解放条件タイプです:", cond.type);
    return false;
  });
}

const countDisplay = document.getElementById("countDisplay");
const perClickDisplay = document.getElementById("perClickDisplay");
const cpsDisplay = document.getElementById("cpsDisplay");
const generatorList = document.getElementById("generatorList");
const upgradeList = document.getElementById("upgradeList");
const shopPanel = document.getElementById("shopPanel");
const statsPanel = document.getElementById("statsPanel");
const saveStatus = document.getElementById("saveStatus");
const statClickCount = document.getElementById("statClickCount");
const statTotalEarned = document.getElementById("statTotalEarned");
const statPlayTime = document.getElementById("statPlayTime");
const statGeneratorTotal = document.getElementById("statGeneratorTotal");
const ownedUpgradeList = document.getElementById("ownedUpgradeList");
const achievementList = document.getElementById("achievementList");
const achievementBonusText = document.getElementById("achievementBonusText");
const achievementToastContainer = document.getElementById("achievementToastContainer");
const itemTooltip = document.getElementById("itemTooltip");

function renderTopBar() {
  countDisplay.textContent = formatNumber(state.notesCount) + " ノーツ";
  perClickDisplay.textContent = "クリックあたり +" + formatNumber(perClickValue()) + " ノーツ";
  cpsDisplay.textContent = "毎秒 +" + formatNumber(totalCps()) + " ノーツ";
}

let lastGeneratorSignature = null;

function renderGenerators() {
  const visibleDefs = GENERATOR_DEFS.filter(def => isUnlocked(def.unlock));
  const lockedCount = GENERATOR_DEFS.length - visibleDefs.length;
  const signature = visibleDefs.map(d => d.id).join(",") + "|" + lockedCount;

  if (signature !== lastGeneratorSignature) {
    hideItemTooltip();
    generatorList.innerHTML = "";
    visibleDefs.forEach(def => {
      const el = document.createElement("div");
      el.className = "item";
      el.dataset.id = def.id;
      el.innerHTML = `
        <div class="item-icon"><img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}"></div>
        <div class="item-main">
          <div class="item-name"><span class="name-text">${def.name}</span><span class="owned-badge"></span></div>
          <div class="item-desc"></div>
        </div>
        <div class="item-cost"></div>
      `;
      el.addEventListener("click", () => buyGenerator(def));
      el.addEventListener("mouseenter", (e) => showGeneratorTooltip(def, e.clientX, e.clientY));
      el.addEventListener("mousemove", (e) => showGeneratorTooltip(def, e.clientX, e.clientY));
      el.addEventListener("mouseleave", hideItemTooltip);
      generatorList.appendChild(el);
    });
    if (lockedCount > 0) {
      const el = document.createElement("div");
      el.className = "item locked-summary";
      el.innerHTML = `<div>🔒 未解放のキャラクターがあと${lockedCount}人います</div>`;
      generatorList.appendChild(el);
    }
    lastGeneratorSignature = signature;
  }

  visibleDefs.forEach(def => {
    const el = generatorList.querySelector(`[data-id="${def.id}"]`);
    if (!el) return;
    const g = state.generators[def.id];
    const cost = generatorCost(def, g.level);
    const affordable = state.notesCount >= cost;
    el.classList.toggle("disabled", !affordable);
    el.querySelector(".owned-badge").innerHTML = g.level > 0 ? ` <span class="item-owned">Lv.${g.level}</span>` : "";
    el.querySelector(".item-desc").textContent = `${def.desc}`;
    el.querySelector(".item-cost").textContent = formatNumber(cost);
  });
}

let lastUpgradeSignature = null;

function renderUpgrades() {
  const visibleDefs = UPGRADE_DEFS.filter(def => !state.upgradesOwned.includes(def.id) && isUnlocked(def.unlock));
  const lockedCount = UPGRADE_DEFS.filter(def => !state.upgradesOwned.includes(def.id) && !isUnlocked(def.unlock)).length;
  const signature = visibleDefs.map(d => d.id).join(",") + "|" + lockedCount;

  if (signature !== lastUpgradeSignature) {
    hideItemTooltip();
    upgradeList.innerHTML = "";

    if (visibleDefs.length === 0 && lockedCount === 0) {
      upgradeList.innerHTML = `<div class="item-desc" style="text-align:center;padding:12px;">強化可能なキャラクターはいません</div>`;
    } else {
      visibleDefs.forEach(def => {
        const el = document.createElement("div");
        el.className = "item";
        el.dataset.id = def.id;
        el.innerHTML = `
          <div class="item-icon"><img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}"></div>
          <div class="item-main">
            <div class="item-name">${def.name}</div>
            <div class="item-desc">${def.desc}</div>
          </div>
          <div class="item-cost">${formatNumber(def.cost)}</div>
        `;
        el.addEventListener("click", () => buyUpgrade(def));
        el.addEventListener("mouseenter", (e) => showUpgradeTooltip(def, e.clientX, e.clientY));
        el.addEventListener("mousemove", (e) => showUpgradeTooltip(def, e.clientX, e.clientY));
        el.addEventListener("mouseleave", hideItemTooltip);
        upgradeList.appendChild(el);
      });
      if (lockedCount > 0) {
        const el = document.createElement("div");
        el.className = "item locked-summary";
        el.innerHTML = `<div>🔒 未解放の強化があと${lockedCount}個あります</div>`;
        upgradeList.appendChild(el);
      }
    }
    lastUpgradeSignature = signature;
  }

  visibleDefs.forEach(def => {
    const el = upgradeList.querySelector(`[data-id="${def.id}"]`);
    if (!el) return;
    const affordable = state.notesCount >= def.cost;
    el.classList.toggle("disabled", !affordable);
  });
}

function formatPlayTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}時間${m}分${s}秒`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

function renderStats() {
  statClickCount.textContent = formatNumber(state.clickCount) + " 回";
  statTotalEarned.textContent = formatNumber(state.totalNotesCount) + " ノーツ";
  statPlayTime.textContent = formatPlayTime(state.playTimeSeconds);
  const generatorTotal = GENERATOR_DEFS.reduce((sum, def) => sum + state.generators[def.id].level, 0);
  statGeneratorTotal.textContent = formatNumber(generatorTotal);

  ownedUpgradeList.innerHTML = "";
  if (state.upgradesOwned.length === 0) {
    ownedUpgradeList.innerHTML = `<div class="item owned-summary">まだ強化したキャラクターはいません</div>`;
  } else {
    state.upgradesOwned.forEach(id => {
      const def = UPGRADE_DEFS.find(u => u.id === id);
      if (!def) return;
      const el = document.createElement("div");
      el.className = "item";
      el.style.cursor = "default";
      el.innerHTML = `
        <div class="item-icon"><img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}"></div>
        <div class="item-main">
          <div class="item-name">${def.name}</div>
          <div class="item-desc">${def.desc}</div>
        </div>
      `;
      ownedUpgradeList.appendChild(el);
    });
  }
}

function renderAchievements() {
  achievementList.innerHTML = "";
  const unlockedCount = state.achievementsUnlocked.length;
  const lockedCount = ACHIEVEMENT_DEFS.length - unlockedCount;
  const bonusPercent = Math.round(achievementBonusRate() * 100);
  achievementBonusText.textContent = `実績解除数 ${unlockedCount}：毎秒のノーツ生産数に${bonusPercent}%のボーナスが付くよ`;

  if (unlockedCount === 0) {
    achievementList.innerHTML = `<div class="item owned-summary">まだ解除した実績はありません</div>`;
  } else {
    state.achievementsUnlocked.forEach(id => {
      const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
      if (!def) return;
      const unlockedAt = state.achievementUnlockTimes[id];
      const timeText = unlockedAt !== undefined
        ? `プレイ時間 ${formatPlayTime(unlockedAt)} で解除`
        : "";
      const el = document.createElement("div");
      el.className = "achievement-row";
      el.innerHTML = `
        <div class="item-icon"><img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}"></div>
        <div class="item-main">
          <div class="item-name">${def.name}</div>
          <div class="item-desc">${def.desc}</div>
          ${timeText ? `<div class="achievement-time">⏰ ${timeText}</div>` : ""}
        </div>
      `;
      achievementList.appendChild(el);
    });
  }

  if (lockedCount > 0) {
    const el = document.createElement("div");
    el.className = "item locked-summary";
    el.innerHTML = `<div>🔒 未解放の実績があと${lockedCount}個あります</div>`;
    achievementList.appendChild(el);
  }
}

function checkAchievements() {
  ACHIEVEMENT_DEFS.forEach(def => {
    if (state.achievementsUnlocked.includes(def.id)) return;
    if (isUnlocked(def.unlock)) {
      state.achievementsUnlocked.push(def.id);
      state.achievementUnlockTimes[def.id] = state.playTimeSeconds;
      announceAchievement(def);
    }
  });
}

function announceAchievement(def) {
  const el = document.createElement("div");
  el.className = "achievement-toast";
  el.innerHTML = `
    <div class="toast-icon"><img class="item-icon-image"  src="${def.iconSrc}" alt="${def.name}"></div>
    <div>
      <div class="toast-label">実績解除</div>
      <div class="toast-name">${def.name}</div>
    </div>
  `;
  achievementToastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function renderAll() {
  checkAchievements();
  renderTopBar();
  renderGenerators();
  renderUpgrades();
  renderStats();
  renderAchievements();
  refreshItemTooltip();
}

function buyGenerator(def) {
  if (!isUnlocked(def.unlock)) return;
  const g = state.generators[def.id];
  const cost = generatorCost(def, g.level);
  if (state.notesCount < cost) return;
  state.notesCount -= cost;
  g.level += 1;
  renderAll();
}

function buyUpgrade(def) {
  if (!isUnlocked(def.unlock)) return;
  if (state.notesCount < def.cost) return;
  state.notesCount -= def.cost;
  state.upgradesOwned.push(def.id);

  if (def.type === "clickMult") {
    state.clickMult *= def.value;
  } else if (def.type === "globalMult") {
    state.globalMult *= def.value;
  } else if (def.type === "targetMult") {
    state.generators[def.target].mult *= def.value;
  }
  renderAll();
}

const popkunBtn = document.getElementById("popkunBtn");
const clickArea = document.getElementById("clickArea");

popkunBtn.addEventListener("click", (e) => {
  state.clickCount += 1;
  earnNotes(perClickValue());
  spawnFloatText("+" + formatNumber(perClickValue()), e.clientX, e.clientY);
  renderTopBar();
  renderGenerators();
  renderUpgrades();
  refreshItemTooltip();
});

function spawnFloatText(text, x, y) {
  const el = document.createElement("div");
  el.className = "float-text";
  el.textContent = text;
  const rect = clickArea.getBoundingClientRect();
  el.style.left = (x - rect.left) + "px";
  el.style.top = (y - rect.top) + "px";
  clickArea.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

setInterval(() => {
  state.playTimeSeconds += 1;
  const cps = totalCps();
  if (cps > 0) {
    earnNotes(cps);
  }
  renderAll();
}, 1000);

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    shopPanel.style.display = tab === "shop" ? "block" : "none";
    statsPanel.style.display = tab === "stats" ? "block" : "none";
  });
});

const SAVE_KEY = "popn-clicker-save";

async function saveGame(silent) {
  try {
    const storage = window.storage || window.localStorage;
    if (storage && typeof storage.setItem === "function") {
      storage.setItem(SAVE_KEY, JSON.stringify(state));
      if (!silent) showSaveStatus("保存しました");
      return;
    }
    throw new Error("No storage available");
  } catch (err) {
    console.error("保存に失敗しました", err);
    if (!silent) showSaveStatus("保存に失敗しました");
  }
}

async function loadGame() {
  try {
    const storage = window.storage || window.localStorage;
    let result = null;

    if (storage && typeof storage.getItem === "function") {
      const value = storage.getItem(SAVE_KEY);
      if (value) result = { value };
    } else if (window.storage && typeof window.storage.get === "function") {
      result = await window.storage.get(SAVE_KEY);
    }

    if (result && result.value) {
      const loaded = JSON.parse(result.value);
      state.notesCount = loaded.notesCount ?? 0;
      state.totalNotesCount = loaded.totalNotesCount ?? state.notesCount;
      state.clickCount = loaded.clickCount ?? 0;
      state.playTimeSeconds = loaded.playTimeSeconds ?? 0;
      state.perClick = loaded.perClick ?? 1;
      state.clickMult = loaded.clickMult ?? 1;
      state.globalMult = loaded.globalMult ?? 1;
      state.upgradesOwned = loaded.upgradesOwned ?? [];
      state.achievementsUnlocked = loaded.achievementsUnlocked ?? [];
      state.achievementUnlockTimes = loaded.achievementUnlockTimes ?? {};
      GENERATOR_DEFS.forEach(def => {
        if (loaded.generators && loaded.generators[def.id]) {
          const saved = loaded.generators[def.id];
          state.generators[def.id] = {
            level: saved.level ?? saved.count ?? 0,
            mult: saved.mult ?? 1,
          };
        }
      });
    }
  } catch (err) {
    console.log("セーブデータが見つかりませんでした（初回起動）");
  }
  renderAll();
}

function showSaveStatus(msg) {
  saveStatus.textContent = msg;
  setTimeout(() => { saveStatus.textContent = ""; }, 2000);
}

document.getElementById("saveBtn").addEventListener("click", () => saveGame(false));

document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm("本当にデータをリセットしますか？この操作は取り消せません。")) return;
  state.notesCount = 0;
  state.totalNotesCount = 0;
  state.clickCount = 0;
  state.playTimeSeconds = 0;
  state.perClick = 1;
  state.clickMult = 1;
  state.globalMult = 1;
  state.upgradesOwned = [];
  state.achievementsUnlocked = [];
  state.achievementUnlockTimes = {};
  GENERATOR_DEFS.forEach(def => {
    state.generators[def.id] = { level: 0, mult: 1 };
  });
  await saveGame(true);
  renderAll();
  showSaveStatus("リセットしました");
});

setInterval(() => saveGame(true), 30000);

loadGame();
