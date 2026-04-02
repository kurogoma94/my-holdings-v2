const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_3 = {
    "51": { rating: 4.0, genre: 'sushi' },
    "54": { rating: 3.5, genre: 'sushi' },
    "64": { rating: 3.7, genre: 'other' },
    "67": { rating: 3.4, genre: 'izakaya' },
    "117": { rating: 3.6, genre: 'yakiniku' },
    "118": { rating: 3.3, genre: 'other' },
    "119": { rating: 3.8, genre: 'yakiniku' },
    "120": { rating: 3.5, genre: 'izakaya' },
    "122": { rating: 3.2, genre: 'yakiniku' },
    "123": { rating: 3.2, genre: 'other' },
    "126": { rating: 3.7, genre: 'tachinomi' },
    "128": { rating: 3.6, genre: 'other' },
    "129": { rating: 3.7, genre: 'other' },
    "133": { rating: 3.4, genre: 'yakiniku' },
    "134": { rating: 3.2, genre: 'other' },
    "136": { rating: 3.5, genre: 'other' },
    "137": { rating: 3.3, genre: 'other' },
    "140": { rating: 3.5, genre: 'kushikatsu' },
    "141": { rating: 3.3, genre: 'sushi' },
    "144": { rating: 3.7, genre: 'other' },
    "146": { rating: 3.3, genre: 'yakitori' },
    "147": { rating: 3.3, genre: 'yakitori' },
    "148": { rating: 3.5, genre: 'yakitori' },
    "149": { rating: 4.2, genre: 'yakitori' },
    "150": { rating: 4.1, genre: 'yakitori' },
    "151": { rating: 4.2, genre: 'yakitori' },
    "152": { rating: 3.8, genre: 'yakitori' },
    "153": { rating: 4.1, genre: 'yakitori' },
    "154": { rating: 3.5, genre: 'yakitori' },
    "155": { rating: 4.2, genre: 'yakitori' }
};

function run() {
    console.log('Applying Batch 3 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        if (RESEARCHED_BATCH_3[shop.id]) {
            shop.rating = RESEARCHED_BATCH_3[shop.id].rating;
            shop.genre = RESEARCHED_BATCH_3[shop.id].genre;
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Batch 3 applied.');
}

run();
