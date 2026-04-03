const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

const shops = [];
let currentShop = {};
let inShop = false;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed === '{') { inShop = true; currentShop = { _lineIdStart: i }; continue; }
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

const nonOsakaShops = shops.filter(s => {
  if (!s.isActive) return false;
  const adr = s.address || '';
  // Check for non-Osaka prefectures
  if (/(京都府|兵庫県|奈良県|和歌山県|滋賀県|三重県|東京都|神奈川県|愛知県|福岡県|北海道|沖縄県)/.test(adr)) {
    return true;
  }
  // Check for '県' just in case
  if (adr.includes('県')) {
    return true;
  }
  if (adr.includes('京都')) {
    // Make sure it's not "京都" inside an Osaka address (unlikely, but maybe)
    return true;
  }
  return false;
});

console.log(`Found ${nonOsakaShops.length} active non-Osaka shops:`);
nonOsakaShops.forEach(s => {
  console.log(`- ID: ${s.id}, Name: ${s.name}, Address: ${s.address}`);
});

let changeCount = 0;
// Deactivate them
nonOsakaShops.forEach(change => {
  const idPattern = new RegExp(`("id":\\s*"${change.id}"[\\s\\S]*?"isActive":\\s*)true`);
  if (idPattern.test(content)) {
    content = content.replace(idPattern, `$1false`);
    changeCount++;
  }
});

if (changeCount > 0) {
  content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);
  fs.writeFileSync(mockDataPath, content, 'utf-8');
  console.log(`\n✅ Deactivated ${changeCount} non-Osaka shops!`);
} else {
  console.log('\nNo changes applied.');
}
