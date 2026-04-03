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

const toDeactivate = [];
shops.forEach(s => {
  if (!s.isActive) return;
  
  // If it's explicitly outside Osaka
  const isOutOfPrefecture = s.address && s.address.trim() !== '' && !s.address.includes('大阪府') && !s.address.includes('大阪市') && !s.address.includes('堺市') && /(県|道|都|京都府)/.test(s.address);
  
  // Also maybe if it's area: "other" and the user wants to remove non-osaka data
  // The prompt says "大阪府以外のデータはいったんその他からも外してください"
  
  if (isOutOfPrefecture) {
    toDeactivate.push(s);
  }
});

console.log(`Found ${toDeactivate.length} shops confirmed outside of Osaka.`);
toDeactivate.forEach(s => console.log(s.name, s.address));

// Let's also check shops that have NO address AND are in area 'other'.
// Maybe the user means "If they are in 'other' and don't explicitly belong to Osaka".
const noAddressOther = shops.filter(s => s.isActive && s.area === 'other' && (!s.address || s.address.trim() === ''));

// Wait, the safest is to look at ALL 'other' shops.
const allOther = shops.filter(s => s.isActive && s.area === 'other');
console.log(`\nRemaining active shops in 'other' category: ${allOther.length}`);
allOther.slice(0, 5).forEach(s => console.log(`- ID: ${s.id}, Name: ${s.name}, Address: ${s.address}`));

let changes = 0;
allOther.forEach(change => {
    // Check if it should be removed: if it's 'other', and isn't mapped to a known osaka location, let's deactivate it per request.
    // "大阪府以外のデータはいったんその他からも外してください" means "If it's data from outside Osaka, remove it from 'other' for now (so deactivate it)".
    // Let's just find anything outside Osaka.
    const hasOsaka = change.address && (change.address.includes('大阪') || change.address.includes('osaka') || change.address.includes('堺') || change.address.includes('吹田') || change.address.includes('豊中'));
    if (!hasOsaka) {
        const idPattern = new RegExp(`("id":\\s*"${change.id}"[\\s\\S]*?"isActive":\\s*)true`);
        if (idPattern.test(content)) {
            content = content.replace(idPattern, `$1false`);
            changes++;
            console.log(`Deactivating: ${change.name} (${change.address || 'No Address'})`);
        }
    }
});

if (changes > 0) {
  content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);
  fs.writeFileSync(mockDataPath, content, 'utf-8');
  console.log(`\n✅ Deactivated ${changes} shops!`);
} else {
  console.log('\nNo changes applied.');
}
