const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_4 = {
    "156": { rating: 3.5, genre: 'izakaya' },
    "157": { rating: 3.3, genre: 'other' },
    "158": { rating: 3.3, genre: 'other' },
    "169": { rating: 3.2, genre: 'yakitori' },
    "170": { rating: 3.5, genre: 'other' },
    "171": { rating: 3.7, genre: 'ramen' },
    "172": { rating: 3.4, genre: 'ramen' },
    "173": { rating: 3.6, genre: 'other' },
    "175": { rating: 3.8, genre: 'yakitori' },
    "176": { rating: 4.1, genre: 'yakitori' },
    "177": { rating: 4.0, genre: 'yakitori' },
    "178": { rating: 3.5, genre: 'yakitori' },
    "179": { rating: 3.5, genre: 'yakitori' },
    "180": { rating: 3.5, genre: 'yakitori' },
    "181": { rating: 3.5, genre: 'yakitori' },
    "182": { rating: 4.2, genre: 'yakiniku' },
    "183": { rating: 3.3, genre: 'yakitori' },
    "184": { rating: 3.7, genre: 'yakitori' },
    "185": { rating: 3.3, genre: 'yakitori' }
};

function run() {
    console.log('Applying Batch 4 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        if (RESEARCHED_BATCH_4[shop.id]) {
            shop.rating = RESEARCHED_BATCH_4[shop.id].rating;
            shop.genre = RESEARCHED_BATCH_4[shop.id].genre;
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Batch 4 applied.');
}

run();
