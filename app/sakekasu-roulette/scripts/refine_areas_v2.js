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

const otherAreaShops = shops.filter(s => s.area === 'other');

console.log(`Analyzing ${otherAreaShops.length} shops with area="other"...\n`);

const mapped = [];
const unmapped = [];

otherAreaShops.forEach(s => {
  const adr = s.address || '';
  const name = s.name || '';
  const combined = adr + ' ' + name;
  let newArea = null;

  // Hokusetsu
  if (/(吹田市|豊中市|茨木市|高槻市|箕面市|池田市|能勢町|摂津市)/.test(combined)) newArea = 'hokusetsu';
  // Higashi-Osaka & Keihan
  else if (/(東大阪市|大東市|門真市|守口市|寝屋川市|交野市|四條畷市|八尾市|枚方市)/.test(combined)) newArea = 'higashiosaka';
  // Sakai & Senshu & Minamikawachi
  else if (/(堺市|岸和田市|泉佐野市|貝塚市|泉大津市|忠岡町|和泉市|泉南市|松原市|羽曳野市|藤井寺市|富田林市|河内長野市|大阪狭山市|千早赤阪村)/.test(combined)) newArea = 'senshu';
  // Nishinakajima
  else if (/(淀川区|東淀川区|西淀川区|西中島|新大阪|十三)/.test(combined)) newArea = 'nishinakajima';
  // Osaka City remaining wards
  else if (/(大阪市(大正区|此花区|旭区|西区|鶴見区|住吉区|東住吉区|平野区|住之江区|城東区|港区|生野区|東成区|浪速区|中央区|北区|天王寺区))/i.test(combined)) newArea = 'osakacity-other';
  // Generic catching
  else if (/(大阪市大正区|大阪市此花区|大阪市西区|大阪市住之江区|大阪市旭区|大阪市鶴見区|大阪市住吉区|大阪市東住吉区|大阪市平野区|大阪市中央区|大阪市浪速区)/.test(combined)) newArea = 'osakacity-other';
  // By station/location name inside city
  else if (/(本町|谷町|久宝寺|西本町|靱本町|槍屋町|常盤町)/.test(combined)) newArea = 'osakacity-other';
  
  if (newArea) {
    mapped.push({ id: s.id, name: s.name, oldArea: s.area, newArea });
  } else {
    // If it has NO address or is outside Osaka Prefecture, keep it 'other'
    unmapped.push(s);
  }
});

console.log(`Successfully mapped ${mapped.length} shops.`);
console.log(`Keep as 'other': ${unmapped.length} shops.\n`);

let changeCount = 0;
mapped.forEach(change => {
  const idPattern = new RegExp(`("id":\\s*"${change.id}"[\\s\\S]*?"area":\\s*")other(")`);
  if (idPattern.test(content)) {
    content = content.replace(idPattern, `$1${change.newArea}$2`);
    changeCount++;
  } else {
      console.log(`FAILED TO REPLACE ID ${change.id}`);
  }
});

if (changeCount > 0) {
  content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);
  fs.writeFileSync(mockDataPath, content, 'utf-8');
  console.log(`✅ Saved ${changeCount} area updates to MockData.ts!`);
} else {
  console.log('No changes applied.');
}
