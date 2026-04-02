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

    const targetShops = shops.filter(s => s.genre === 'other' || !s.rating || s.rating === 0);
    console.log(`Total shops in MockData: ${shops.length}`);
    console.log(`Shops needing research (genre other or no rating): ${targetShops.length}`);
    
    // Print first 50 targets
    console.log('--- TARGET LIST (First 50) ---');
    console.log(JSON.stringify(targetShops.slice(0, 50).map(s => ({id: s.id, name: s.name, currentGenre: s.genre, currentRating: s.rating})), null, 2));
}

run();
