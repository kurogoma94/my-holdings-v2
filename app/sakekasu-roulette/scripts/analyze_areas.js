/**
 * エリア分布分析スクリプト
 * - 現在のエリア分類の分布を確認
 * - "other" に分類されている店舗のGoogle Maps URLから住所ヒントを抽出
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

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
  const numMatch = trimmed.match(/^"(\w+)":\s*(\d+(?:\.\d+)?)[,]?$/);
  if (numMatch) currentShop[numMatch[1]] = parseFloat(numMatch[2]);
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) currentShop[boolMatch[1]] = boolMatch[2] === 'true';
}

// 1. エリア分布
const areaCounts = {};
shops.forEach(s => { areaCounts[s.area] = (areaCounts[s.area] || 0) + 1; });
console.log('=== エリア分布 ===');
Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k.padEnd(20)} ${String(v).padStart(4)}件`);
});

const activeShops = shops.filter(s => s.isActive);
const otherShops = activeShops.filter(s => s.area === 'other');
console.log(`\n合計: ${shops.length}件 / アクティブ: ${activeShops.length}件`);
console.log(`"other" に分類: ${otherShops.length}件 (${(otherShops.length / activeShops.length * 100).toFixed(1)}%)`);

// 2. "other"の店舗名からエリアヒントを検出
console.log('\n=== "other" 店舗のエリア推定候補 ===');

const AREA_KEYWORDS = {
  'umeda': ['梅田', '北新地', 'グランフロント', 'ルクア', 'ヨドバシ', '中津', '茶屋町', '曽根崎'],
  'fukushima': ['福島'],
  'shinsaibashi': ['心斎橋', '堀江', '南船場', 'アメ村', 'アメリカ村'],
  'namba': ['難波', 'なんば', 'ナンバ', '道頓堀', '千日前', '日本橋', '法善寺'],
  'tenma': ['天満', '天神橋', '天六', '南森町', '扇町'],
  'tsuruhashi': ['鶴橋', '桃谷', '今里', '玉造'],
  'shinsekai': ['新世界', '西成', '動物園前', 'ジャンジャン', '恵美須'],
  'kyobashi': ['京橋'],
  'abeno': ['阿倍野', '天王寺', 'あべの', 'ハルカス'],
  'kitahama': ['北浜', '淀屋橋', '本町', '堺筋本町'],
  'nishinakajima': ['西中島', '新大阪', '十三'],
  'hokusetsu': ['茨木', '高槻', '吹田', '箕面', '豊中', '池田', '江坂'],
  'higashiosaka': ['東大阪', '布施', '花園', '八尾', '枚方', '寝屋川', '守口', '門真', '大東'],
  'senshu': ['堺', '泉州', '岸和田', '和泉', '河内長野', '富田林'],
  'osakacity-other': ['都島', '旭', '城東', '鶴見', '住之江', '住吉', '平野', '東住吉', '此花', '港', '大正', '西淀川', '東淀川', '淀川'],
};

let estimatable = 0;
const estimations = [];

otherShops.forEach(s => {
  const text = `${s.name} ${s.comment || ''}`;
  
  for (const [areaCode, keywords] of Object.entries(AREA_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        estimations.push({
          id: s.id,
          name: s.name,
          currentArea: s.area,
          suggestedArea: areaCode,
          matchedKeyword: kw,
          source: 'name/comment',
        });
        estimatable++;
        return; // 最初のマッチで打ち切り
      }
    }
  }
});

console.log(`\nキーワードマッチで推定可能: ${estimatable}件 / ${otherShops.length}件\n`);

// エリア別に推定結果をグループ化
const byArea = {};
estimations.forEach(e => {
  if (!byArea[e.suggestedArea]) byArea[e.suggestedArea] = [];
  byArea[e.suggestedArea].push(e);
});

Object.entries(byArea).sort((a, b) => b[1].length - a[1].length).forEach(([area, items]) => {
  console.log(`\n📍 ${area} (${items.length}件):`);
  items.forEach(e => {
    console.log(`  ID:${e.id.padStart(3)} ${e.name.substring(0, 35).padEnd(36)} [matched: "${e.matchedKeyword}"]`);
  });
});

// 3. 残りの"other"（推定不能）
const unmatched = otherShops.filter(s => !estimations.find(e => e.id === s.id));
console.log(`\n=== 推定不能な "other" 店舗: ${unmatched.length}件 ===`);
console.log('（店名・コメントにエリアキーワードが含まれない）');
unmatched.slice(0, 20).forEach(s => {
  console.log(`  ID:${s.id.padStart(3)} ${s.name.substring(0, 40)}`);
});
if (unmatched.length > 20) console.log(`  ... 他 ${unmatched.length - 20}件`);
