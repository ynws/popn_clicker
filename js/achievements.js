/* =========================================================
   achievements.js
   ---------------------------------------------------------
   実績の解除判定と、解除時のトースト通知を扱う。
   ========================================================= */

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
