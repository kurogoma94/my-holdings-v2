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

const activeOther = shops.filter(s => s.isActive && s.area === 'other');
const blank = activeOther.filter(s => !s.address || s.address.trim() === '');
const hasAddr = activeOther.filter(s => s.address && s.address.trim() !== '');

console.log(`Total active 'other': ${activeOther.length}`);
console.log(`With Blank Address: ${blank.length}`);
console.log(`With Address: ${hasAddr.length}`);

if (hasAddr.length > 0) {
  console.log(`\nShops with address in 'other':`);
  hasAddr.forEach(s => console.log(`- ${s.name} (${s.address})`));
}
