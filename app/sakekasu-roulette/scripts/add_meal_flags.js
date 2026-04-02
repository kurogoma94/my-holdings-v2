const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

function run() {
    console.log('Reading MockData.ts...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        console.error('Markers not found in MockData.ts');
        return;
    }

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    // Initial pass: Add default flags
    shops = shops.map(shop => {
        // Default to Dinner Only unless we know otherwise
        if (shop.hasLunch === undefined) shop.hasLunch = false;
        if (shop.hasDinner === undefined) shop.hasDinner = true;

        // Specific Research Data
        if (shop.id === '217') { // ゆうすけ
            shop.hasLunch = true;
            shop.hasDinner = true;
        } else if (shop.id === '487') { // まんしゅう
            shop.hasLunch = true;
            shop.hasDinner = true;
        } else if (shop.id === '230') { // しっとう屋
            shop.hasLunch = false;
            shop.hasDinner = true;
        }

        return shop;
    });

    console.log(`Updated ${shops.length} shops with lunch/dinner flags.`);

    const updatedJson = JSON.stringify(shops, null, 2);
    let newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);

    // Update MOCK_DATA_UPDATED_AT
    const now = new Date().toISOString();
    newContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${now}';`);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Successfully updated MockData.ts');
}

run();
