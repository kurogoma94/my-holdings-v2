const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

function run() {
    console.log('--- Current Data Status (MockData.ts) ---');
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    // Extract MOCK_SHOPS array
    const shopsMatch = content.match(/MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('Could not find MOCK_SHOPS array.');
        return;
    }

    const areas = ['umeda', 'fukushima', 'shinsaibashi', 'namba', 'tenma', 'kyobashi', 'abeno', 'tsuruhashi', 'kitahama', 'shinsekai', 'other'];
    const areaCounts = {};
    areas.forEach(a => {
        const regex = new RegExp(`"area":\\s*"${a}"`, 'g');
        areaCounts[a] = (content.match(regex) || []).length;
    });

    const totalCalculated = Object.values(areaCounts).reduce((a, b) => a + b, 0);
    console.log(`Total Shops Found (via area tag): ${totalCalculated}`);

    console.log('\nArea Distribution in MockData.ts:');
    Object.entries(areaCounts).forEach(([area, count]) => {
        if (count > 0 || area === 'fukushima' || area === 'shinsaibashi') {
            console.log(`  - ${area.padEnd(14)}: ${count}`);
        }
    });

    const hasAddress = (content.match(/"address":/g) || []).length;
    const hasPhone = (content.match(/"phone":/g) || []).length;
    const isInactive = (content.match(/"isActive":\s*false/g) || []).length;

    console.log(`\nFields Presence:`);
    console.log(`  - With Address: ${hasAddress}`);
    console.log(`  - With Phone  : ${hasPhone}`);

    // Check refined_data_search.json if it exists
    const REFINED_PATH = path.join(__dirname, 'refined_data_search.json');
    if (fs.existsSync(REFINED_PATH)) {
        console.log('\n--- Refined Data Status (refined_data_search.json) ---');
        const refinedContent = fs.readFileSync(REFINED_PATH, 'utf8');
        const refinedData = JSON.parse(refinedContent);
        console.log(`Total in Refined File: ${refinedData.length}`);
        
        const refinedAreaCounts = {};
        areas.forEach(a => {
            refinedAreaCounts[a] = refinedData.filter(s => s.area === a).length;
        });

        console.log('Area Distribution in Refined File:');
        Object.entries(refinedAreaCounts).forEach(([area, count]) => {
            console.log(`  - ${area.padEnd(12)}: ${count}`);
        });

        const refinedWithAddress = refinedData.filter(s => s.address).length;
        const refinedWithPhone = refinedData.filter(s => s.phone).length;
        console.log(`\nFields Presence in Refined File:`);
        console.log(`  - With Address: ${refinedWithAddress}`);
        console.log(`  - With Phone  : ${refinedWithPhone}`);
    }
}

run();
