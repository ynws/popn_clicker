/* =========================================================
   dom.js
   ---------------------------------------------------------
   index.html 上の要素への参照をまとめて取得しておくファイル。
   他のファイルはここで定義した変数を通してDOM要素にアクセスする。

   index.html の <body> 末尾で読み込まれる前提のため、
   ここに書いた時点で対象の要素は必ず存在している。
   ========================================================= */

const countDisplay = document.getElementById("countDisplay");
const perClickDisplay = document.getElementById("perClickDisplay");
const cpsDisplay = document.getElementById("cpsDisplay");
const generatorList = document.getElementById("generatorList");
const upgradeList = document.getElementById("upgradeList");
const shopPanel = document.getElementById("shopPanel");
const statsPanel = document.getElementById("statsPanel");
const saveStatus = document.getElementById("saveStatus");
const statClickCount = document.getElementById("statClickCount");
const statTotalEarned = document.getElementById("statTotalEarned");
const statPlayTime = document.getElementById("statPlayTime");
const statGeneratorTotal = document.getElementById("statGeneratorTotal");
const ownedUpgradeList = document.getElementById("ownedUpgradeList");
const achievementList = document.getElementById("achievementList");
const achievementBonusText = document.getElementById("achievementBonusText");
const achievementToastContainer = document.getElementById("achievementToastContainer");
const itemTooltip = document.getElementById("itemTooltip");

const popkunBtn = document.getElementById("popkunBtn");
const clickArea = document.getElementById("clickArea");
