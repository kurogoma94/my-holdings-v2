/**
 * Google Places API 結果をMockDataに適用
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const resultsPath = path.join(__dirname, 'google_geocode_results.json');

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
let content = fs.readFileSync(mockDataPath, 'utf-8');

const validResults = Object.entries(results)
  .filter(([id, r]) => r.suggestedArea)
  .map(([id, r]) => ({ id, ...r }));

console.log(`=== Google Geocode結果の適用 ===`);
console.log(`判定成功: ${validResults.length}件\n`);

let appliedCount = 0;

validResults.forEach(r => {
  const idPattern = `"id": "${r.id}"`;
  const idx = content.indexOf(idPattern);
  if (idx === -1) return;

  const searchRegion = content.substring(idx, idx + 300);
  const areaMatch = searchRegion.match(/"area": "other"/);
  if (!areaMatch) return; // already classified

  const areaPos = idx + areaMatch.index;
  content = content.substring(0, areaPos)
    + `"area": "${r.suggestedArea}"`
    + content.substring(areaPos + areaMatch[0].length);
  appliedCount++;
});

const now = new Date().toISOString();
content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${now}'`);
fs.writeFileSync(mockDataPath, content, 'utf-8');

console.log(`✅ ${appliedCount}件のエリアを更新`);

// 最終検証
const verify = fs.readFileSync(mockDataPath, 'utf-8');
const otherCount = (verify.match(/"area": "other"/g) || []).length;
const totalIds = (verify.match(/"id":/g) || []).length;

// エリア分布
const areaDistrib = {};
const areaMatches = verify.matchAll(/"area": "([^"]+)"/g);
for (const m of areaMatches) areaDistrib[m[1]] = (areaDistrib[m[1]] || 0) + 1;

console.log(`\n=== 最終エリア分布 ===`);
Object.entries(areaDistrib).sort((a, b) => b[1] - a[1]).forEach(([area, count]) => {
  const pct = (count / totalIds * 100).toFixed(1);
  console.log(`  ${area.padEnd(20)} ${String(count).padStart(4)}件 (${pct}%)`);
});
console.log(`\n全店舗: ${totalIds} / other: ${otherCount} (${(otherCount/totalIds*100).toFixed(1)}%) / 分類済み: ${totalIds - otherCount} (${((totalIds-otherCount)/totalIds*100).toFixed(1)}%)`);
