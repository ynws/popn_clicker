/* =========================================================
   shop.js
   ---------------------------------------------------------
   購買部での「購入」操作を扱う。
   ========================================================= */

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
