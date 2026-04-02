const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_2 = {
    "4": { rating: 3.5, genre: 'other' },
    "8": { rating: 3.4, genre: 'other' },
    "10": { rating: 3.3, genre: 'other' },
    "11": { rating: 4.6, genre: 'other' },
    "13": { rating: 3.8, genre: 'other' },
    "14": { rating: 3.5, genre: 'other' },
    "19": { rating: 4.1, genre: 'other' },
    "23": { rating: 3.5, genre: 'izakaya' },
    "24": { rating: 3.4, genre: 'ramen' },
    "27": { rating: 3.7, genre: 'other' },
    "38": { rating: 3.4, genre: 'other' },
    "39": { rating: 3.8, genre: 'other' },
    "46": { rating: 3.2, genre: 'other' },
    "50": { rating: 3.6, genre: 'other' },
    "53": { rating: 3.4, genre: 'other' },
    "62": { rating: 3.4, genre: 'other' },
    "63": { rating: 3.2, genre: 'other' },
    "65": { rating: 3.2, genre: 'other' },
    "71": { rating: 3.4, genre: 'other' },
    "88": { rating: 3.2, genre: 'other' },
    "94": { rating: 3.5, genre: 'other' },
    "99": { rating: 3.7, genre: 'other' },
    "102": { rating: 3.1, genre: 'bar' },
    "103": { rating: 3.7, genre: 'other' },
    "109": { rating: 3.8, genre: 'izakaya' },
    "142": { rating: 4.0, genre: 'other' },
    "188": { rating: 3.3, genre: 'tachinomi' },
    "237": { rating: 3.5, genre: 'izakaya' },
    "342": { rating: 3.2, genre: 'izakaya' },
    "352": { rating: 4.0, genre: 'other' }
};

function run() {
    console.log('Applying Batch 2 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        if (RESEARCHED_BATCH_2[shop.id]) {
            shop.rating = RESEARCHED_BATCH_2[shop.id].rating;
            shop.genre = RESEARCHED_BATCH_2[shop.id].genre;
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Batch 2 applied.');
}

run();
