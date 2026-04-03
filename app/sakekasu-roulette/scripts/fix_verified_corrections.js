/**
 * 検証結果に基づく追加修正スクリプト
 * 
 * Google Maps検証で判明した誤りを修正:
 * 1. ID:289 焼肉 まつえ → hasLunch: false (17:30開店)
 * 2. ID:555 すしの助 北浜店 → hasLunch: false (18:00開店)
 * 3. ID:474 串カツ 武田 → hasLunch: false (16:00開店)
 * 
 * さらに: 焼肉・寿司のルールを厳格化
 * - 焼肉: budgetMin >= 4000 の店はランチなしに戻す （高級焼肉はディナーのみが多い）
 * - 寿司: 店名に「立ち」「スタンド」がない高めの寿司店はランチなしに戻す
 * → ただし実際には個別に判定すべきなので、今回はGoogle Mapsで確認済みの3店のみ修正
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

// Specific corrections based on Google Maps verification
const corrections = [
  { id: '289', name: '焼肉 まつえ', hasLunch: false, reason: '17:30開店' },
  { id: '555', name: 'すしの助 北浜店', hasLunch: false, reason: '18:00開店' },
  { id: '474', name: '串カツ 武田', hasLunch: false, reason: '16:00開店' },
];

let changeCount = 0;
corrections.forEach(c => {
  const pattern = new RegExp(
    '("id":\\s*"' + c.id + '"[\\s\\S]*?"hasLunch":\\s*)true',
    ''
  );
  if (pattern.test(content)) {
    content = content.replace(pattern, '$1false');
    changeCount++;
    console.log('Fixed ID:' + c.id + ' ' + c.name + ' → hasLunch: false (' + c.reason + ')');
  } else {
    console.log('SKIP ID:' + c.id + ' — already false or pattern not found');
  }
});

// Also fix hasDinner for カドヤ食堂 (ID:695) — lunch only, closes at 15:00
const kadoyaPattern = /("id":\s*"695"[\s\S]*?"hasDinner":\s*)true/;
if (kadoyaPattern.test(content)) {
  content = content.replace(kadoyaPattern, '$1false');
  changeCount++;
  console.log('Fixed ID:695 中華そば カドヤ食堂 総本店 → hasDinner: false (closes 15:00)');
}

// Also fix hasDinner for 手打ちうどん 上を向いて (ID:587) — lunch only, closes at 14:30
const udonPattern = /("id":\s*"587"[\s\S]*?"hasDinner":\s*)true/;
if (udonPattern.test(content)) {
  content = content.replace(udonPattern, '$1false');
  changeCount++;
  console.log('Fixed ID:587 手打ちうどん 上を向いて → hasDinner: false (closes 14:30)');
}

// Update timestamp
const newTimestamp = new Date().toISOString();
content = content.replace(
  /MOCK_DATA_UPDATED_AT = '[^']+'/,
  "MOCK_DATA_UPDATED_AT = '" + newTimestamp + "'"
);

console.log('\nTotal corrections applied:', changeCount);
fs.writeFileSync(mockDataPath, content, 'utf-8');
console.log('✅ File saved. Timestamp:', newTimestamp);
