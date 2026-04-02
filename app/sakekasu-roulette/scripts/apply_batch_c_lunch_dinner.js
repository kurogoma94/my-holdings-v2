const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const BATCH_C_RESULTS = [
  { "id": "34", "hasLunch": false, "hasDinner": true }, // 魚屋 ひでぞう 立ち呑み店
  { "id": "38", "hasLunch": true, "hasDinner": false }, // パンとエスプレッソ
  { "id": "39", "hasLunch": true, "hasDinner": true },  // Dal Brigante
  { "id": "41", "hasLunch": true, "hasDinner": true },  // 回転寿し仁
  { "id": "44", "hasLunch": false, "hasDinner": true }, // 踊ル
  { "id": "45", "hasLunch": false, "hasDinner": true }, // とおる
  { "id": "46", "hasLunch": true, "hasDinner": false }, // PaNOTTO
  { "id": "48", "hasLunch": true, "hasDinner": true },  // ロウリーズ
  { "id": "50", "hasLunch": true, "hasDinner": true },  // 法善寺 浅草
  { "id": "52", "hasLunch": true, "hasDinner": true }   // ツバクロ
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
        const result = BATCH_C_RESULTS.find(r => r.id === shop.id);
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
    console.log('Successfully updated MockData.ts with Batch C.');
}

run();
