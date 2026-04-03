const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

const shops = [];
let currentShop = {};
let inShop = false;

const lines = content.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed === '{') { inShop = true; currentShop = {}; continue; }
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) shops.push({ ...currentShop });
    inShop = false;
    continue;
  }
  if (!inShop) continue;
  
  const strMatch = trimmed.match(/^"(\w+)":\s*"([^"]*)"[,]?$/);
  if (strMatch) { currentShop[strMatch[1]] = strMatch[2]; continue; }
  
  const numMatch = trimmed.match(/^"(\w+)":\s*(\d+(?:\.\d+)?)[,]?$/);
  if (numMatch) { currentShop[numMatch[1]] = parseFloat(numMatch[2]); continue; }
  
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) { currentShop[boolMatch[1]] = boolMatch[2] === 'true'; continue; }
}

const activeShops = shops.filter(s => s.isActive);

console.log("=== 潜在的なデータ不正確性のリスク分析 ===\n");

// 1. "other" ジャンルで lunch: false となっている店舗（実はランチ営業している隠れレストランの可能性）
const otherNoLunch = activeShops.filter(s => s.genre === 'other' && !s.hasLunch && parseInt(s.id) > 100);
console.log(`[リスク1] ジャンルが「その他」でランチなし判定された店舗: ${otherNoLunch.length}件`);
console.log(`  理由: キーワード(カフェ, 中華, 等)に引っかからず、機械的に false にされた可能性があります。`);
console.log(`  (例)`);
otherNoLunch.slice(0, 5).forEach(s => console.log(`  - ID:${s.id} ${s.name} (Budget: ${s.budgetMin})`));
console.log();

// 2. エリアが "other" のままの店舗
const areaOther = activeShops.filter(s => s.area === 'other');
console.log(`[リスク2] エリア分類が「other (その他)」のままの店舗: ${areaOther.length}件`);
console.log(`  理由: 住所情報が取得できなかったり、対象の10エリア外(例: 吹田市、堺市など)の可能性があります。`);
console.log(`  (例)`);
areaOther.slice(0, 5).forEach(s => console.log(`  - ID:${s.id} ${s.name}`));
console.log();

// 3. 価格帯が0 (不明) の店舗
const budgetZero = activeShops.filter(s => s.budgetMin === 0 || s.budgetMax === 0);
console.log(`[リスク3] 価格帯(budget)が0(初期値)の店舗: ${budgetZero.length}件`);
console.log(`  理由: 価格情報が欠落しているため、予算フィルタリングの際に正しく機能しません。`);
console.log(`  (例)`);
budgetZero.slice(0, 5).forEach(s => console.log(`  - ID:${s.id} ${s.name}`));
console.log();

// 4. 定休日や営業時間などの詳細データがない
console.log(`[リスク4] 定休日・営業時間の「詳細な構造化データ」が欠落`);
console.log(`  理由: hasLunch/hasDinner は追加しましたが、"火曜定休"のように曜日別の判定が必要な仕様には現在対応していません。`);
console.log();

// 5. 食べログのようなレーティング(rating)の正確性
const zeroRating = activeShops.filter(s => s.rating === 0);
console.log(`[リスク5] レーティングが0(未取得)の店舗: ${zeroRating.length}件`);
if (zeroRating.length > 0) {
    zeroRating.slice(0, 5).forEach(s => console.log(`  - ID:${s.id} ${s.name}`));
}

