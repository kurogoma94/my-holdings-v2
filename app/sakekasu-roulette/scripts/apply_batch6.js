const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_BATCH_6 = {
    "142": { rating: 3.5, genre: 'other' },
    "352": { rating: 4.2, genre: 'other' },
    "372": { rating: 3.5, genre: 'other' },
    "198": { rating: 4.0, genre: 'other' },
    "214": { rating: 3.6, genre: 'ramen' },
    "215": { rating: 4.1, genre: 'yakiniku' },
    "217": { rating: 3.8, genre: 'other' },
    "218": { rating: 4.0, genre: 'other', isActive: false },
    "219": { rating: 3.5, genre: 'other' },
    "220": { rating: 3.5, genre: 'other' },
    "222": { rating: 3.7, genre: 'bar' },
    "223": { rating: 3.7, genre: 'other' },
    "225": { rating: 4.0, genre: 'other' },
    "226": { rating: 4.2, genre: 'other' },
    "228": { rating: 3.5, genre: 'bar' },
    "229": { rating: 4.0, genre: 'sushi' },
    "230": { rating: 3.7, genre: 'sushi' },
    "232": { rating: 4.2, genre: 'other' },
    "233": { rating: 3.7, genre: 'izakaya' },
    "234": { rating: 3.6, genre: 'izakaya' },
    "236": { rating: 3.7, genre: 'other' },
    "238": { rating: 3.7, genre: 'other' },
    "243": { rating: 3.5, genre: 'izakaya' },
    "244": { rating: 3.3, genre: 'other' },
    "247": { rating: 3.3, genre: 'yakiniku' },
    "258": { rating: 3.5, genre: 'izakaya' },
    "261": { rating: 3.3, genre: 'other' },
    "263": { rating: 3.5, genre: 'izakaya' },
    "266": { rating: 3.5, genre: 'other' },
    "267": { rating: 3.0, genre: 'other', isActive: false }
};

function run() {
    console.log('Applying Batch 6 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_BATCH_6[shop.id];
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
    console.log('Batch 6 applied.');
}

run();
