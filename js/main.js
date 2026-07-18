/* =========================================================
   pop'n music風ポップ君クリッカー ロジック部分
   ========================================================= */

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
    return `<div class="tooltip-row tooltip-efficiency"><span>⏱ コスト回収時間</span><span>—</span></div>`;
  }
  const paybackSeconds = cost / diff;
  return `<div class="tooltip-row tooltip-efficiency"><span>⏱ コスト回収時間</span><span>${formatPaybackTime(paybackSeconds)}</span></div>`;
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
    <div class="tooltip-title">${def.name} (Lv.${g.level} → Lv.${g.level + 1})</div>
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
    <div class="tooltip-title">${def.name}</div>
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
