/* =========================================================
   state.js
   ---------------------------------------------------------
   ゲーム全体の「状態（セーブデータの元になる値）」を持つファイル。
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
