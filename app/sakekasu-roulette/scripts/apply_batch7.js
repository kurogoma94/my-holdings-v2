const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_7 = {
    "270": { rating: 3.8, genre: 'bar' },
    "271": { rating: 3.8, genre: 'sushi' },
    "273": { rating: 3.7, genre: 'izakaya' },
    "274": { rating: 4.0, genre: 'izakaya' },
    "277": { rating: 3.7, genre: 'other' },
    "278": { rating: 3.3, genre: 'bar' },
    "279": { rating: 3.7, genre: 'other' },
    "280": { rating: 3.8, genre: 'other' },
    "281": { rating: 3.8, genre: 'izakaya' },
    "282": { rating: 4.0, genre: 'izakaya' },
    "284": { rating: 3.5, genre: 'izakaya' },
    "285": { rating: 3.6, genre: 'other' },
    "286": { rating: 3.7, genre: 'ramen' },
    "288": { rating: 3.7, genre: 'ramen' },
    "290": { rating: 3.6, genre: 'other' },
    "316": { rating: 3.7, genre: 'other' },
    "318": { rating: 3.6, genre: 'ramen' },
    "319": { rating: 3.8, genre: 'bar' },
    "322": { rating: 3.2, genre: 'other', isActive: false },
    "325": { rating: 3.3, genre: 'izakaya' },
    "327": { rating: 3.5, genre: 'ramen' },
    "328": { rating: 3.6, genre: 'other' },
    "330": { rating: 4.0, genre: 'tachinomi' },
    "332": { rating: 3.3, genre: 'bar' },
    "333": { rating: 3.5, genre: 'bar' },
    "334": { rating: 3.5, genre: 'other', isActive: false },
    "335": { rating: 3.5, genre: 'sushi' }
};

function run() {
    console.log('Applying Batch 7 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_BATCH_7[shop.id];
        if (data) {
            shop.rating = data.rating;
            shop.genre = data.genre;
            if (data.isActive !== undefined) {
                shop.isActive = data.isActive;
            }
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Batch 7 applied.');
}

run();
