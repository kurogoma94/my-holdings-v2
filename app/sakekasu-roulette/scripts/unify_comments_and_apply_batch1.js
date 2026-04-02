const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const GENRE_MAPPING = {
    'tachinomi': ['立ち飲み', '立呑', '角打ち', '立食式', '立ち呑み'],
    'yakitori': ['焼き鳥', '焼鳥', '鳥料理', '串焼き'],
    'kushikatsu': ['串カツ', '串揚げ'],
    'izakaya': ['居酒屋', '大衆酒場', '割烹', '小料理', 'ダイニングバー', 'バル'],
    'ramen': ['ラーメン', '餃子', 'つけ麺', 'まぜそば', '中華そば', '中華料理'],
    'yakiniku': ['焼肉', '焼き肉', 'ホルモン', 'ジンギスカン', 'ステーキ', 'バーベキュー'],
    'sushi': ['寿司', '鮨', '海鮮', '刺身', '魚介料理', 'かに'],
    'bar': ['バー', 'パブ', 'スナック', 'ワインバー', 'ビアバー', 'コーヒー']
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

const RESEARCHED_BATCH_1 = {
    "1": { rating: 3.8, genre: 'yakiniku' },
    "4": { rating: 3.9, genre: 'other' },
    "8": { rating: 4.5, genre: 'other' },
    "10": { rating: 3.5, genre: 'other' },
    "11": { rating: 5.0, genre: 'other' },
    "12": { rating: 4.0, genre: 'sushi' },
    "13": { rating: 3.8, genre: 'other' },
    "14": { rating: 3.5, genre: 'other' },
    "17": { rating: 3.7, genre: 'ramen' },
    "19": { rating: 4.1, genre: 'other' },
    "23": { rating: 4.1, genre: 'other' },
    "24": { rating: 3.3, genre: 'other' },
    "27": { rating: 3.8, genre: 'other' },
    "28": { rating: 3.8, genre: 'bar' },
    "32": { rating: 3.3, genre: 'izakaya' },
    "33": { rating: 4.0, genre: 'sushi' },
    "38": { rating: 3.5, genre: 'other' },
    "39": { rating: 4.0, genre: 'other' },
    "46": { rating: 3.7, genre: 'other' },
    "48": { rating: 4.2, genre: 'yakiniku' },
    "50": { rating: 4.6, genre: 'other' },
    "52": { rating: 3.6, genre: 'izakaya' },
    "53": { rating: 3.6, genre: 'other' },
    "60": { rating: 3.2, genre: 'sushi' },
    "62": { rating: 3.7, genre: 'other' },
    "63": { rating: 3.2, genre: 'other' },
    "65": { rating: 4.0, genre: 'other' },
    "69": { rating: 3.8, genre: 'sushi' },
    "71": { rating: 4.0, genre: 'other' },
    "85": { rating: 3.7, genre: 'izakaya' }
};

function run() {
    console.log('Global Update: Syncing comments and applying batch 1 research...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) return console.error('Failed to parse');

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    shops = shops.map(shop => {
        // 1. If in research batch, apply research data
        if (RESEARCHED_BATCH_1[shop.id]) {
            shop.rating = RESEARCHED_BATCH_1[shop.id].rating;
            shop.genre = RESEARCHED_BATCH_1[shop.id].genre;
        } else {
            // 2. Otherwise, extract from comment if available (Phase 1 logic)
            const comment = shop.comment || '';
            const fullMatch = comment.match(/^(\d+\.?\d*)\(\d+\)\s+(.*)$/);
            if (fullMatch) {
                shop.rating = parseFloat(fullMatch[1]);
                shop.genre = getGenreCode(fullMatch[2]);
            } else if (comment.length > 0 && comment.length < 20 && comment !== 'ラードニキが行きたいお店') {
                const detectedGenre = getGenreCode(comment);
                if (detectedGenre !== 'other') {
                    shop.genre = detectedGenre;
                }
            }
        }
        
        // 3. Update comment to the new uniform string
        shop.comment = "ラードニキが行きたいお店";
        return shop;
    });

    const updatedJson = JSON.stringify(shops, null, 2);
    const newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Comments unified and attributes updated for Batch 1.');
}

run();
