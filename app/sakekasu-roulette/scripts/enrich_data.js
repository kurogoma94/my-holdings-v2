const fs = require('fs');

// Area and Genre definitions matching Types.ts
const AREAS = [
  { code: 'tenma', keywords: ['天満', '扇町', '天神橋筋'] },
  { code: 'namba', keywords: ['難波', 'なんば', '道頓堀', '心斎橋', '千日前'] },
  { code: 'tsuruhashi', keywords: ['鶴橋', '桃谷'] },
  { code: 'umeda', keywords: ['梅田', '北新地', '大阪駅', '堂島'] },
  { code: 'shinsekai', keywords: ['新世界', '西成', '通天閣', '動物園前'] },
  { code: 'kyobashi', keywords: ['京橋'] },
  { code: 'abeno', keywords: ['阿倍野', '天王寺'] },
  { code: 'kitahama', keywords: ['北浜', '淀屋橋', '肥後橋'] },
];

const GENRES = [
  { code: 'tachinomi', keywords: ['立ち飲み', '立呑み', '立食', 'スタンド'] },
  { code: 'yakitori', keywords: ['焼き鳥', '焼鳥', '鶏料理', '炭火焼鳥'] },
  { code: 'kushikatsu', keywords: ['串カツ', '串揚げ', '串あげ'] },
  { code: 'izakaya', keywords: ['居酒屋', '酒場', '大衆居酒屋', '炉端'] },
  { code: 'ramen', keywords: ['ラーメン', 'つけ麺', '餃子'] },
  { code: 'yakiniku', keywords: ['焼肉', '焼き肉', '叙々苑', 'ホルモン', 'ジンギスカン'] },
  { code: 'sushi', keywords: ['寿司', '鮨', '海鮮'] },
  { code: 'bar', keywords: ['バー', '角打ち', 'バル', 'Wine Bar'] },
];

// Load data
const rawData = JSON.parse(fs.readFileSync('extracted_restaurants.json', 'utf8'));

// Non-Osaka keywords to filter out
const EXCLUDE_KEYWORDS = ['京都', '兵庫', '滋賀', '三重', '奈良', '和歌山', '徳島', '香川', '愛媛', '高知', '姫路', '淡路', '三宮', '中京区', '下京区', '上京区', '左京区', '右京区', '伏見区'];

const processedData = rawData.filter(item => {
    const combinedText = (item.name + ' ' + item.snippet).toLowerCase();
    // Exclude if it hits an exclude keyword, UNLESS it also explicitly mentions "大阪"
    // (though in practice, "大阪" often appears in Osaka addresses, not Kyoto one)
    const isExcluded = EXCLUDE_KEYWORDS.some(k => combinedText.includes(k));
    const isExplicitlyOsaka = combinedText.includes('大阪');
    
    return !isExcluded || isExplicitlyOsaka;
});

console.log(`Original: ${rawData.length}, After Osaka Filter: ${processedData.length}`);

const shops = processedData.map((item, index) => {
    const { name, url, snippet } = item;
    
    // Default values
    let area = 'other';
    let genre = 'other';
    let rating = 4.0;
    let budgetMin = 2000;
    let budgetMax = 4000;

    // Detect Rating (e.g. 4.7(153))
    const ratingMatch = snippet.match(/(\d\.\d)\(\d+,?\d*\)/);
    if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]);
    }

    // Detect Budget (e.g. ￥1,000～2,000)
    const budgetMatch = snippet.match(/￥([\d,]+)～([\d,]+)/);
    if (budgetMatch) {
        budgetMin = parseInt(budgetMatch[1].replace(/,/g, ''));
        budgetMax = parseInt(budgetMatch[2].replace(/,/g, ''));
    } else if (snippet.includes('￥10,000 以上')) {
        budgetMin = 10000;
        budgetMax = 20000;
    } else if (snippet.includes('￥1～1,000')) {
        budgetMin = 500;
        budgetMax = 1000;
    }

    // Detect Area
    for (const a of AREAS) {
        if (a.keywords.some(k => name.includes(k) || snippet.includes(k))) {
            area = a.code;
            break;
        }
    }

    // Detect Genre
    for (const g of GENRES) {
        if (g.keywords.some(k => name.includes(k) || snippet.includes(k))) {
            genre = g.code;
            break;
        }
    }

    // Extra mapping for specific genres in snippet
    if (genre === 'other') {
        if (snippet.includes('寿司') || snippet.includes('鮨')) genre = 'sushi';
        if (snippet.includes('居酒屋')) genre = 'izakaya';
        if (snippet.includes('ラーメン') || snippet.includes('中華そば')) genre = 'ramen';
        if (snippet.includes('焼肉') || snippet.includes('焼き肉')) genre = 'yakiniku';
        if (snippet.includes('バー') || snippet.includes('バル')) genre = 'bar';
    }

    // Create comments based on snippet
    const comment = snippet.split(' · ')[1] || snippet.replace(name, '').trim() || 'Takahiroおすすめの店舗。';

    return {
        id: (index + 1).toString(),
        name: name,
        area: area,
        genre: genre,
        budgetMin: budgetMin,
        budgetMax: budgetMax,
        comment: comment.substring(0, 40),
        rating: rating,
        googleMapsUrl: url,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
    };
});

// Generate MockData.ts content with versioning support
const fileHeader = `// [目的] 開発用のモック店舗データ（将来的にFirestoreに移行）
import { Shop } from './Types';

export const MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}';
export const MOCK_SHOPS: Shop[] = `;

const fileContent = fileHeader + JSON.stringify(shops, null, 2) + ';\n';

fs.writeFileSync('../src/constants/MockData.ts', fileContent);
console.log(`Successfully generated MockData.ts with ${shops.length} shops.`);

// Save excluded data separately just in case
const excludedRaw = rawData.filter(item => !processedData.includes(item));
fs.writeFileSync('excluded_restaurants.json', JSON.stringify(excludedRaw, null, 2));
console.log(`Excluded ${excludedRaw.length} locations to excluded_restaurants.json`);
