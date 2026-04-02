const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const BATCH_B_RESULTS = [
  { "id": "20", "hasLunch": true, "hasDinner": true }, // ID 20: 神豚
  { "id": "21", "hasLunch": false, "hasDinner": true }, // ID 21: 羊の結論
  { "id": "23", "hasLunch": false, "hasDinner": true }, // ID 23: STUN.S
  { "id": "24", "hasLunch": true, "hasDinner": true }, // ID 24: 彩七
  { "id": "25", "hasLunch": true, "hasDinner": true }, // ID 25: 游玄亭
  { "id": "26", "hasLunch": true, "hasDinner": true }, // ID 26: 近江屋
  { "id": "28", "hasLunch": true, "hasDinner": true }, // ID 28: タカムラ
  { "id": "29", "hasLunch": true, "hasDinner": true }, // ID 29: R&R2号
  { "id": "32", "hasLunch": false, "hasDinner": true }, // ID 32: すかんぽ
  { "id": "33", "hasLunch": false, "hasDinner": true }  // ID 33: 立ち鮨ひでぞう
];

function run() {
    console.log('Reading MockData.ts...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const result = BATCH_B_RESULTS.find(r => r.id === shop.id);
        if (result) {
            shop.hasLunch = result.hasLunch;
            shop.hasDinner = result.hasDinner;
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    let newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);

    const now = new Date().toISOString();
    newContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${now}';`);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Successfully updated MockData.ts with Batch B.');
}

run();
