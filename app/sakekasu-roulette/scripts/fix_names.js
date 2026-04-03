const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

// Fix ID 32
content = content.replace(
  /"id":\s*"32"[\s\S]*?"name":\s*"〒542-0012 大阪府大阪市中央区谷町６丁目３−１０ すかんぽ"/,
  match => match.replace('"〒542-0012 大阪府大阪市中央区谷町６丁目３−１０ すかんぽ"', '"すかんぽ"')
);

// Fix ID 109
content = content.replace(
  /"id":\s*"109"[\s\S]*?"name":\s*"〒550-0003 大阪府大阪市西区京町堀１丁目１７−３ Ｃｉｕｃａｔｅ"/,
  match => match.replace('"〒550-0003 大阪府大阪市西区京町堀１丁目１７−３ Ｃｉｕｃａｔｅ"', '"Ciucate"')
);

// Fix ID 580
content = content.replace(
  /"id":\s*"580"[\s\S]*?"name":\s*"〒556-0002 大阪府大阪市浪速区恵美須東２丁目３−９"/,
  match => match.replace('"〒556-0002 大阪府大阪市浪速区恵美須東２丁目３−９"', '"串かつ越源"')
);

// Fix ID 174
content = content.replace(
  /"id":\s*"174"[\s\S]*?"name":\s*"undefined"/,
  match => match.replace('"undefined"', '"天王寺 豆ふ屋 やすまる"')
);

// Update timestamp
const newTimestamp = new Date().toISOString();
content = content.replace(
  /MOCK_DATA_UPDATED_AT = '[^']+'/,
  "MOCK_DATA_UPDATED_AT = '" + newTimestamp + "'"
);

fs.writeFileSync(mockDataPath, content, 'utf-8');
console.log('✅ Successfully fixed malformed names for IDs: 32, 109, 580, 174');
