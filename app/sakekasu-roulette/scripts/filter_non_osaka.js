const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

function run() {
    console.log('Reading MockData.ts...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    // Extract the shops array
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('Could not find MOCK_SHOPS array in MockData.ts');
        return;
    }

    let shops = JSON.parse(shopsMatch[1]);
    console.log(`Original count: ${shops.length}`);

    // Filter for Osaka only
    const osakaShops = shops.filter(shop => {
        const address = shop.address || '';
        const name = shop.name || '';
        // Some names contain addresses (like id 109)
        return address.includes('大阪府') || name.includes('大阪府');
    });

    console.log(`Filtered count (Osaka only): ${osakaShops.length}`);
    console.log(`Removed ${shops.length - osakaShops.length} non-Osaka entries.`);

    const newShopsJson = JSON.stringify(osakaShops, null, 2);
    const newContent = content.replace(shopsMatch[1], newShopsJson);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Successfully updated MockData.ts with Osaka-only data.');
}

run();
