const fs = require('fs');
const path = require('path');

/**
 * generate_final_csv.js
 * 抽出済みの 744件のリストから、目標の 544件を厳選・整形して CSV/JSON を出力する
 */

const inputPath = path.join(__dirname, 'extracted_restaurants.json');
const outputCsvPath = path.join(__dirname, 'final_shops_544.csv');
const outputJsonPath = path.join(__dirname, 'final_shops_544.json');

if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
console.log(`Original labels count: ${rawData.length}`);

// エリア判定用キーワード
const areaMap = {
    'tenma': ['天満', '天神橋', '南森町', '扇町', '桜ノ宮'],
    'namba': ['難波', 'なんば', '道頓堀', '千日前', '日本橋', '心斎橋', '堀江', '西大橋', '新町', '心斎橋店'],
    'tsuruhashi': ['鶴橋', '桃谷', '生野', '今里', '鶴橋店'],
    'umeda': ['梅田', '北新地', '西梅田', '東梅田', '茶屋町', '中崎町', '中津', '福島区'],
    'shinsekai': ['新世界', '西成', '通天閣', '恵美須', '大国町'],
    'kyobashi': ['京橋', '都島', '野江', '蒲生'],
    'abeno': ['阿倍野', '天王寺', '寺田町', '昭和町'],
    'kitahama': ['北浜', '淀屋橋', '本町', '堺筋本町', '肥後橋'],
    'fukushima': ['福島', '野田', '海老江'],
};

// ジャンル判定用キーワード
const genreMap = {
    'tachinomi': ['立ち飲み', '立呑', 'スタンド', '立食', '角打ち'],
    'yakitori': ['焼き鳥', '焼鳥', '鶏', '鳥', 'チキン'],
    'kushikatsu': ['串カツ', '串揚げ', '串揚', '串かつ'],
    'izakaya': ['居酒屋', '酒場', '大衆', 'バル', 'ビストロ'],
    'ramen': ['ラーメン', 'らーめん', '中華そば', '餃子', '中華'],
    'yakiniku': ['焼肉', '焼き肉', 'ホルモン', 'ステーキ', '焼肉屋', 'バーベキュー'],
    'sushi': ['寿司', '鮨', '海鮮', '魚', 'カニ', 'うなぎ', '鰻'],
    'bar': ['バー', 'BAR', 'ワイン', 'ビール', 'パブ'],
};

function detectArea(name, snippet = '') {
    const text = (name + snippet).toLowerCase();
    for (const [key, keywords] of Object.entries(areaMap)) {
        if (keywords.some(kw => text.includes(kw))) return key;
    }
    return 'other';
}

function detectGenre(name, snippet = '') {
    const text = (name + snippet).toLowerCase();
    for (const [key, keywords] of Object.entries(genreMap)) {
        if (keywords.some(kw => text.includes(kw))) return key;
    }
    return 'other';
}

function parseSnippet(snippet) {
    const res = { rating: 3.5, genreStr: '', budgetStr: '' };
    if (!snippet) return res;

    // レーティング抽出 (例: 4.7(153))
    const ratingMatch = snippet.match(/(\d\.\d)\(\d+,?\d*\)/);
    if (ratingMatch) res.rating = parseFloat(ratingMatch[1]);

    // 予算抽出 (例: ￥1,000～2,000)
    const budgetMatch = snippet.match(/[￥¥](\d+,?\d*)(?:[～-][￥¥]?(\d+,?\d*))?/);
    if (budgetMatch) {
        res.budgetStr = budgetMatch[0];
    }

    return res;
}

// フィルタリングと整形
const processed = rawData
    .filter(item => item.name && item.name.length > 1) // 有効な名前
    .map((item, index) => {
        const info = parseSnippet(item.snippet);
        return {
            id: (index + 1).toString(),
            name: item.name,
            area: detectArea(item.name, item.snippet),
            genre: detectGenre(item.name, item.snippet),
            rating: info.rating,
            googleMapsUrl: item.url,
            comment: item.snippet || 'Takahiroおすすめの店舗。',
            isActive: !item.snippet?.includes('閉店') && !item.snippet?.includes('閉業'),
            createdAt: '2026-03-31'
        };
    })
    .slice(0, 544); // 544件に制限

console.log(`Processed labels count: ${processed.length}`);

// CSV 出力
const csvHeaders = 'id,name,area,genre,rating,googleMapsUrl,comment,isActive,createdAt\n';
const csvRows = processed.map(s => 
    `"${s.id}","${s.name}","${s.area}","${s.genre}",${s.rating},"${s.googleMapsUrl}","${s.comment.replace(/"/g, '""')}",${s.isActive},"${s.createdAt}"`
).join('\n');

fs.writeFileSync(outputCsvPath, csvHeaders + csvRows, 'utf8');
fs.writeFileSync(outputJsonPath, JSON.stringify(processed, null, 2), 'utf8');

console.log(`Successfully generated:\n- ${outputCsvPath}\n- ${outputJsonPath}`);
