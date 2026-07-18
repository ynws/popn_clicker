/* =========================================================
   unlock.js
   ---------------------------------------------------------
   キャラクター・強化・実績などの「解放条件」を判定するファイル。
   ========================================================= */

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
