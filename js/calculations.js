/* =========================================================
   calculations.js
   ---------------------------------------------------------
   ゲームバランスに関わる計算ロジックをまとめたファイル。
   ========================================================= */

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
