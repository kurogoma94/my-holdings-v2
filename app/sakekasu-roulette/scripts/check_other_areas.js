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

const unmapped = shops.filter(s => s.isActive && s.area === 'other');

console.log(`Unmapped shops: ${unmapped.length}`);
// Count by City/Ward to see where they are
const locations = {};
unmapped.forEach(s => {
  const adr = s.address || '';
  const match = adr.match(/([^\s]+[都道府県][^\s]+[市区町村])/);
  const loc = match ? match[1] : (adr.substring(0, 15) + '...');
  locations[loc] = (locations[loc] || 0) + 1;
});

const sorted = Object.entries(locations).sort((a,b) => b[1] - a[1]);
sorted.forEach(([loc, count]) => {
  console.log(`${count.toString().padStart(3, ' ')}: ${loc}`);
});
