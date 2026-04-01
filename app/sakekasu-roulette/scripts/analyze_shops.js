const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

function run() {
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('No match');
        return;
    }
    const shops = JSON.parse(shopsMatch[1]);
    const list = shops.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        area: s.area
    }));
    console.log(JSON.stringify(list, null, 2));
}

run();
