const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_11 = {
    "516": { rating: 3.4, genre: 'ramen' },
    "517": { rating: 3.5, genre: 'other' },
    "518": { rating: 3.0, genre: 'other', isActive: false },
    "520": { rating: 3.3, genre: 'ramen' },
    "521": { rating: 4.0, genre: 'izakaya' },
    "522": { rating: 3.5, genre: 'other' },
    "524": { rating: 3.6, genre: 'other' },
    "526": { rating: 3.6, genre: 'sushi' },
    "527": { rating: 3.4, genre: 'other' },
    "528": { rating: 3.0, genre: 'bar' },
    "529": { rating: 3.6, genre: 'sushi' },
    "531": { rating: 3.2, genre: 'yakiniku' },
    "534": { rating: 3.8, genre: 'other' },
    "536": { rating: 3.6, genre: 'bar' },
    "538": { rating: 3.7, genre: 'izakaya' },
    "539": { rating: 3.2, genre: 'other' },
    "540": { rating: 3.2, genre: 'other' },
    "542": { rating: 3.7, genre: 'tachinomi' },
    "543": { rating: 3.7, genre: 'bar' },
    "544": { rating: 3.2, genre: 'sushi' },
    "545": { rating: 3.2, genre: 'other' },
    "546": { rating: 3.6, genre: 'izakaya' },
    "551": { rating: 3.5, genre: 'other' },
    "555": { rating: 3.8, genre: 'sushi' },
    "557": { rating: 3.6, genre: 'yakiniku' },
    "560": { rating: 3.8, genre: 'yakitori' }
};

function run() {
    console.log('Applying Batch 11 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_BATCH_11[shop.id];
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
    console.log('Batch 11 applied.');
}

run();
