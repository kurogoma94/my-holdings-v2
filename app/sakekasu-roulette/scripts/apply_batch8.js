const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_8 = {
    "339": { rating: 4.1, genre: 'izakaya' },
    "340": { rating: 3.6, genre: 'izakaya' },
    "341": { rating: 4.1, genre: 'bar' },
    "344": { rating: 3.7, genre: 'other' },
    "347": { rating: 4.2, genre: 'yakiniku' },
    "349": { rating: 4.0, genre: 'sushi' },
    "350": { rating: 4.1, genre: 'other' },
    "351": { rating: 3.5, genre: 'other' },
    "353": { rating: 3.5, genre: 'ramen' },
    "356": { rating: 3.7, genre: 'tachinomi' },
    "357": { rating: 3.3, genre: 'bar' },
    "358": { rating: 4.0, genre: 'sushi' },
    "360": { rating: 3.9, genre: 'other' },
    "361": { rating: 3.7, genre: 'other' },
    "362": { rating: 3.7, genre: 'other' },
    "366": { rating: 3.0, genre: 'other', isActive: false },
    "367": { rating: 3.9, genre: 'izakaya' },
    "369": { rating: 3.9, genre: 'izakaya' },
    "375": { rating: 3.1, genre: 'tachinomi' },
    "377": { rating: 3.6, genre: 'other' },
    "379": { rating: 3.8, genre: 'ramen' },
    "381": { rating: 3.2, genre: 'izakaya' },
    "384": { rating: 3.2, genre: 'yakiniku' },
    "385": { rating: 3.3, genre: 'izakaya' },
    "386": { rating: 3.5, genre: 'other' },
    "390": { rating: 4.0, genre: 'other' },
    "392": { rating: 3.2, genre: 'tachinomi' }
};

function run() {
    console.log('Applying Batch 8 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_BATCH_8[shop.id];
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
    console.log('Batch 8 applied.');
}

run();
