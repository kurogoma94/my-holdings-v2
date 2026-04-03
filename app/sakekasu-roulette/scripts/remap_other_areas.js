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

const otherAreaShops = shops.filter(s => s.isActive && s.area === 'other');

console.log(`Found ${otherAreaShops.length} active shops with area="other". Analyzing addresses...\n`);

const mapped = [];
const unmapped = [];

otherAreaShops.forEach(s => {
  const adr = s.address || '';
  const name = s.name || '';
  const combined = adr + ' ' + name;
  let newArea = null;

  // Enhanced mapping logic
  if (/北区.*(梅田|堂山|角田|曽根崎|茶屋|中崎|堂島|大深|中津)/.test(combined)) newArea = 'umeda';
  else if (/福島区.*(福島|鷺洲|吉野|海老江|野田|玉川)/.test(combined)) newArea = 'fukushima';
  else if (/中央区.*(心斎橋|西心斎橋|東心斎橋|南船場|博労町)/.test(combined)) newArea = 'shinsaibashi';
  else if (/中央区.*(難波|なんば|千日前|道頓堀|日本橋|宗右衛門町)/.test(combined)) newArea = 'namba';
  else if (/中央区.*(北浜|平野町|伏見町|高麗橋|淀屋橋|今橋|道修町|淡路町)/.test(combined)) newArea = 'kitahama';
  else if (/北区.*(天満|天神橋|末広|扇町|浪花町|菅栄町|池田町|同心)/.test(combined)) newArea = 'tenma';
  else if (/(都島区.*(東野田|片町|網島))|(城東区.*(蒲生|新喜多|鴫野))/.test(combined)) newArea = 'kyobashi';
  else if (/(阿倍野区|天王寺区).*(阿倍野|天王寺|悲田院|大道|松崎)/.test(combined)) newArea = 'abeno';
  else if (/(天王寺区|東成区|生野区).*(鶴橋|下味原|舟橋|東小橋)/.test(combined)) newArea = 'tsuruhashi';
  else if (/浪速区.*(恵美須.*|新世界)/.test(combined)) newArea = 'shinsekai';
  else if (/難波|大国|元町/.test(combined) && /浪速区/.test(combined)) newArea = 'namba';
  
  if (newArea) {
    mapped.push({ ...s, newArea });
  } else {
    unmapped.push(s);
  }
});

console.log(`Successfully mapped ${mapped.length} shops.`);
console.log(`Still unmapped: ${unmapped.length} shops.\n`);

/*
// Print unmapped addresses to find patterns
const counts = {};
unmapped.forEach(s => {
  const adrStart = (s.address || '').substring(0, 15);
  counts[adrStart] = (counts[adrStart] || 0) + 1;
});
console.log(counts);
*/

// Apply the mapped changes
let changeCount = 0;
mapped.forEach(change => {
  const idPattern = new RegExp(`("id":\\s*"${change.id}"[\\s\\S]*?"area":\\s*")other(")`);
  if (idPattern.test(content)) {
    content = content.replace(idPattern, `$1${change.newArea}$2`);
    changeCount++;
  }
});

if (changeCount > 0) {
  content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);
  fs.writeFileSync(mockDataPath, content, 'utf-8');
  console.log(`Saved ${changeCount} area updates to MockData.ts!`);
}
