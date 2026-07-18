/* =========================================================
   click.js
   ---------------------------------------------------------
   メインのポップ君ボタンをクリックしたときの処理を扱う。
   ========================================================= */

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
