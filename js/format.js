/* =========================================================
   format.js
   ---------------------------------------------------------
   画面表示用の文字列フォーマット関数をまとめたファイル。
   状態（state）には触れず、純粋に「数値 → 表示用文字列」の
   変換だけを行うユーティリティ群。
   ========================================================= */

function formatNumber(n) {
  if (n < 10000) {
    if (Number.isInteger(n)) return n.toString();
    return (Math.round(n * 100) / 100).toString();
  }
  const units = ["万", "億", "兆", "京"];
  let unitIndex = -1;
  while (n >= 10000 && unitIndex < units.length - 1) {
    n /= 10000;
    unitIndex++;
  }
  return n.toFixed(2) + units[unitIndex];
}

function formatPlayTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}時間${m}分${s}秒`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

function formatPaybackTime(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  return formatPlayTime(Math.ceil(seconds));
}
