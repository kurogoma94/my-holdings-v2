const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_5 = {
    "26": { rating: 4.0, genre: 'kushikatsu' },
    "68": { rating: 3.8, genre: 'other' },
    "88": { rating: 3.5, genre: 'izakaya' },
    "354": { rating: 4.1, genre: 'yakiniku' },
    "372": { rating: 4.0, genre: 'other' },
    "430": { rating: 3.9, genre: 'izakaya' },
    "451": { rating: 3.6, genre: 'ramen' },
    "511": { rating: 3.6, genre: 'izakaya' },
    "559": { rating: 3.3, genre: 'sushi' },
    "578": { rating: 4.0, genre: 'kushikatsu' },
    "580": { rating: 3.5, genre: 'other' },
    "584": { rating: 4.0, genre: 'sushi' },
    "626": { rating: 3.5, genre: 'yakiniku' },
    "630": { rating: 3.8, genre: 'sushi' },
    "677": { rating: 3.8, genre: 'other' },
    "709": { rating: 3.2, genre: 'other' },
    "719": { rating: 3.4, genre: 'yakiniku' },
    "130": { rating: 3.3, genre: 'bar' },
    "139": { rating: 3.8, genre: 'sushi' },
    "174": { rating: 3.5, genre: 'sushi' },
    "186": { rating: 3.5, genre: 'other' },
    "187": { rating: 3.5, genre: 'tachinomi' },
    "190": { rating: 3.5, genre: 'tachinomi' },
    "193": { rating: 4.0, genre: 'izakaya' },
    "196": { rating: 3.7, genre: 'other' },
    "197": { rating: 3.5, genre: 'other' },
    "198": { rating: 4.0, genre: 'other' },
    "200": { rating: 3.8, genre: 'sushi' },
    "203": { rating: 3.8, genre: 'tachinomi' },
    "205": { rating: 3.5, genre: 'other' }
};

function run() {
    console.log('Applying Batch 5 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        if (RESEARCHED_BATCH_5[shop.id]) {
            shop.rating = RESEARCHED_BATCH_5[shop.id].rating;
            shop.genre = RESEARCHED_BATCH_5[shop.id].genre;
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Batch 5 applied.');
}

run();
