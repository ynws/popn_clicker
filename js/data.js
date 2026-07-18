/* =========================================================
   pop'n music風ポップ君クリッカー ゲーム用データ
   ---------------------------------------------------------
   ここには状態（state）は一切持たず、静的な定義だけを置く。
 
   ・GENERATOR_DEFS   : キャラクター（放置生産）の定義一覧
   ・UPGRADE_DEFS      : 強化（購入するとクリック/生産を増やす）の定義一覧
   ・ACHIEVEMENT_DEFS  : 実績の定義一覧
 
   他のファイルからはこれらの配列を読み取り専用で参照する。
   ========================================================= */

const GENERATOR_DEFS = [
  { id:"g1", name:"ミミ", iconSrc:"icon/mimi.png", desc:"ミミちゃんが応援してくれるよ", baseCost:12, growth:1.13, cps:0.12, unlock:[] },
  { id:"g2", name:"ニャミ", iconSrc:"icon/nyami.png", desc:"ニャミちゃんが一緒にノーツを増やしてくれるよ", baseCost:100, growth:1.14, cps:1, unlock:[ {type:"generatorLevel",target:"g1",value:5} ] },
  { id:"g3", name:"ポエット", iconSrc:"icon/poet.png", desc:"ポエットちゃんが成長しながらお手伝いしてくれるよ", baseCost:1000, growth:1.14, cps:7, unlock:[ {type:"generatorLevel",target:"g2",value:5} ] },
  { id:"g4", name:"ちぇるみん", iconSrc:"icon/chermin.png", desc:"ちぇるみんが見守ってくれるよ。だからやさしく見守ってあげてね", baseCost:12000, growth:1.14, cps:50, unlock:[ {type:"generatorLevel",target:"g3",value:5} ] },
  { id:"g5", name:"スペース🪐マコ", iconSrc:"icon/mako.png", desc:"マコちゃんが魔法の力でサポートしてくれるよ", baseCost:140000, growth:1.14, cps:400, unlock:[ {type:"generatorLevel",target:"g4",value:5} ] },
  { id:"g6", name:"ニア", iconSrc:"icon/nia.png", desc:"ニアちゃんが逃げずに助けてくれるよ", baseCost:1600000, growth:1.14, cps:3000, unlock:[ {type:"generatorLevel",target:"g5",value:5} ] },
  { id:"g7", name:"Σ", iconSrc:"icon/sigma.png", desc:"シグマ様が素数の世界からちょっとだけ手助けしてくれるよ", baseCost: 17999927, growth:1.15, cps:29989, unlock:[ {type:"generatorLevel",target:"g6",value:5} ] },
];

const UPGRADE_DEFS = [
  { id:"click1", name:"ポップ君を叩け～♪", iconSrc: "icon/minipop.png", desc: "クリック獲得量が2倍になるよ！", cost:99, type:"clickMult", value:2, unlock:[ {type:"clickCount",value:50} ] },
  { id:"click2", name:"3・2・1・プーッシュ！", iconSrc: "icon/minipop.png", desc: "クリック獲得量が3倍になるよ！", cost:500, type:"clickMult", value:3, unlock:[ {type:"clickCount",value:300} ] },
  { id:"click3", name:"ゲリラのように落ちてくる", iconSrc: "icon/minipop.png", desc: "全部まとめて ぱぱっと連打。クリック獲得量が4倍になるよ！", cost:4000, type:"clickMult", value:4, unlock:[ {type:"clickCount",value:700} ] },
  { id: "all1", name: "パーティーのはじまり", iconSrc: "icon/minipop.png", desc: "ポップンパーティでみんな大はしゃぎ！全員の能力が2倍になるよ！", cost: 50000, type: "globalMult", value: 2, unlock: [{ type: "totalNotesCount", value: 50000 }] },

  { id:"g1_10", name:"うさぎグッズ", iconSrc: "icon/mimi.png", desc: "お気に入りのグッズを身に着けて、ミミちゃんの能力が3倍になるよ", cost:300, type:"targetMult", target:"g1", value:3, unlock:[ {type:"generatorLevel",target:"g1",value:10} ] },
  { id:"g1_20", name:"丸い蛍光灯", iconSrc: "icon/evamimi.png", desc: "頭につけると無表情になっちゃうけど、ミミちゃんの能力が3倍になるよ", cost:1800, type:"targetMult", target:"g1", value:3, unlock:[ {type:"generatorLevel",target:"g1",value:20} ] },
  { id:"g1_42", name:"風車アンテナ", iconSrc: "icon/syaka.png", desc: "不思議な夢を見たミミちゃん。起きたら能力が10倍になってたよ", cost:20000, type:"targetMult", target:"g1", value:10, unlock:[ {type:"generatorLevel",target:"g1",value:42} ] },

  { id:"g2_10", name:"ジェットコースター", iconSrc: "icon/nyami.png", desc: "スリル満点！ニャミちゃんの能力が2倍になるよ", cost:1500, type:"targetMult", target:"g2", value:2, unlock:[ {type:"generatorLevel",target:"g2",value:10} ] },
  { id:"g2_20", name:"懐中時計", iconSrc: "icon/timer.png", desc: "お気に入りのアイテムでニャミちゃんの能力が3倍になるよ", cost:9000, type:"targetMult", target:"g2", value:3, unlock:[ {type:"generatorLevel",target:"g2",value:20} ] },
  { id:"g2_m30", name:"ミミちゃんの応援", iconSrc: "icon/mimi.png", desc: "ミミちゃんからの応援でニャミちゃんの能力が2倍になるよ", cost:15000, type:"targetMult", target:"g2", value:3, unlock:[ {type:"generatorLevel",target:"g1",value:30} ] },

  { id:"g3_5", name:"大きな安全ピン", iconSrc: "icon/pin.png", desc: "見習い天使の必需品。ポエットちゃんの能力が2倍になるよ", cost:15000, type:"targetMult", target:"g3", value:2, unlock:[ {type:"generatorLevel",target:"g3",value:5} ] },
  { id:"g3_10", name:"魚の一家", iconSrc: "icon/kato.png", desc: "加藤さん一家の協力でポエットちゃんの能力が2倍になるよ", cost:50000, type:"targetMult", target:"g3", value:2, unlock:[ {type:"generatorLevel",target:"g3",value:10} ] },
  { id:"g3_15", name:"シスター服", iconSrc: "icon/sister.png", desc: "不思議な力でポエットちゃんの能力が2倍になるよ", cost:100000, type:"targetMult", target:"g3", value:2, unlock:[ {type:"generatorLevel",target:"g3",value:15} ] },
  { id:"g3_20", name:"金色のラッパ", iconSrc: "icon/trumpet.png", desc: "いつかママみたいな天使に！ポエットちゃんの能力が3倍になるよ", cost:150000, type:"targetMult", target:"g3", value:3, unlock:[ {type:"generatorLevel",target:"g3",value:20} ] },

  { id:"g4_10", name:"あまいおくすり", iconSrc: "icon/candy.png", desc: "真っ暗な夜にとけこんで、ちぇるみんの能力が2倍になるよ", cost:150000, type:"targetMult", target:"g4", value:2, unlock:[ {type:"generatorLevel",target:"g4",value:10} ] },
  { id:"g4_20", name:"まっぷたツートンソウル", iconSrc: "icon/soul.png", desc: "運命の相手が見つかって、ちぇるみんの能力が5倍になるよ", cost:900000, type:"targetMult", target:"g4", value:5, unlock:[ {type:"generatorLevel",target:"g4",value:20} ] },

  { id:"g5_10", name:"テクニカル・マジカル・マイ・コンパクト", iconSrc: "icon/compact.png", desc: "変身アイテムでスペース🪐マコの能力が3倍になるよ", cost:1500000, type:"targetMult", target:"g5", value:3, unlock:[ {type:"generatorLevel",target:"g5",value:10} ] },
  { id:"g5_20", name:"キング様からの応援", iconSrc: "icon/king.png", desc: "憧れの人からの応援でスペース🪐マコの能力が5倍になるよ", cost:9000000, type:"targetMult", target:"g5", value:5, unlock:[ {type:"generatorLevel",target:"g5",value:20} ] },

  { id:"g6_10", name:"コスプレ衣装", iconSrc: "icon/scissors.png", desc: "こっそり着替えてニアちゃんの能力が3倍になるよ", cost:15000000, type:"targetMult", target:"g6", value:3, unlock:[ {type:"generatorLevel",target:"g6",value:10} ] },
  { id:"g6_20", name:"暗くて狭い部屋", iconSrc: "icon/room.png", desc: "落ち着く環境でニアちゃんの能力が6倍になるよ", cost:90000000, type:"targetMult", target:"g6", value:6, unlock:[ {type:"generatorLevel",target:"g6",value:20} ] },

  { id:"g7_7", name:"ネクタル", iconSrc: "icon/nectar.png", desc: "神々のためのお酒。シグマ様の能力が3倍になるよ", cost:150000001, type:"targetMult", target:"g7", value:3, unlock:[ {type:"generatorLevel",target:"g7",value:7} ] },
  { id:"g7_17", name:"シグマ様親衛隊", iconSrc: "icon/lithos.png", desc: "リソスとその仲間の力で、シグマ様の能力が7倍になるよ", cost:900000011, type:"targetMult", target:"g7", value:7, unlock:[ {type:"generatorLevel",target:"g7",value:17} ] },
];

const ACHIEVEMENT_DEFS = [
  { id: "first_click", name: "はじめの一歩", iconSrc: "icon/minipop.png", desc: "はじめてポップ君をクリックする", unlock: [{ type: "clickCount", value: 1 }] },
  { id: "click_100", name: "100コンボ", iconSrc: "icon/minipop.png", desc: "ポップ君を100回クリックする", unlock: [{ type: "clickCount", value: 100 }] },
  { id: "click_1025", name: "準辛ゲージ", iconSrc: "icon/minipop.png", desc: "ポップ君を1025回クリックする", unlock: [{ type: "clickCount", value: 1025 }] },
  { id: "click_1537", name: "これが辛ゲージです", iconSrc: "icon/minipop.png", desc: "ポップ君を1537回クリックする", unlock: [{ type: "clickCount", value: 1537 }] },
  { id: "earn_1000", name: "ポップ君大集合", iconSrc: "icon/minipop.png", desc: "累計で1000ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 1000 }] },
  { id: "earn_6573", name: "トイサイダー村", iconSrc: "icon/minipop.png", desc: "累計で6573ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 6573 }] },
  { id: "earn_50all", name: "Lv50全ノーツ相当", iconSrc: "icon/minipop.png", desc: "(THX 4まで全26譜面)累計で46115ノーツを獲得する", unlock: [{ type: "totalNotesCount", value: 46115 }] },
  { id: "first_upgrade", name: "アップグレード！", iconSrc: "icon/nyami.png", desc: "はじめて強化をする", unlock: [{ type: "upgradesOwnedCount", value: 1 }] },
  { id: "upgrade10", name: "たくさんのアップグレード", iconSrc: "icon/minipop.png", desc: "強化を10個購入する", unlock: [{ type: "upgradesOwnedCount", value: 10 }] },
  { id: "playtime_16min", name: "タイムプレーモード", iconSrc: "icon/minipop.png", desc: "累計16分間プレイする", unlock: [{ type: "playTimeSeconds", value: 960 }] },
  { id: "first_generator", name: "キャラクターご招待", iconSrc: "icon/mimi.png", desc: "はじめてキャラクターを呼ぶ", unlock: [{ type: "generatorLevel", target: "g1", value: 1 }] },
  { id: "mimi_chan", name: "３３ちゃん", iconSrc: "icon/mimi.png", desc: "ミミちゃんのレベルを33にする", unlock: [{ type: "generatorLevel", target: "g1", value: 33 }] },
  { id: "nyami_chan", name: "２８ちゃん", iconSrc: "icon/nyami.png", desc: "ニャミちゃんのレベルを28にする", unlock: [{ type: "generatorLevel", target: "g2", value: 28 }] },
  { id: "angel_poet", name: "立派な天使", iconSrc: "icon/poet.png", desc: "ポエットちゃんのレベルを20にする", unlock: [{ type: "generatorLevel", target: "g3", value: 20 }] },
  { id: "angel_chermin", name: "出身地：天使突抜", iconSrc: "icon/chermin.png", desc: "ちぇるみんのレベルを14にする", unlock: [{ type: "generatorLevel", target: "g4", value: 14 }] },
  { id: "mako_attack", name: "スペース★アタック", iconSrc: "icon/mako.png", desc: "マコちゃんのレベルを15にする", unlock: [{ type: "generatorLevel", target: "g5", value: 15 }] },
  { id: "idol_nia", name: "electro idol nia", iconSrc: "icon/nia.png", desc: "ニアちゃんのレベルを15にする", unlock: [{ type: "generatorLevel", target: "g6", value: 15 }] },
  { id: "first_sigma", name: "素数の世界へ", iconSrc: "icon/sigma.png", desc: "はじめてΣ様を呼ぶ", unlock: [{ type: "generatorLevel", target: "g7", value: 1 }] },
  { id: "end", name: "おしまい", iconSrc: "icon/sigma.png", desc: "今このゲームでできることは大体全部終わったよ。また遊んでね", unlock: [{ type: "generatorLevel", target: "g7", value: 17 }] },
];
