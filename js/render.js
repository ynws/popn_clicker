/* =========================================================
   render.js
   ---------------------------------------------------------
   state（現在の状態）をもとに、画面表示を更新するファイル。

   ・renderTopBar()      : 所持ノーツ・クリック獲得量・毎秒獲得量の表示
   ・renderGenerators()  : 購買部「キャラクター」一覧の表示
   ・renderUpgrades()    : 購買部「強化」一覧の表示
   ・renderStats()       : 「記録」タブの統計情報の表示
   ・renderAchievements(): 「記録」タブの実績一覧の表示
   ・renderAll()         : 上記すべて＋実績チェックをまとめて実行する
                           （ゲームループやボタン操作の後に毎回呼ばれる）
   ========================================================= */

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
      el.addEventListener("click", (e) => {
        buyGenerator(def);
        if (isTouchLayout()) showGeneratorTooltip(def, e.clientX, e.clientY);
      });
      // タッチ環境ではタップ後にブラウザが互換用のmouseenter/mousemove/mouseleaveを
      // 発生させることがあり、これに反応するとタップ直後にツールチップが
      // 閉じてしまう（＝その場所が反応しないように見える）ため、
      // これらはhoverが使える環境（PC）でのみ有効にする。
      el.addEventListener("mouseenter", (e) => { if (!isTouchLayout()) showGeneratorTooltip(def, e.clientX, e.clientY); });
      el.addEventListener("mousemove", (e) => { if (!isTouchLayout()) showGeneratorTooltip(def, e.clientX, e.clientY); });
      el.addEventListener("mouseleave", () => { if (!isTouchLayout()) hideItemTooltip(); });
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
        el.addEventListener("click", (e) => {
          buyUpgrade(def);
          if (isTouchLayout()) showUpgradeTooltip(def, e.clientX, e.clientY);
        });
        // generator側と同様、タッチ環境ではhoverリスナーを無効化する
        el.addEventListener("mouseenter", (e) => { if (!isTouchLayout()) showUpgradeTooltip(def, e.clientX, e.clientY); });
        el.addEventListener("mousemove", (e) => { if (!isTouchLayout()) showUpgradeTooltip(def, e.clientX, e.clientY); });
        el.addEventListener("mouseleave", () => { if (!isTouchLayout()) hideItemTooltip(); });
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

function renderStats() {
  statClickCount.textContent = formatNumber(state.clickCount) + " 回";
  statTotalEarned.textContent = formatNumber(state.totalNotesCount) + " ノーツ";
  statPlayTime.textContent = formatPlayTime(state.playTimeSeconds);
  const generatorTotal = GENERATOR_DEFS.reduce((sum, def) => sum + state.generators[def.id].level, 0);
  statGeneratorTotal.textContent = formatNumber(generatorTotal);

  const upgradeRate = UPGRADE_DEFS.length > 0
    ? Math.round((state.upgradesOwned.length / UPGRADE_DEFS.length) * 100)
    : 0;
  upgradeSectionRate.textContent = `${upgradeRate}%取得済み`;

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

  const achievementRate = ACHIEVEMENT_DEFS.length > 0
    ? Math.round((unlockedCount / ACHIEVEMENT_DEFS.length) * 100)
    : 0;
  achievementSectionRate.textContent = `${achievementRate}%取得済み`;

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

function renderAll() {
  checkAchievements();
  renderTopBar();
  renderGenerators();
  renderUpgrades();
  renderStats();
  renderAchievements();
  refreshItemTooltip();
}
