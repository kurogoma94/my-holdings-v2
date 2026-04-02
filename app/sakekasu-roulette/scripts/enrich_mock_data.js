const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const GENRE_MAPPING = {
    'tachinomi': ['立ち飲み', '立呑', '角打ち', '立食食'],
    'yakitori': ['焼き鳥', '焼鳥', '鳥料理', '串焼き'],
    'kushikatsu': ['串カツ', '串揚げ'],
    'izakaya': ['居酒屋', '大衆酒場', '割烹', '小料理', 'ダイニングバー'],
    'ramen': ['ラーメン', '餃子', 'つけ麺', 'まぜそば', '中華そば'],
    'yakiniku': ['焼肉', '焼き肉', 'ホルモン', 'ジンギスカン', 'ステーキ'],
    'sushi': ['寿司', '鮨', '海鮮', '刺身', '魚介料理'],
    'bar': ['バー', 'パブ', 'スナック', 'ワインバー', 'ビアバー']
};

function getGenreCode(category) {
    if (!category) return 'other';
    for (const [code, keywords] of Object.entries(GENRE_MAPPING)) {
        if (keywords.some(k => category.includes(k))) {
            return code;
        }
    }
    return 'other';
}

function run() {
    console.log('Phase 1: Extracting attributes from comments...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    // Using a safer match for the array
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        return console.error('Could not find MOCK_SHOPS array in MockData.ts');
    }

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    let updatedCount = 0;

    shops = shops.map(shop => {
        const comment = shop.comment || '';
        // Match format like "4.5(20) 居酒屋"
        const fullMatch = comment.match(/^(\d+\.?\d*)\(\d+\)\s+(.*)$/);
        
        if (fullMatch) {
            const rating = parseFloat(fullMatch[1]);
            const category = fullMatch[2];
            
            shop.rating = rating;
            shop.genre = getGenreCode(category);
            updatedCount++;
        } else if (comment.length > 0 && comment.length < 20) {
            // Check if comment itself is a category (e.g. "うどん")
            const detectedGenre = getGenreCode(comment);
            if (detectedGenre !== 'other') {
                shop.genre = detectedGenre;
                updatedCount++;
            }
        }
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log(`Phase 1 Complete. Updated ${updatedCount} shops.`);
}

run();
