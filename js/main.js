/* =========================================================
   main.js
   ---------------------------------------------------------
   ゲーム起動時のイベント登録と、定期実行される
   ゲームループをまとめたファイル。
   他の js/*.js が全部読み込まれた後、一番最後に実行される。

   ・タブ切り替え（購買部 ⇔ 記録）のイベント登録
   ・保存ボタン／リセットボタンのイベント登録
   ・毎秒のプレイ時間加算＆放置生産（cps）の反映ループ
   ・30秒ごとの自動セーブ
   ・起動時のセーブデータ読み込み（loadGame）
   ========================================================= */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    shopPanel.style.display = tab === "shop" ? "block" : "none";
    statsPanel.style.display = tab === "stats" ? "block" : "none";
  });
});

document.getElementById("saveBtn").addEventListener("click", () => saveGame(false));

// 記録タブ内の「強化一覧」「実績」セクションの折りたたみ
document.querySelectorAll(".section-label.collapsible").forEach(header => {
  const target = document.getElementById(header.dataset.target);
  if (!target) return;
  header.addEventListener("click", () => {
    const collapsed = header.classList.toggle("collapsed");
    target.classList.toggle("collapsed", collapsed);
  });
});


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

setInterval(() => {
  state.playTimeSeconds += 1;
  const cps = totalCps();
  if (cps > 0) {
    earnNotes(cps);
  }
  renderAll();
}, 1000);

setInterval(() => saveGame(true), 30000);

loadGame();
