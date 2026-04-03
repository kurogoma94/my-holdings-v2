/**
 * hasLunch 一括修正スクリプト
 * 
 * ID 101以降の店舗の hasLunch フラグを、ジャンル・店名ベースのルールで修正する。
 * ID 1-100 は既に手動検証済みなので変更しない。
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// Parse all shops
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

console.log('Total shops parsed:', shops.length);

// === Determine hasLunch for each shop (ID > 100 only) ===
function shouldHaveLunch(shop) {
  const name = shop.name || '';
  const genre = shop.genre || '';
  const budgetMin = shop.budgetMin || 0;
  
  // Rule: Night-only keywords → false
  if (/BAR|バー|スナック/i.test(name) && genre !== 'ramen') return false;
  
  // Rule 1: Ramen/noodle genre → true
  if (genre === 'ramen') return true;
  
  // Rule 1b: Noodle-like names → true
  if (/ラーメン|らーめん|中華そば|麺|うどん|そば|Soba/.test(name)) return true;
  
  // Rule 2: 食堂/定食 in name → true
  if (/食堂|定食/.test(name)) return true;
  
  // Rule 3: Kushikatsu → true
  if (genre === 'kushikatsu') return true;
  
  // Rule 4: Sushi (non-premium) → true
  if (genre === 'sushi' && budgetMin < 10000) return true;
  
  // Rule 4b: Yakiniku (non-premium) → true
  if (genre === 'yakiniku' && budgetMin < 10000) return true;
  
  // Rule 5: Izakaya/bar/tachinomi/yakitori → false
  if (['izakaya', 'bar', 'tachinomi', 'yakitori'].includes(genre)) return false;
  
  // Rule 6: "other" genre - name-based
  if (genre === 'other') {
    // Cafes, bakeries, takeout → true
    if (/カフェ|コーヒー|Coffee|Cafe|パン|ベーカリー|弁当|テイクアウト/.test(name)) return true;
    // Korean/Chinese restaurants often do lunch
    if (/韓国|中華|中国|台湾|タイ|ベトナム|インド|カレー/.test(name)) return true;
    // Tonkatsu, hamburg, tempura, teishoku → true
    if (/とんかつ|トンカツ|ハンバーグ|天ぷら|天婦羅|洋食/.test(name)) return true;
    // Italian, French, Spanish cuisine → depends, but many do lunch
    if (/イタリアン|フレンチ|スパニッシュ|パスタ|ピザ|ピッツァ/.test(name)) return true;
    // BBQ, grill → depends
    if (/焼肉|ホルモン/.test(name)) return budgetMin < 10000;
    // Sushi-like → true
    if (/寿司|鮨|すし/.test(name)) return budgetMin < 10000;
    // Default for "other": keep false
    return false;
  }
  
  // Fallback
  return false;
}

// Calculate changes
const changes = [];
let beforeLunchTrue = 0;
let afterLunchTrue = 0;

shops.forEach(shop => {
  const id = parseInt(shop.id);
  const currentLunch = shop.hasLunch;
  
  if (currentLunch) beforeLunchTrue++;
  
  // Only modify ID > 100
  if (id <= 100) {
    if (currentLunch) afterLunchTrue++;
    return;
  }
  
  const newLunch = shouldHaveLunch(shop);
  if (newLunch) afterLunchTrue++;
  
  if (currentLunch !== newLunch) {
    changes.push({
      id: shop.id,
      name: shop.name || '???',
      genre: shop.genre,
      budgetMin: shop.budgetMin,
      oldValue: currentLunch,
      newValue: newLunch
    });
  }
});

console.log('\n=== Changes Summary ===');
console.log('Before: hasLunch=true count:', beforeLunchTrue);
console.log('After: hasLunch=true count:', afterLunchTrue);
console.log('Total changes needed:', changes.length);

console.log('\n--- Changes: false → true ---');
const toTrue = changes.filter(c => c.newValue === true);
console.log('Count:', toTrue.length);
toTrue.forEach(c => console.log('  ID:' + c.id + ' ' + c.name + ' [' + c.genre + ']'));

console.log('\n--- Changes: true → false ---');
const toFalse = changes.filter(c => c.newValue === false);
console.log('Count:', toFalse.length);
toFalse.forEach(c => console.log('  ID:' + c.id + ' ' + c.name + ' [' + c.genre + ']'));

// === Apply changes to file ===
let modifiedContent = content;
let changeCount = 0;

changes.forEach(change => {
  // Find the shop block by ID and change hasLunch value
  // Pattern: "id": "123" ... "hasLunch": false/true
  const idPattern = new RegExp(
    '("id":\\s*"' + change.id + '"[\\s\\S]*?"hasLunch":\\s*)' + String(change.oldValue),
    ''
  );
  
  const match = modifiedContent.match(idPattern);
  if (match) {
    modifiedContent = modifiedContent.replace(idPattern, '$1' + String(change.newValue));
    changeCount++;
  } else {
    console.log('WARNING: Could not find pattern for ID:' + change.id);
  }
});

// Update timestamp
const newTimestamp = new Date().toISOString();
modifiedContent = modifiedContent.replace(
  /MOCK_DATA_UPDATED_AT = '[^']+'/,
  "MOCK_DATA_UPDATED_AT = '" + newTimestamp + "'"
);

console.log('\n=== Applied ' + changeCount + ' / ' + changes.length + ' changes ===');

if (changeCount === changes.length) {
  fs.writeFileSync(mockDataPath, modifiedContent, 'utf-8');
  console.log('✅ File saved successfully!');
  console.log('Updated timestamp:', newTimestamp);
} else {
  console.log('❌ Some changes failed - NOT saving file.');
  console.log('Please investigate the warnings above.');
}
