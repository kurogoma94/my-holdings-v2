const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

function run() {
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    const shops = JSON.parse(jsonText);

    // Dynamic target identification:
    // 1. rating is 4 (default for salvaged) or 0/null/undefined
    // 2. genre is 'other'
    // 3. (Optional) We can check if the comment is unified.
    
    // Actually, some shops were 'other' in the original data too.
    // Let's refine targets to those that REALLY need research:
    // - Salvaged ones (IDs > 200 usually, but let's check values)
    const targets = shops.filter(s => {
        // If rating is exactly 4.0 and genre is other, it's likely a salvaged shop not yet researched.
        // If rating is 0, it's definitely un-researched.
        return (s.rating === 4 && s.genre === 'other') || !s.rating;
    });
    
    console.log(`Remaining research targets: ${targets.length}`);
    console.log('--- NEXT TARGETS (Batch 6) ---');
    console.log(JSON.stringify(targets.slice(0, 30).map(s => ({id: s.id, name: s.name})), null, 2));
}

run();
