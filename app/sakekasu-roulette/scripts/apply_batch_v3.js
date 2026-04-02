const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCH_DATA = {
    // Active (Osaka)
    "124": { area: "shinsaibashi", genre: "other", rating: 3.5, address: "大阪府大阪市西区北堀江1-11-6", isActive: true },
    "125": { area: "other", genre: "other", rating: 3.2, address: "大阪府大阪市平野区平野本町2-13-12", isActive: true },
    "126": { area: "namba", genre: "tachinomi", rating: 3.8, address: "大阪府大阪市中央区千日前2-4-12", isActive: true },
    "127": { area: "abeno", genre: "other", rating: 3.4, address: "大阪府大阪市天王寺区悲田院町10-39", isActive: true },
    "128": { area: "tenma", genre: "izakaya", rating: 3.7, address: "大阪府大阪市北区池田町5-1", isActive: true },
    "129": { area: "kitahama", genre: "other", rating: 3.6, address: "大阪府大阪市西区京町堀1-9-17", isActive: true },
    "130": { area: "umeda", genre: "bar", rating: 3.5, address: "大阪府大阪市北区曽根崎2-5-20", isActive: true },
    "134": { area: "tenma", genre: "other", rating: 3.4, address: "大阪府大阪市北区天神橋1-18-9", isActive: true },
    "137": { area: "kyobashi", genre: "other", rating: 3.4, address: "大阪府大阪市都島区東野田町3丁目10-3", isActive: true },
    "138": { area: "kitahama", genre: "other", rating: 3.3, address: "大阪府大阪市中央区谷町4-8-29", isActive: true },
    "139": { area: "tsuruhashi", genre: "sushi", rating: 3.5, address: "大阪府大阪市東成区東小橋3-17-9", isActive: true },
    "140": { area: "kitahama", genre: "izakaya", rating: 3.4, address: "大阪府大阪市中央区北浜1-1-28", isActive: true },
    "141": { area: "other", genre: "other", rating: 3.3, address: "大阪府岸和田市吉井町1-22-16", isActive: true },
    "144": { area: "abeno", genre: "other", rating: 3.7, address: "大阪府大阪市阿倍野区阿倍野筋1-6-1", isActive: true },
    "147": { area: "umeda", genre: "sushi", rating: 3.6, address: "大阪府大阪市北区堂山町5-4", isActive: true },
    "148": { area: "other", genre: "other", rating: 3.5, address: "大阪府大阪市淀川区西三国4-8-19", isActive: true },
    "149": { area: "other", genre: "izakaya", rating: 3.4, address: "大阪府大阪市淀川区十三本町1-7-14", isActive: true },
    "150": { area: "other", genre: "other", rating: 3.2, address: "大阪府守口市大日東町46-8", isActive: true },
    "151": { area: "umeda", genre: "izakaya", rating: 3.5, address: "大阪府大阪市北区梅田1-3-1", isActive: true },
    "153": { area: "namba", genre: "other", rating: 3.4, address: "大阪府大阪市中央区谷町6-17-43", isActive: true },
    "154": { area: "tenma", genre: "other", rating: 3.3, address: "大阪府大阪市北区天神橋3-7-13", isActive: true },
    
    // Inactive (Non-Osaka or Closed)
    "131": { isActive: false },
    "132": { isActive: false },
    "133": { isActive: false },
    "135": { isActive: false },
    "136": { isActive: false },
    "143": { isActive: false },
    "145": { isActive: false },
    "146": { isActive: false },
    "152": { isActive: false }
};

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
    let updatedCount = 0;
    let addedCount = 0;

    const existingIds = new Set(shops.map(s => s.id));

    const PENDING_V3 = JSON.parse(fs.readFileSync(path.join(__dirname, '../scripts/batch_pending_v3.json'), 'utf8')).toSearch;
    const pendingMap = new Map(PENDING_V3.map(p => [p.id, p]));

    shops = shops.map(shop => {
        const research = RESEARCH_DATA[shop.id];
        if (research) {
            shop.area = research.area || shop.area;
            shop.genre = research.genre || shop.genre;
            shop.rating = research.rating || shop.rating;
            shop.address = research.address || shop.address;
            shop.isActive = research.isActive !== undefined ? research.isActive : shop.isActive;
            shop.comment = "ラードニキが行きたいお店";
            updatedCount++;
        }
        return shop;
    });

    // Add missing active ones
    for (const [id, research] of Object.entries(RESEARCH_DATA)) {
        if (!existingIds.has(id) && research.isActive) {
            const pending = pendingMap.get(id);
            if (pending) {
                shops.push({
                    id: id,
                    name: pending.name,
                    area: research.area,
                    genre: research.genre,
                    budgetMin: 2000,
                    budgetMax: 4000,
                    comment: "ラードニキが行きたいお店",
                    rating: research.rating,
                    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pending.name)}`,
                    isActive: true,
                    createdAt: "2026-04-01",
                    address: research.address
                });
                addedCount++;
            }
        }
    }

    console.log(`Updated ${updatedCount} shops. Added ${addedCount} shops.`);

    const updatedJson = JSON.stringify(shops, null, 2);
    let newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);

    // Update MOCK_DATA_UPDATED_AT
    const now = new Date().toISOString();
    newContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${now}';`);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Successfully updated MockData.ts');
}

run();
