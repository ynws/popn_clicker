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
  { id: "pop-kun", name: "ポップ君", icon: "🎵", iconSrc: "assets/characters/pop-kun.svg", desc: "ノーツを1つ増やしてくれる", baseCost: 15, growth: 1.15, cps: 0.1, unlock: [] },
  { id: "mimi", name: "ミミちゃん", icon: "🌈", iconSrc: "assets/characters/mimi.svg", desc: "キラキラな声援でノーツを増やす", baseCost: 100, growth: 1.15, cps: 1, unlock: [{ type: "generatorLevel", target: "pop-kun", value: 1 }] },
  { id: "riki", name: "リキ", icon: "⚡", iconSrc: "assets/characters/riki.svg", desc: "ビートに乗ってノーツを加速する", baseCost: 1100, growth: 1.15, cps: 8, unlock: [{ type: "generatorLevel", target: "mimi", value: 1 }] },
  { id: "nora", name: "ノラ", icon: "✨", iconSrc: "assets/characters/nora.svg", desc: "ネオンのステージでノーツを招集する", baseCost: 12000, growth: 1.15, cps: 47, unlock: [{ type: "generatorLevel", target: "riki", value: 1 }] },
  { id: "bomi", name: "ボミ", icon: "🎤", iconSrc: "assets/characters/bomi.svg", desc: "大音量のコールでノーツを巻き込む", baseCost: 130000, growth: 1.15, cps: 260, unlock: [{ type: "generatorLevel", target: "nora", value: 1 }] },
];

const UPGRADE_DEFS = [
  { id: "beat-boost", name: "ビートブースト", icon: "💥", iconSrc: "assets/characters/pop-kun.svg", desc: "クリック獲得量が2倍になる", cost: 100, type: "clickMult", value: 2, unlock: [{ type: "totalNotesCount", value: 50 }] },
  { id: "stage-up", name: "ステージアップ", icon: "🚀", iconSrc: "assets/characters/mimi.svg", desc: "ポップ君のレベルが2倍になる", cost: 200, type: "targetMult", target: "pop-kun", value: 2, unlock: [{ type: "generatorLevel", target: "pop-kun", value: 5 }] },
  { id: "groove", name: "グルーヴ強化", icon: "🎶", iconSrc: "assets/characters/riki.svg", desc: "ミミちゃんの生産量が2倍になる", cost: 1000, type: "targetMult", target: "mimi", value: 2, unlock: [{ type: "generatorLevel", target: "mimi", value: 5 }] },
  { id: "party-mode", name: "パーティーモード", icon: "🎉", iconSrc: "assets/characters/nora.svg", desc: "全キャラクターの生産量が2倍になる", cost: 50000, type: "globalMult", value: 2, unlock: [{ type: "totalNotesCount", value: 10000 }] },
  { id: "combo-master", name: "コンボマスター", icon: "🖱️", iconSrc: "assets/characters/bomi.svg", desc: "クリック獲得量がさらに2倍になる", cost: 500, type: "clickMult", value: 2, unlock: [{ type: "clickCount", value: 100 }] },
];

const ACHIEVEMENT_DEFS = [
  { id: "first_click", name: "はじめての一拍", icon: "👆", iconSrc: "assets/characters/pop-kun.svg", desc: "はじめてポップ君をクリックしてノーツを獲得する", unlock: [{ type: "clickCount", value: 1 }] },
  { id: "click_100", name: "100コンボ", icon: "🖱️", iconSrc: "assets/characters/mimi.svg", desc: "ポップ君を100回クリックしてノーツを集める", unlock: [{ type: "clickCount", value: 100 }] },
  { id: "earn_1000", name: "ポップ君大集合", icon: "🎵", iconSrc: "assets/characters/riki.svg", desc: "累計で1,000ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 1000 }] },
  { id: "first_generator", name: "キャラクター参戦", icon: "🌈", iconSrc: "assets/characters/mimi.svg", desc: "はじめてキャラクターを呼んでノーツを増やす", unlock: [{ type: "generatorLevel", target: "pop-kun", value: 1 }] },
  { id: "first_upgrade", name: "レベルアップの予感", icon: "✨", iconSrc: "assets/characters/nora.svg", desc: "はじめてキャラクターを強化してノーツを増やす", unlock: [{ type: "upgradesOwnedCount", value: 1 }] },
  { id: "playtime_10min", name: "ステージ長時間", icon: "⏰", iconSrc: "assets/characters/bomi.svg", desc: "累計10分間プレイする", unlock: [{ type: "playTimeSeconds", value: 600 }] },
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
};

function earnNotes(amount) {
  state.notesCount += amount;
  state.totalNotesCount += amount;
}

GENERATOR_DEFS.forEach(g => {
  state.generators[g.id] = { level: 0, mult: 1 };
});

function formatNumber(n) {
  if (n < 1000) {
    if (Number.isInteger(n)) return n.toString();
    return (Math.round(n * 100) / 100).toString();
  }
  const units = ["K", "M", "B", "T", "Qa", "Qi"];
  let unitIndex = -1;
  while (n >= 1000 && unitIndex < units.length - 1) {
    n /= 1000;
    unitIndex++;
  }
  return n.toFixed(2) + units[unitIndex];
}

function generatorCost(def, level) {
  return Math.ceil(def.baseCost * Math.pow(def.growth, level));
}

function totalCps() {
  let total = 0;
  GENERATOR_DEFS.forEach(def => {
    const g = state.generators[def.id];
    total += def.cps * g.level * g.mult;
  });
  return total * state.globalMult;
}

function perClickValue() {
  return state.perClick * state.clickMult;
}

function isUnlocked(unlockConditions) {
  if (!unlockConditions || unlockConditions.length === 0) return true;
  return unlockConditions.every(cond => {
    if (cond.type === "totalNotesCount" || cond.type === "totalPopkunNotes") {
      return state.totalNotesCount >= cond.value;
    }
    if (cond.type === "currentNotes") {
      return state.notesCount >= cond.value;
    }
    if (cond.type === "generatorLevel" || cond.type === "generatorCount") {
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
const achievementToastContainer = document.getElementById("achievementToastContainer");

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
    generatorList.innerHTML = "";
    visibleDefs.forEach(def => {
      const el = document.createElement("div");
      el.className = "item";
      el.dataset.id = def.id;
      el.innerHTML = `
        <div class="item-icon">${def.iconSrc ? `<img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}">` : def.icon}</div>
        <div class="item-main">
          <div class="item-name"><span class="name-text">${def.name}</span><span class="owned-badge"></span></div>
          <div class="item-desc"></div>
        </div>
        <div class="item-cost"></div>
      `;
      el.addEventListener("click", () => buyGenerator(def));
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
    upgradeList.innerHTML = "";

    if (visibleDefs.length === 0 && lockedCount === 0) {
      upgradeList.innerHTML = `<div class="item-desc" style="text-align:center;padding:12px;">強化可能なキャラクターはいません</div>`;
    } else {
      visibleDefs.forEach(def => {
        const el = document.createElement("div");
        el.className = "item";
        el.dataset.id = def.id;
        el.innerHTML = `
          <div class="item-icon">${def.iconSrc ? `<img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}">` : def.icon}</div>
          <div class="item-main">
            <div class="item-name">${def.name}</div>
            <div class="item-desc">${def.desc}</div>
          </div>
          <div class="item-cost">${formatNumber(def.cost)}</div>
        `;
        el.addEventListener("click", () => buyUpgrade(def));
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
        <div class="item-icon">${def.iconSrc ? `<img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}">` : def.icon}</div>
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

  if (unlockedCount === 0) {
    achievementList.innerHTML = `<div class="item owned-summary">まだ解除した実績はありません</div>`;
  } else {
    state.achievementsUnlocked.forEach(id => {
      const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
      if (!def) return;
      const el = document.createElement("div");
      el.className = "achievement-row";
      el.innerHTML = `
        <div class="item-icon">${def.iconSrc ? `<img class="item-icon-image" src="${def.iconSrc}" alt="${def.name}">` : def.icon}</div>
        <div class="item-main">
          <div class="item-name">${def.name}</div>
          <div class="item-desc">${def.desc}</div>
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
      announceAchievement(def);
    }
  });
}

function announceAchievement(def) {
  const el = document.createElement("div");
  el.className = "achievement-toast";
  el.innerHTML = `
    <div class="toast-icon">${def.icon}</div>
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
  GENERATOR_DEFS.forEach(def => {
    state.generators[def.id] = { level: 0, mult: 1 };
  });
  await saveGame(true);
  renderAll();
  showSaveStatus("リセットしました");
});

setInterval(() => saveGame(true), 30000);

loadGame();
