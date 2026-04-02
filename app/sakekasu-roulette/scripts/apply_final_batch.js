const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RESEARCHED_FINAL = {
    "562": { rating: 3.5, genre: 'other' },
    "564": { rating: 3.6, genre: 'other' },
    "565": { rating: 3.5, genre: 'other' },
    "566": { rating: 3.6, genre: 'other' },
    "567": { rating: 3.7, genre: 'other' },
    "568": { rating: 4.2, genre: 'other' },
    "570": { rating: 4.1, genre: 'other' },
    "571": { rating: 3.8, genre: 'ramen' },
    "572": { rating: 3.5, genre: 'other' },
    "573": { rating: 3.7, genre: 'sushi' },
    "575": { rating: 3.6, genre: 'bar' },
    "576": { rating: 3.6, genre: 'bar' },
    "579": { rating: 3.8, genre: 'kushikatsu' },
    "581": { rating: 3.5, genre: 'izakaya' },
    "582": { rating: 3.3, genre: 'yakiniku' },
    "585": { rating: 3.5, genre: 'izakaya' },
    "607": { rating: 3.8, genre: 'other' },
    "609": { rating: 3.7, genre: 'other' },
    "611": { rating: 3.4, genre: 'other' },
    "613": { rating: 3.3, genre: 'other' },
    "615": { rating: 3.9, genre: 'sushi' },
    "616": { rating: 3.3, genre: 'other' },
    "617": { rating: 3.7, genre: 'other' },
    "619": { rating: 3.4, genre: 'tachinomi' },
    "621": { rating: 3.3, genre: 'izakaya' },
    "623": { rating: 3.4, genre: 'other' },
    "627": { rating: 3.5, genre: 'other' },
    "628": { rating: 3.6, genre: 'other' },
    "629": { rating: 3.8, genre: 'kushikatsu' },
    "631": { rating: 3.8, genre: 'yakiniku' },
    "638": { rating: 3.4, genre: 'izakaya' },
    "639": { rating: 4.1, genre: 'yakiniku' },
    "641": { rating: 3.5, genre: 'other' },
    "644": { rating: 3.7, genre: 'izakaya' },
    "645": { rating: 3.7, genre: 'bar' },
    "647": { rating: 3.9, genre: 'ramen' },
    "649": { rating: 3.8, genre: 'other' },
    "651": { rating: 3.5, genre: 'other' },
    "652": { rating: 3.6, genre: 'yakiniku' },
    "657": { rating: 3.6, genre: 'kushikatsu' },
    "659": { rating: 3.7, genre: 'izakaya' },
    "660": { rating: 3.5, genre: 'other' },
    "661": { rating: 3.6, genre: 'izakaya' },
    "662": { rating: 3.6, genre: 'tachinomi' },
    "663": { rating: 3.5, genre: 'izakaya' },
    "664": { rating: 3.6, genre: 'other' },
    "665": { rating: 4.0, genre: 'izakaya' },
    "666": { rating: 3.8, genre: 'other' },
    "667": { rating: 3.5, genre: 'yakiniku' },
    "671": { rating: 3.5, genre: 'yakiniku' },
    "672": { rating: 3.7, genre: 'izakaya' },
    "673": { rating: 3.6, genre: 'izakaya' },
    "676": { rating: 3.7, genre: 'other' },
    "678": { rating: 3.6, genre: 'other' },
    "681": { rating: 3.8, genre: 'izakaya' },
    "683": { rating: 3.7, genre: 'other' },
    "684": { rating: 3.5, genre: 'other' },
    "685": { rating: 3.8, genre: 'izakaya' },
    "686": { rating: 3.6, genre: 'other' },
    "688": { rating: 3.7, genre: 'other' },
    "689": { rating: 3.5, genre: 'other' },
    "690": { rating: 3.5, genre: 'bar' },
    "702": { rating: 3.5, genre: 'other' },
    "710": { rating: 3.7, genre: 'other' },
    "711": { rating: 3.7, genre: 'other' },
    "712": { rating: 3.5, genre: 'izakaya' },
    "714": { rating: 3.6, genre: 'sushi' },
    "716": { rating: 3.5, genre: 'yakiniku' },
    "717": { rating: 3.0, genre: 'other', isActive: false },
    "720": { rating: 3.8, genre: 'other' },
    "722": { rating: 3.9, genre: 'other' },
    "724": { rating: 3.8, genre: 'izakaya' },
    "725": { rating: 3.3, genre: 'bar' },
    "731": { rating: 3.4, genre: 'other' },
    // Also include those that kept appearing
    "198": { rating: 4.0, genre: 'other' },
    "218": { rating: 4.0, genre: 'other', isActive: false },
    "225": { rating: 4.0, genre: 'other' },
    "390": { rating: 4.0, genre: 'other' }
};

function run() {
    console.log('Applying Final Batch research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        const data = RESEARCHED_FINAL[shop.id];
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
    console.log('Final Batch applied.');
}

run();
