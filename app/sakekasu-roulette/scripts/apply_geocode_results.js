/**
 * Geocoding結果をMockDataに適用するスクリプト
 * - geocode_results.json からエリア判定済みの結果を読み込み
 * - MockData.ts の該当レコードのareaフィールドを更新
 */
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const resultsPath = path.join(__dirname, 'geocode_results.json');

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
let content = fs.readFileSync(mockDataPath, 'utf-8');

// エリア判定が成功したもののみ抽出
const validResults = Object.entries(results)
  .filter(([id, r]) => r.suggestedArea && r.suggestedArea !== 'other')
  .map(([id, r]) => ({ id, ...r }));

console.log(`=== Geocoding結果の適用 ${DRY_RUN ? '(DRY RUN)' : ''} ===`);
console.log(`判定成功: ${validResults.length}件\n`);

// エリア別にグループ化して表示
const byArea = {};
validResults.forEach(r => {
  if (!byArea[r.suggestedArea]) byArea[r.suggestedArea] = [];
  byArea[r.suggestedArea].push(r);
});

Object.entries(byArea).sort((a, b) => b[1].length - a[1].length).forEach(([area, items]) => {
  console.log(`📍 → ${area} (${items.length}件):`);
  items.slice(0, 5).forEach(r => {
    console.log(`  ID:${r.id.padStart(3)} ${(r.name || '').substring(0, 35).padEnd(36)} [${r.matchedWard}]`);
  });
  if (items.length > 5) console.log(`  ... 他 ${items.length - 5}件`);
  console.log('');
});

if (DRY_RUN) {
  console.log('>>> --dry-run モードのため変更は適用されません');
  process.exit(0);
}

// 変更を適用
let appliedCount = 0;

validResults.forEach(r => {
  const idPattern = `"id": "${r.id}"`;
  const idx = content.indexOf(idPattern);
  if (idx === -1) return;

  const searchRegion = content.substring(idx, idx + 300);
  const areaMatch = searchRegion.match(/"area": "other"/);
  if (!areaMatch) return;

  const areaPos = idx + areaMatch.index;
  content = content.substring(0, areaPos)
    + `"area": "${r.suggestedArea}"`
    + content.substring(areaPos + areaMatch[0].length);
  appliedCount++;
});

// タイムスタンプ更新
const now = new Date().toISOString();
content = content.replace(
  /MOCK_DATA_UPDATED_AT = '[^']+'/,
  `MOCK_DATA_UPDATED_AT = '${now}'`
);

fs.writeFileSync(mockDataPath, content, 'utf-8');

console.log(`✅ ${appliedCount}件のエリアを更新しました`);

// 最終検証
const verify = fs.readFileSync(mockDataPath, 'utf-8');
const otherCount = (verify.match(/"area": "other"/g) || []).length;
const totalIds = (verify.match(/"id":/g) || []).length;
console.log(`\n=== 最終状態 ===`);
console.log(`全店舗: ${totalIds}`);
console.log(`other残数: ${otherCount} (${(otherCount / totalIds * 100).toFixed(1)}%)`);
console.log(`分類済み: ${totalIds - otherCount} (${((totalIds - otherCount) / totalIds * 100).toFixed(1)}%)`);
