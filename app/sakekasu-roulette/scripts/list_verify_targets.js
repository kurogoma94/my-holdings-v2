const fs = require('fs');
const content = fs.readFileSync('src/constants/MockData.ts', 'utf-8');

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

// Get yakiniku and sushi shops (ID > 100, active, hasLunch=true) that need verification
const targets = shops.filter(s => {
  const id = parseInt(s.id);
  return id > 100 && s.isActive && s.hasLunch && ['yakiniku', 'sushi'].includes(s.genre);
});

console.log('=== Verification targets: yakiniku + sushi (ID>100, active, hasLunch=true) ===');
console.log('Total:', targets.length);

const yakiniku = targets.filter(s => s.genre === 'yakiniku');
const sushi = targets.filter(s => s.genre === 'sushi');

console.log('Yakiniku:', yakiniku.length);
console.log('Sushi:', sushi.length);

console.log('\n=== YAKINIKU LIST ===');
yakiniku.forEach(s => console.log(s.id + '|' + (s.name||'???') + '|' + s.area + '|' + s.budgetMin + '-' + s.budgetMax));

console.log('\n=== SUSHI LIST ===');
sushi.forEach(s => console.log(s.id + '|' + (s.name||'???') + '|' + s.area + '|' + s.budgetMin + '-' + s.budgetMax));

// Also output as JSON for script use
const output = { yakiniku: yakiniku.map(s => ({id: s.id, name: s.name || '???', area: s.area})), sushi: sushi.map(s => ({id: s.id, name: s.name || '???', area: s.area})) };
fs.writeFileSync('scripts/verify_targets.json', JSON.stringify(output, null, 2), 'utf-8');
console.log('\nSaved to scripts/verify_targets.json');
