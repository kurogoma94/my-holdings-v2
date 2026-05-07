const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const EXTRACTED_PATH = path.join(__dirname, '../extracted_restaurants.json');

// 1. Read existing MockData.ts
let mockDataContent = fs.readFileSync(MOCK_DATA_PATH, 'utf-8');

// Extract the array using regex
const arrayMatch = mockDataContent.match(/export const MOCK_SHOPS:\s*Shop\[\]\s*=\s*(\[[\s\S]*?\])\s*;/);
if (!arrayMatch) {
    console.error("Could not find MOCK_SHOPS array in MockData.ts");
    process.exit(1);
}

const existingShopsArrayString = arrayMatch[1]
    .replace(/""dinnerBudgetMin":/g, '"dinnerBudgetMin":')
    .replace(/""lunchBudgetMin":/g, '"lunchBudgetMin":')
    .replace(/""dinnerBudgetMax":/g, '"dinnerBudgetMax":')
    .replace(/""lunchBudgetMax":/g, '"lunchBudgetMax":');
let existingShops = [];
try {
    // We use Function instead of JSON.parse because it's JS object notation (though it looks like JSON)
    existingShops = new Function('return ' + existingShopsArrayString)();
} catch (e) {
    console.error("Error parsing existing MOCK_SHOPS", e);
    process.exit(1);
}

// 2. Read new extracted data
const extractedData = JSON.parse(fs.readFileSync(EXTRACTED_PATH, 'utf-8'));

const existingShopNames = new Set(existingShops.map(s => s.name));
const newShopNames = new Set(extractedData.map(s => s.name));

let addedCount = 0;
let deactivatedCount = 0;

// Add new shops
for (const shop of extractedData) {
    if (!existingShopNames.has(shop.name)) {
        // Find highest ID
        const maxId = existingShops.reduce((max, s) => Math.max(max, parseInt(s.id, 10)), 0);
        
        let rating = null;
        let comment = shop.snippet || '';
        
        // Try to parse rating from snippet (e.g. "4.1(491)")
        const ratingMatch = shop.snippet.match(/(\d\.\d)\(\d+\)/);
        if (ratingMatch) {
            rating = parseFloat(ratingMatch[1]);
        }
        
        existingShops.push({
            id: String(maxId + 1),
            name: shop.name,
            area: "other", // Default
            genre: "other", // Default
            rating: rating || 0,
            googleMapsUrl: shop.url,
            comment: comment,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0]
        });
        existingShopNames.add(shop.name);
        addedCount++;
    }
}

// Mark shops not in new list as inactive
for (const shop of existingShops) {
    if (!newShopNames.has(shop.name) && shop.isActive !== false) {
        shop.isActive = false;
        deactivatedCount++;
    } else if (newShopNames.has(shop.name) && shop.isActive === false) {
        // Reactivate if it was in the list again
        shop.isActive = true;
    }
}

// 3. Write back to MockData.ts
const updatedShopsString = JSON.stringify(existingShops, null, 2).replace(/"([^"]+)":/g, '"$1":'); 
// We can just format it nicely. JSON.stringify works since TypeScript accepts JSON for objects.

// Update the updatedAt timestamp
const timestamp = new Date().toISOString();
mockDataContent = mockDataContent.replace(
    /export const MOCK_DATA_UPDATED_AT = '[^']+';/,
    `export const MOCK_DATA_UPDATED_AT = '${timestamp}';`
);

// Replace array
mockDataContent = mockDataContent.replace(
    /export const MOCK_SHOPS:\s*Shop\[\]\s*=\s*\[[\s\S]*?\]\s*;/,
    `export const MOCK_SHOPS: Shop[] = ${updatedShopsString};`
);

fs.writeFileSync(MOCK_DATA_PATH, mockDataContent, 'utf-8');

console.log(`Successfully merged. Added: ${addedCount}, Deactivated: ${deactivatedCount}. Total shops: ${existingShops.length}`);
