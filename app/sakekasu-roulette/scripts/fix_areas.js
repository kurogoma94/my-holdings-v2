/**
 * エリア自動分類スクリプト
 * - 店名・コメントのキーワードマッチでエリアを再分類
 * - 誤検出を防ぐ除外パターン付き
 * - dry-run モードで確認してから適用
 */
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// エリア判定ルール（優先度順）
// exclude: このキーワードが含まれる場合はスキップ（誤検出防止）
const AREA_RULES = [
  // 梅田エリア
  { area: 'umeda', match: '梅田', exclude: [] },
  { area: 'umeda', match: '北新地', exclude: [] },
  { area: 'umeda', match: 'グランフロント', exclude: [] },
  { area: 'umeda', match: 'ルクア', exclude: [] },
  { area: 'umeda', match: '中津', exclude: ['中津川', '中津留'] },
  { area: 'umeda', match: '茶屋町', exclude: [] },
  { area: 'umeda', match: '曽根崎', exclude: [] },
  { area: 'umeda', match: '兎我野', exclude: [] },

  // 福島
  { area: 'fukushima', match: '福島', exclude: ['福島県'] },

  // 心斎橋・堀江
  { area: 'shinsaibashi', match: '心斎橋', exclude: [] },
  { area: 'shinsaibashi', match: '堀江', exclude: ['京町堀'] }, // 京町堀は西区
  { area: 'shinsaibashi', match: '南船場', exclude: [] },
  { area: 'shinsaibashi', match: 'アメリカ村', exclude: [] },
  { area: 'shinsaibashi', match: 'アメ村', exclude: [] },

  // 難波
  { area: 'namba', match: '難波', exclude: [] },
  { area: 'namba', match: 'なんば', exclude: [] },
  { area: 'namba', match: '道頓堀', exclude: [] },
  { area: 'namba', match: '千日前', exclude: [] },
  { area: 'namba', match: '日本橋', exclude: [] },
  { area: 'namba', match: '法善寺', exclude: [] },
  // 注意: 「ナンバ」は「ナンバー」と区別が難しいのでスキップ

  // 天満・天神橋筋
  { area: 'tenma', match: '天満', exclude: ['天満宮'] }, // 天満宮は正確には天満エリアだが独自に後処理
  { area: 'tenma', match: '天神橋', exclude: [] },
  { area: 'tenma', match: '天六', exclude: [] },
  { area: 'tenma', match: '南森町', exclude: [] },
  { area: 'tenma', match: '扇町', exclude: [] },
  // 天満宮も天満エリアに含める
  { area: 'tenma', match: '天満宮', exclude: [] },

  // 鶴橋・桃谷
  { area: 'tsuruhashi', match: '鶴橋', exclude: [] },
  { area: 'tsuruhashi', match: '桃谷', exclude: [] },
  { area: 'tsuruhashi', match: '今里', exclude: [] },
  { area: 'tsuruhashi', match: '玉造', exclude: [] },

  // 新世界・西成
  { area: 'shinsekai', match: '新世界', exclude: [] },
  { area: 'shinsekai', match: '西成', exclude: [] },
  { area: 'shinsekai', match: '動物園前', exclude: [] },
  { area: 'shinsekai', match: 'ジャンジャン', exclude: [] },
  { area: 'shinsekai', match: '恵美須', exclude: [] },

  // 京橋
  { area: 'kyobashi', match: '京橋', exclude: [] },

  // 阿倍野・天王寺
  { area: 'abeno', match: '阿倍野', exclude: [] },
  { area: 'abeno', match: '天王寺', exclude: [] },
  { area: 'abeno', match: 'あべの', exclude: [] },
  { area: 'abeno', match: 'ハルカス', exclude: [] },

  // 北浜・淀屋橋
  { area: 'kitahama', match: '北浜', exclude: [] },
  { area: 'kitahama', match: '淀屋橋', exclude: [] },
  { area: 'kitahama', match: '本町', exclude: ['本店', '本町通', '本町筋'] },

  // 西中島・新大阪
  { area: 'nishinakajima', match: '西中島', exclude: [] },
  { area: 'nishinakajima', match: '新大阪', exclude: [] },
  { area: 'nishinakajima', match: '十三', exclude: [] },

  // 北摂エリア
  { area: 'hokusetsu', match: '茨木', exclude: [] },
  { area: 'hokusetsu', match: '高槻', exclude: [] },
  { area: 'hokusetsu', match: '吹田', exclude: [] },
  { area: 'hokusetsu', match: '箕面', exclude: [] },
  { area: 'hokusetsu', match: '豊中', exclude: [] },
  { area: 'hokusetsu', match: '池田', exclude: ['池田銀なべ 北新地'] }, // 北新地の店は umeda
  { area: 'hokusetsu', match: '江坂', exclude: [] },

  // 東大阪・京阪エリア
  { area: 'higashiosaka', match: '東大阪', exclude: [] },
  { area: 'higashiosaka', match: '布施', exclude: [] },
  { area: 'higashiosaka', match: '花園', exclude: [] },
  { area: 'higashiosaka', match: '八尾', exclude: [] },
  { area: 'higashiosaka', match: '枚方', exclude: [] },
  { area: 'higashiosaka', match: '寝屋川', exclude: [] },
  { area: 'higashiosaka', match: '守口', exclude: [] },
  { area: 'higashiosaka', match: '門真', exclude: [] },
  { area: 'higashiosaka', match: '大東', exclude: [] },

  // 堺・泉州
  { area: 'senshu', match: '岸和田', exclude: [] },
  { area: 'senshu', match: '和泉', exclude: [] },
  // 注意: 「堺」は「堺筋」を除外
  { area: 'senshu', match: '堺', exclude: ['堺筋', '堺本町'] },

  // 大阪市内その他
  { area: 'osakacity-other', match: '都島', exclude: [] },
  { area: 'osakacity-other', match: '城東', exclude: [] },
  { area: 'osakacity-other', match: '鶴見', exclude: [] },
  { area: 'osakacity-other', match: '住之江', exclude: [] },
  { area: 'osakacity-other', match: '住吉', exclude: ['住吉大社'] },
  { area: 'osakacity-other', match: '平野', exclude: [] },
  { area: 'osakacity-other', match: '東住吉', exclude: [] },
  { area: 'osakacity-other', match: '此花', exclude: [] },
  { area: 'osakacity-other', match: '大正', exclude: ['大正五年', '大正時代', '大正元年'] },
  { area: 'osakacity-other', match: '西淀川', exclude: [] },
  { area: 'osakacity-other', match: '東淀川', exclude: [] },
  { area: 'osakacity-other', match: '淀川', exclude: ['西淀川', '東淀川', '西中島'] },
  { area: 'osakacity-other', match: '関目', exclude: [] },
];

// 手動除外リスト（分析で見つけた誤検出）
const MANUAL_EXCLUSIONS = {
  '211': true,  // 香港飲茶 星街 → 「港」でマッチするが香港であり大阪市港区ではない
  '268': true,  // n°29（ナンバーニーキュー)→ 「ナンバ」でマッチするがnumberの意味
  '453': true,  // パンとエスプレッソと堺筋俱楽部 → 「堺」でマッチするが堺筋は中央区
};

// Parse shops
const shops = [];
let currentShop = {};
let inShop = false;
const lines = content.split('\n');

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed === '{') { inShop = true; currentShop = {}; continue; }
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) shops.push({ ...currentShop });
    inShop = false; continue;
  }
  if (!inShop) continue;
  const strMatch = trimmed.match(/^"(\w+)":\s*"([^"]*)"[,]?$/);
  if (strMatch) currentShop[strMatch[1]] = strMatch[2];
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) currentShop[boolMatch[1]] = boolMatch[2] === 'true';
}

// エリア分類実行
const changes = [];

shops.forEach(s => {
  if (s.area !== 'other') return;  // otherのみ対象
  if (!s.isActive) return;         // アクティブのみ
  if (MANUAL_EXCLUSIONS[s.id]) return; // 手動除外

  const text = `${s.name} ${s.comment || ''}`;

  for (const rule of AREA_RULES) {
    if (!text.includes(rule.match)) continue;
    
    // 除外パターンチェック
    const excluded = rule.exclude.some(ex => text.includes(ex));
    if (excluded) continue;

    changes.push({
      id: s.id,
      name: s.name,
      from: s.area,
      to: rule.area,
      keyword: rule.match,
    });
    return; // 最初のマッチで確定
  }
});

console.log(`=== エリア自動分類 ${DRY_RUN ? '(DRY RUN)' : '実行'} ===`);
console.log(`対象: ${changes.length}件\n`);

// エリア別にグループ化して表示
const byArea = {};
changes.forEach(c => {
  if (!byArea[c.to]) byArea[c.to] = [];
  byArea[c.to].push(c);
});

Object.entries(byArea).sort((a, b) => b[1].length - a[1].length).forEach(([area, items]) => {
  console.log(`📍 → ${area} (${items.length}件):`);
  items.forEach(c => {
    console.log(`  ID:${c.id.padStart(3)} ${c.name.substring(0, 38).padEnd(39)} [${c.keyword}]`);
  });
  console.log('');
});

if (DRY_RUN) {
  console.log('>>> --dry-run モードのため変更は適用されません');
  console.log('>>> 適用するには --dry-run フラグを外して再実行してください');
  process.exit(0);
}

// 変更を適用
let updatedContent = content;
let appliedCount = 0;

changes.forEach(c => {
  // "id": "XXX" の次の行にある "area": "other" を置換
  // IDの前後のコンテキストで正確にマッチ
  const idPattern = `"id": "${c.id}"`;
  const idx = updatedContent.indexOf(idPattern);
  if (idx === -1) {
    console.log(`⚠️ ID:${c.id} not found, skipping`);
    return;
  }

  // idの位置から近い "area": "other" を探す
  const searchFrom = idx;
  const searchRegion = updatedContent.substring(searchFrom, searchFrom + 300);
  const areaMatch = searchRegion.match(/"area": "other"/);
  
  if (!areaMatch) {
    console.log(`⚠️ ID:${c.id} area not found or already changed`);
    return;
  }

  const areaPos = searchFrom + areaMatch.index;
  updatedContent = updatedContent.substring(0, areaPos) 
    + `"area": "${c.to}"`
    + updatedContent.substring(areaPos + areaMatch[0].length);
  appliedCount++;
});

// タイムスタンプ更新
const now = new Date().toISOString();
updatedContent = updatedContent.replace(
  /MOCK_DATA_UPDATED_AT = '[^']+'/,
  `MOCK_DATA_UPDATED_AT = '${now}'`
);

fs.writeFileSync(mockDataPath, updatedContent, 'utf-8');

console.log(`\n✅ ${appliedCount}件のエリアを更新しました`);
console.log(`タイムスタンプ: ${now}`);

// 検証
const verify = fs.readFileSync(mockDataPath, 'utf-8');
const otherCount = (verify.match(/"area": "other"/g) || []).length;
const totalIds = (verify.match(/"id":/g) || []).length;
console.log(`\n=== 検証 ===`);
console.log(`全店舗: ${totalIds}`);
console.log(`other残数: ${otherCount} (${(otherCount/totalIds*100).toFixed(1)}%)`);
