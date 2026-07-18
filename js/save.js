/* =========================================================
   save.js
   ---------------------------------------------------------
   セーブデータの保存・読み込みを扱う。
   window.storage（Claude Artifacts用ストレージ）が使える
   場合はそちらを、なければ window.localStorage を使う。
   ========================================================= */

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
