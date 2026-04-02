const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const BATCH_A_RESULTS = [
  { "id": "1", "hasLunch": true, "hasDinner": true },
  { "id": "4", "hasLunch": true, "hasDinner": true }, // ID was 4 in MockData
  { "id": "8", "hasLunch": true, "hasDinner": false }, // ID was 8 in MockData
  { "id": "10", "hasLunch": true, "hasDinner": true },
  { "id": "11", "hasLunch": false, "hasDinner": true },
  { "id": "12", "hasLunch": true, "hasDinner": true },
  { "id": "13", "hasLunch": true, "hasDinner": true },
  { "id": "14", "hasLunch": true, "hasDinner": true },
  { "id": "17", "hasLunch": true, "hasDinner": true },
  { "id": "19", "hasLunch": true, "hasDinner": true }
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
        const result = BATCH_A_RESULTS.find(r => r.id === shop.id);
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
    console.log('Successfully updated MockData.ts with Batch A.');
}

run();
