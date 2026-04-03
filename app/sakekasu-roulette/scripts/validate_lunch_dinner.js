/**
 * Lunch/Dinner データの正確性チェックスクリプト
 * - ジャンル別の分布を分析
 * - 疑わしいパターンを検出
 * - Google Maps検証候補をリストアップ
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// Extract shop data using line-by-line parsing
const shops = [];
let currentShop = {};
let inShop = false;

const lines = content.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  
  if (trimmed === '{') {
    inShop = true;
    currentShop = {};
    continue;
  }
  
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) {
      shops.push({ ...currentShop });
    }
    inShop = false;
    continue;
  }
  
  if (!inShop) continue;
  
  // Parse key-value pairs
  const strMatch = trimmed.match(/^"(\w+)":\s*"([^"]*)"[,]?$/);
  if (strMatch) {
    currentShop[strMatch[1]] = strMatch[2];
    continue;
  }
  
  const numMatch = trimmed.match(/^"(\w+)":\s*(\d+(?:\.\d+)?)[,]?$/);
  if (numMatch) {
    currentShop[numMatch[1]] = parseFloat(numMatch[2]);
    continue;
  }
  
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) {
    currentShop[boolMatch[1]] = boolMatch[2] === 'true';
    continue;
  }
}

console.log(`=== Sakekasu Roulette Lunch/Dinner データ検証 ===`);
console.log(`Total shops parsed: ${shops.length}`);
console.log(`Active shops: ${shops.filter(s => s.isActive).length}`);
console.log(`Inactive shops: ${shops.filter(s => !s.isActive).length}`);

// === 1. ジャンル別分布 ===
console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  1. ジャンル別 Lunch/Dinner 分布                            ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝`);

const genreStats = {};
shops.forEach(s => {
  const g = s.genre || 'unknown';
  if (!genreStats[g]) genreStats[g] = { total: 0, lunch: 0, dinner: 0, lunchOnly: 0, dinnerOnly: 0, both: 0, neither: [] };
  genreStats[g].total++;
  if (s.hasLunch && s.hasDinner) genreStats[g].both++;
  else if (s.hasLunch && !s.hasDinner) genreStats[g].lunchOnly++;
  else if (!s.hasLunch && s.hasDinner) genreStats[g].dinnerOnly++;
  else genreStats[g].neither.push(`${s.name} (ID:${s.id})`);
  if (s.hasLunch) genreStats[g].lunch++;
  if (s.hasDinner) genreStats[g].dinner++;
});

console.log(`${'Genre'.padEnd(18)} ${'Total'.padStart(5)} ${'Lunch'.padStart(6)} ${'Dinner'.padStart(6)} ${'Both'.padStart(6)} ${'L Only'.padStart(7)} ${'D Only'.padStart(7)} ${'Neither'.padStart(8)}`);
console.log('-'.repeat(75));
Object.entries(genreStats).sort((a, b) => b[1].total - a[1].total).forEach(([g, s]) => {
  console.log(`${g.padEnd(18)} ${String(s.total).padStart(5)} ${String(s.lunch).padStart(6)} ${String(s.dinner).padStart(6)} ${String(s.both).padStart(6)} ${String(s.lunchOnly).padStart(7)} ${String(s.dinnerOnly).padStart(7)} ${String(s.neither.length).padStart(8)}`);
});

// === 2. 疑わしいパターン検出 ===
console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  2. 疑わしいパターン検出                                     ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝`);

// 2a. ランチもディナーもない店
const neither = shops.filter(s => !s.hasLunch && !s.hasDinner);
console.log(`\n🔴 ランチもディナーもない (${neither.length}件):`);
neither.forEach(s => console.log(`  ID:${s.id} ${s.name} [${s.genre}] area:${s.area} active:${s.isActive}`));

// 2b. ラーメン・うどん・そば系なのにランチなし
const noodleNoLunch = shops.filter(s => {
  const name = s.name || '';
  const isNoodle = ['ramen'].includes(s.genre) || 
    name.includes('ラーメン') || name.includes('らーめん') || 
    name.includes('うどん') || name.includes('そば') || name.includes('Soba') ||
    name.includes('麺');
  return isNoodle && !s.hasLunch && s.isActive;
});
console.log(`\n⚠️  麺類（ラーメン・うどん・そば）なのにランチなし (${noodleNoLunch.length}件):`);
noodleNoLunch.forEach(s => console.log(`  ID:${s.id} ${s.name} [${s.genre}] area:${s.area}`));

// 2c. 居酒屋系なのにランチありの店（確認が必要）
const izakayaLunch = shops.filter(s => {
  const name = s.name || '';
  const isBar = ['izakaya', 'bar', 'tachinomi', 'standing_bar'].includes(s.genre) ||
    name.includes('立ち飲み') || name.includes('立ち呑み') || name.includes('立呑み');
  return isBar && s.hasLunch && s.isActive;
});
console.log(`\n⚠️  居酒屋/バー/立ち飲み系でランチあり (${izakayaLunch.length}件) — 要確認:`);
izakayaLunch.forEach(s => console.log(`  ID:${s.id} ${s.name} [${s.genre}] area:${s.area}`));

// 2d. ディナーなしの店（珍しいので確認）
const noDinner = shops.filter(s => !s.hasDinner && s.isActive);
console.log(`\n⚠️  ディナーなし（アクティブ） (${noDinner.length}件) — ランチ専門?:`);
noDinner.forEach(s => console.log(`  ID:${s.id} ${s.name} [${s.genre}] area:${s.area} lunch:${s.hasLunch}`));

// 2e. 非アクティブ店のランチ/ディナー設定（意味がないのでチェック）
const inactiveWithData = shops.filter(s => !s.isActive);
console.log(`\n📌 非アクティブ店 (${inactiveWithData.length}件):`);
inactiveWithData.forEach(s => console.log(`  ID:${s.id} ${s.name} lunch:${s.hasLunch} dinner:${s.hasDinner}`));

// 2f. 高級店（10000円以上）でランチなし
const highEndNoLunch = shops.filter(s => s.budgetMin >= 10000 && !s.hasLunch && s.isActive);
console.log(`\n📌 高級店（予算1万円〜）でランチなし (${highEndNoLunch.length}件) — ディナーのみは妥当?:`);
highEndNoLunch.forEach(s => console.log(`  ID:${s.id} ${s.name} [${s.genre}] budget:${s.budgetMin}-${s.budgetMax}`));

// 2g. カフェ・パン系でディナーなし（妥当だが確認）
const cafeNoDinner = shops.filter(s => {
  const name = s.name || '';
  const isCafe = name.includes('コーヒー') || name.includes('カフェ') || name.includes('パン') || 
    name.includes('ベーカリー') || name.includes('Coffee') || name.includes('Cafe');
  return isCafe && !s.hasDinner && s.isActive;
});
console.log(`\n✅ カフェ/パン系でディナーなし (${cafeNoDinner.length}件) — 妥当:`);
cafeNoDinner.forEach(s => console.log(`  ID:${s.id} ${s.name} lunch:${s.hasLunch}`));

// === 3. Google Maps検証候補 (ランダムサンプリング) ===
console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
console.log(`║  3. Google Maps検証推奨リスト                                ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝`);

// Priority verification targets
const verifyTargets = [];

// Add all suspicious ones
noodleNoLunch.forEach(s => verifyTargets.push({ ...s, reason: '麺類なのにランチなし' }));
izakayaLunch.forEach(s => verifyTargets.push({ ...s, reason: '居酒屋系でランチあり' }));
noDinner.forEach(s => verifyTargets.push({ ...s, reason: 'ディナーなし' }));

// Add random sample of 15 from remaining
const remaining = shops.filter(s => s.isActive && !verifyTargets.find(v => v.id === s.id));
const shuffled = remaining.sort(() => Math.random() - 0.5);
shuffled.slice(0, 15).forEach(s => verifyTargets.push({ ...s, reason: 'ランダムサンプル' }));

console.log(`\n検証候補 合計: ${verifyTargets.length}件`);
console.log(`${'ID'.padStart(4)} ${'Name'.padEnd(30)} ${'Genre'.padEnd(12)} ${'L'.padStart(2)} ${'D'.padStart(2)} Reason`);
console.log('-'.repeat(80));
verifyTargets.forEach(s => {
  const name = s.name.length > 28 ? s.name.substring(0, 26) + '..' : s.name;
  console.log(`${String(s.id).padStart(4)} ${name.padEnd(30)} ${(s.genre||'').padEnd(12)} ${s.hasLunch?'✓':'✗'} ${s.hasDinner?'✓':'✗'} ${s.reason}`);
});

// Output verification target names for browser search
console.log(`\n\n=== ブラウザ検証用店名リスト（優先度高） ===`);
const highPriority = [...noodleNoLunch, ...noDinner, ...izakayaLunch.slice(0, 5)];
highPriority.forEach((s, i) => {
  console.log(`${i + 1}. "${s.name}" (ID:${s.id}) — ${s.hasLunch ? 'L:✓' : 'L:✗'} ${s.hasDinner ? 'D:✓' : 'D:✗'}`);
});
