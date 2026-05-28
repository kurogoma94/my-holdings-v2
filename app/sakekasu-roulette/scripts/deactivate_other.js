const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
let shops = JSON.parse(shopsMatch[1]);

let changed = 0;
shops = shops.map(shop => {
    if (shop.isActive && shop.area === 'other') {
        shop.isActive = false;
        changed++;
    }
    return shop;
});

const newShopsJson = JSON.stringify(shops, null, 2);
const newContent = content.replace(shopsMatch[1], newShopsJson).replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);

fs.writeFileSync(mockDataPath, newContent);
console.log(`Deactivated ${changed} shops with area 'other'.`);
