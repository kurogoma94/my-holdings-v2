const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCH_DATA = {
    // Active (Osaka)
    "435": { area: "namba", genre: "other", rating: 3.6, address: "大阪府大阪市中央区高津3-2-30", isActive: true },
    "436": { area: "shinsekai", genre: "sushi", rating: 3.7, address: "大阪府大阪市浪速区恵美須西3-3-26", isActive: true },
    "437": { area: "other", genre: "sushi", rating: 3.8, address: "大阪府八尾市東本町5-10-5", isActive: true },
    "438": { area: "other", genre: "other", rating: 3.5, address: "大阪府大阪市中央区瓦町4-3-10", isActive: true },
    "441": { area: "umeda", genre: "other", rating: 3.5, address: "大阪府大阪市北区茶屋町1-32", isActive: true },
    "442": { area: "abeno", genre: "other", rating: 3.5, address: "大阪府大阪市天王寺区四天王寺1-14-27", isActive: true },
    "443": { area: "umeda", genre: "izakaya", rating: 3.7, address: "大阪府大阪市北区曽根崎2-14-13", isActive: true },
    "444": { area: "shinsaibashi", genre: "other", rating: 3.6, address: "大阪府大阪市中央区南船場1-15-12", isActive: true },
    "445": { area: "namba", genre: "other", rating: 3.7, address: "大阪府大阪市中央区谷町6-3-14", isActive: true },
    "446": { area: "tenma", genre: "sushi", rating: 3.5, address: "大阪府大阪市北区天神橋4-12-7", isActive: true },
    "447": { area: "kyobashi", genre: "tachinomi", rating: 3.6, address: "大阪府大阪市都島区東野田町5-8-19", isActive: true },
    "448": { area: "other", genre: "other", rating: 4.0, address: "大阪府南河内郡千早赤阪村1262-4", isActive: true },
    "449": { area: "tenma", genre: "tachinomi", rating: 3.7, address: "大阪府大阪市北区池田町10-10", isActive: true },
    "452": { area: "shinsaibashi", genre: "izakaya", rating: 3.6, address: "大阪府大阪市中央区南船場2-6-2", isActive: true },
    "453": { area: "other", genre: "other", rating: 4.3, address: "大阪府交野市郡津5-12-5", isActive: true },
    "454": { area: "tsuruhashi", genre: "ramen", rating: 3.7, address: "大阪府大阪市東成区深江南3-20-14", isActive: true },
    "458": { area: "other", genre: "other", rating: 3.4, address: "大阪府豊中市中桜塚2-18-12", isActive: true },
    "462": { area: "tenma", genre: "bar", rating: 3.6, address: "大阪府大阪市北区黒崎町2-2", isActive: true },
    "464": { area: "umeda", genre: "other", rating: 3.5, address: "大阪府大阪市北区角田町9-26", isActive: true },
    "465": { area: "kitahama", genre: "sushi", rating: 3.6, address: "大阪府大阪市中央区内平野町1-2-9", isActive: true },
    
    // Inactive (Non-Osaka)
    "439": { isActive: false },
    "440": { isActive: false },
    "450": { isActive: false },
    "455": { isActive: false },
    "456": { isActive: false },
    "457": { isActive: false },
    "459": { isActive: false },
    "460": { isActive: false },
    "461": { isActive: false },
    "463": { isActive: false }
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

    const existingIds = new Set(shops.map(s => s.id));
    let addedCount = 0;

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
            shops.push({
                id: id,
                name: "鮨はまだ", // This might need a more general lookup if there were more
                area: research.area,
                genre: research.genre,
                budgetMin: 2000, // Default placeholders as in MockData
                budgetMax: 4000,
                comment: "ラードニキが行きたいお店",
                rating: research.rating,
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("鮨はまだ")}`,
                isActive: true,
                createdAt: "2026-04-01",
                address: research.address
            });
            addedCount++;
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
