const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

const shops = [];
let currentShop = {};
let inShop = false;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed === '{') { 
    inShop = true; 
    currentShop = { _startLine: i }; 
    continue; 
  }
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) {
      currentShop._endLine = i;
      shops.push({ ...currentShop });
    }
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

console.log(`Total shops parsed: ${shops.length}`);

// Find malformed
const malformed = [];
shops.forEach(s => {
  if (s.name && (s.name.includes('〒') || s.name.startsWith('大阪府大阪市'))) {
    malformed.push(s);
  } else if (!s.name || s.name.trim() === '') {
    malformed.push(s);
  }
});

console.log(`\nFound ${malformed.length} malformed shops:`);
malformed.forEach(s => {
  console.log(`- ID: ${s.id}, Name: "${s.name}", URL: ${s.googleMapsUrl}`);
});

// Create a list of IDs to remove or fix
const idsToRemove = malformed.map(s => s.id);

if (idsToRemove.length > 0) {
    console.log(`\nTo fix, we will mark these as isActive: false instead of deleting them to preserve array structure, or we can just remove them entirely.`);
}
