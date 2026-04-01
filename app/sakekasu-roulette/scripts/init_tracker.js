const fs = require('fs');
const path = require('path');

const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');

function run() {
    const master = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('Could not parse MockData.ts');
        process.exit(1);
    }
    const current = JSON.parse(shopsMatch[1]);
    const currentIds = new Set(current.map(s => s.id));
    const excluded = master.filter(s => !currentIds.has(s.id));
    
    fs.writeFileSync(TRACKER_PATH, JSON.stringify({
        nextIndex: 0,
        total: excluded.length,
        excludedIds: excluded.map(s => s.id)
    }, null, 2));
    
    console.log(`Tracker initialized with ${excluded.length} excluded items.`);
}

run();
