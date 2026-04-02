const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_10 = {
    "458": { rating: 3.6, genre: 'other' },
    "462": { rating: 3.5, genre: 'bar' },
    "464": { rating: 3.5, genre: 'ramen' },
    "466": { rating: 3.6, genre: 'other' },
    "467": { rating: 3.7, genre: 'other' },
    "468": { rating: 3.8, genre: 'other' },
    "471": { rating: 3.7, genre: 'kushikatsu' },
    "475": { rating: 3.4, genre: 'tachinomi' },
    "478": { rating: 3.5, genre: 'bar' },
    "479": { rating: 3.5, genre: 'other' },
    "481": { rating: 3.5, genre: 'other' },
    "482": { rating: 3.7, genre: 'other' },
    "483": { rating: 3.3, genre: 'izakaya' },
    "484": { rating: 3.3, genre: 'other' },
    "491": { rating: 3.3, genre: 'ramen' },
    "492": { rating: 3.5, genre: 'sushi' },
    "493": { rating: 3.7, genre: 'yakiniku' },
    "494": { rating: 3.2, genre: 'tachinomi' },
    "499": { rating: 3.5, genre: 'ramen' },
    "500": { rating: 3.4, genre: 'ramen' },
    "503": { rating: 3.5, genre: 'ramen' },
    "504": { rating: 3.8, genre: 'yakiniku' },
    "506": { rating: 3.0, genre: 'other', isActive: false },
    "507": { rating: 3.6, genre: 'other' },
    "510": { rating: 3.4, genre: 'izakaya' },
    "514": { rating: 3.7, genre: 'other' }
};

function run() {
    console.log('Applying Batch 10 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_BATCH_10[shop.id];
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
    console.log('Batch 10 applied.');
}

run();
