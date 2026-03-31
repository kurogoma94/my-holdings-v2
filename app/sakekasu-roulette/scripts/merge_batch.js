const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const BATCH_FILENAME = process.argv[2] || 'refined_data_batch1.json';
const BATCH_FILE = path.join(__dirname, `../${BATCH_FILENAME}`);

function run() {
    if (!fs.existsSync(BATCH_FILE)) {
        console.error('Batch file not found.');
        return;
    }

    const refinedShops = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'));
    let mockContent = fs.readFileSync(MOCK_DATA_PATH, 'utf8');

    // Extract current MOCK_SHOPS
    const shopsMatch = mockContent.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('Could not find MOCK_SHOPS array in MockData.ts');
        return;
    }

    let allShops = JSON.parse(shopsMatch[1]);
    let updatedCount = 0;

    refinedShops.forEach(refined => {
        const index = allShops.findIndex(s => s.id === refined.id);
        if (index !== -1) {
            allShops[index] = { ...allShops[index], ...refined };
            updatedCount++;
        }
    });

    const newShopsJson = JSON.stringify(allShops, null, 2);
    const newContent = mockContent.replace(shopsMatch[1], newShopsJson)
                                    .replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}';`);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log(`Successfully merged ${updatedCount} shops into MockData.ts`);
}

run();
