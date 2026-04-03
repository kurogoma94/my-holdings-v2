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

const active = shops.filter(s => s.isActive);
const noLunch = active.filter(s => !s.hasLunch);
const hasLunch = active.filter(s => s.hasLunch);

console.log('=== Overall Stats ===');
console.log('Active shops:', active.length);
console.log('Has Lunch:', hasLunch.length, '(' + Math.round(hasLunch.length / active.length * 100) + '%)');
console.log('No Lunch:', noLunch.length, '(' + Math.round(noLunch.length / active.length * 100) + '%)');

// Ramen/noodle analysis
const ramenActive = active.filter(s => s.genre === 'ramen');
console.log('\n=== Ramen Genre (active) ===');
console.log('Total:', ramenActive.length);
console.log('Has Lunch:', ramenActive.filter(s => s.hasLunch).length);
console.log('No Lunch:', ramenActive.filter(s => !s.hasLunch).length);

console.log('\n=== Ramen with hasLunch=true ===');
ramenActive.filter(s => s.hasLunch).forEach(s => console.log('  ID:' + s.id + ' ' + (s.name || '???')));

console.log('\n=== Ramen with hasLunch=false (SUSPICIOUS) ===');
ramenActive.filter(s => !s.hasLunch).forEach(s => console.log('  ID:' + s.id + ' ' + (s.name || '???')));

// Check which batch set them to false — look for patterns
// Batch A-D: first 64, Batch E: next 29
console.log('\n=== Where did these false values come from? ===');
const lunchFalseIds = noLunch.map(s => parseInt(s.id));
const ranges = { 'ID 1-100': 0, 'ID 101-200': 0, 'ID 201-300': 0, 'ID 301-400': 0, 'ID 401-500': 0, 'ID 501-600': 0, 'ID 601-700': 0 };
lunchFalseIds.forEach(id => {
  if (id <= 100) ranges['ID 1-100']++;
  else if (id <= 200) ranges['ID 101-200']++;
  else if (id <= 300) ranges['ID 201-300']++;
  else if (id <= 400) ranges['ID 301-400']++;
  else if (id <= 500) ranges['ID 401-500']++;
  else if (id <= 600) ranges['ID 501-600']++;
  else if (id <= 700) ranges['ID 601-700']++;
});
console.log('No-lunch shops by ID range:');
Object.entries(ranges).forEach(([range, count]) => console.log('  ' + range + ': ' + count));

// Shops that have hasLunch=true — were they from the first batch?
console.log('\n=== Lunch=true shops by ID range ===');
const lunchTrueIds = hasLunch.map(s => parseInt(s.id));
const rangesTrue = { 'ID 1-100': 0, 'ID 101-200': 0, 'ID 201-300': 0, 'ID 301-400': 0, 'ID 401-500': 0, 'ID 501-600': 0, 'ID 601-700': 0 };
lunchTrueIds.forEach(id => {
  if (id <= 100) rangesTrue['ID 1-100']++;
  else if (id <= 200) rangesTrue['ID 101-200']++;
  else if (id <= 300) rangesTrue['ID 201-300']++;
  else if (id <= 400) rangesTrue['ID 301-400']++;
  else if (id <= 500) rangesTrue['ID 401-500']++;
  else if (id <= 600) rangesTrue['ID 501-600']++;
  else if (id <= 700) rangesTrue['ID 601-700']++;
});
Object.entries(rangesTrue).forEach(([range, count]) => console.log('  ' + range + ': ' + count));
