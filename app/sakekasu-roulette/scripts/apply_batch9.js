const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_9 = {
    "394": { rating: 3.5, genre: 'sushi' },
    "395": { rating: 3.5, genre: 'other' },
    "396": { rating: 3.4, genre: 'yakitori' },
    "397": { rating: 3.0, genre: 'other', isActive: false },
    "419": { rating: 3.6, genre: 'tachinomi' },
    "420": { rating: 3.5, genre: 'other' },
    "421": { rating: 3.7, genre: 'other' },
    "423": { rating: 3.5, genre: 'other' },
    "424": { rating: 3.5, genre: 'yakiniku' },
    "425": { rating: 3.5, genre: 'other' },
    "426": { rating: 3.5, genre: 'bar' },
    "427": { rating: 3.5, genre: 'other' },
    "428": { rating: 3.7, genre: 'izakaya' },
    "431": { rating: 3.6, genre: 'ramen' },
    "432": { rating: 3.7, genre: 'other' },
    "435": { rating: 3.5, genre: 'other' },
    "438": { rating: 3.5, genre: 'other' },
    "441": { rating: 3.2, genre: 'other' },
    "442": { rating: 3.4, genre: 'other' },
    "444": { rating: 3.5, genre: 'other' },
    "445": { rating: 3.5, genre: 'other' },
    "446": { rating: 3.5, genre: 'sushi' },
    "447": { rating: 3.6, genre: 'tachinomi' },
    "448": { rating: 3.4, genre: 'other' },
    "452": { rating: 3.5, genre: 'izakaya' },
    "453": { rating: 4.2, genre: 'other' },
    "454": { rating: 3.7, genre: 'other' },
    "455": { rating: 4.0, genre: 'other' }
};

function run() {
    console.log('Applying Batch 9 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_BATCH_9[shop.id];
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
    console.log('Batch 9 applied.');
}

run();
