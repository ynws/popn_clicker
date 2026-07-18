/* =========================================================
   tooltip.js
   ---------------------------------------------------------
   購買部の各アイテムにマウスを乗せたときに出る
   「獲得プレビュー用ツールチップ」を管理するファイル。

   PC（hoverが使える環境）ではマウス座標の近くに表示するが、
   スマホ等（hoverが使えないタッチ環境）ではカーソル追従が
   できないため、画面最下部にシート状で固定表示する。
   表示位置の切り替えは isTouchLayout() の判定で行い、
   実際の見た目の違いは styles.css の @media (hover: none) 側で
   まとめて調整している。
   ========================================================= */

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

function isTouchLayout() {
  return window.matchMedia("(hover: none)").matches;
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
  itemTooltip.innerHTML = generatorTooltipHtml(def) + closeButtonHtml();
  itemTooltip.style.display = "block";
  if (isTouchLayout()) return; // 画面最下部に固定表示するのでCSSに任せる
  positionTooltip(x, y);
}

function showUpgradeTooltip(def, x, y) {
  hoveredTooltip = { kind: "upgrade", def, x, y };
  itemTooltip.innerHTML = upgradeTooltipHtml(def) + closeButtonHtml();
  itemTooltip.style.display = "block";
  if (isTouchLayout()) return;
  positionTooltip(x, y);
}

function closeButtonHtml() {
  if (!isTouchLayout()) return "";
  return `<button class="tooltip-close" type="button" onclick="hideItemTooltip()" aria-label="閉じる">✕</button>`;
}

function hideItemTooltip() {
  hoveredTooltip = null;
  itemTooltip.innerHTML = "";
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

// タッチ操作時：ツールチップやアイテム以外をタップしたら閉じる
document.addEventListener("click", (e) => {
  if (!isTouchLayout() || !hoveredTooltip) return;
  if (e.target.closest(".item") || e.target.closest(".item-tooltip")) return;
  hideItemTooltip();
});
