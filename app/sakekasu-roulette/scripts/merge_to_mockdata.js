const fs = require('fs');
const path = require('path');

/**
 * merge_to_mockdata.js
 * final_shops_544.json を MockData.ts に反映する。
 * MOCK_SHOPS 配列を完全に差し替える。
 */

const jsonPath = path.join(__dirname, 'final_shops_544.json');
const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');

if (!fs.existsSync(jsonPath)) {
    console.error('JSON not found:', jsonPath);
    process.exit(1);
}

const newShops = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let mockContent = fs.readFileSync(mockDataPath, 'utf8');

// MOCK_SHOPS の配列部分を置換
// export const MOCK_SHOPS: Shop[] = [ ... ];
const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
const endMarker = '];';

const startIndex = mockContent.indexOf(startMarker);
const endIndex = mockContent.lastIndexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found in MockData.ts');
    process.exit(1);
}

const newShopsString = JSON.stringify(newShops, null, 2);
const updatedContent = 
    mockContent.substring(0, startIndex + startMarker.length) + 
    '\n' + newShopsString.substring(1, newShopsString.length - 1) + '\n' + // [] を除いた中身
    mockContent.substring(endIndex);

// 更新日時も更新
const now = new Date().toISOString();
const finalContent = updatedContent.replace(/MOCK_DATA_UPDATED_AT = '.*'/, `MOCK_DATA_UPDATED_AT = '${now}'`);

fs.writeFileSync(mockDataPath, finalContent, 'utf8');
console.log(`Successfully updated MockData.ts with ${newShops.length} shops.`);
