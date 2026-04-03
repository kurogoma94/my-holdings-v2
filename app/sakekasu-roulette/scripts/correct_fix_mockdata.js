const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// The file aff459e starts with:
// export const MOCK_SHOPS: Shop[] = [
//   { ... },
//   ...
// ];

// 1. Rename budget (safe global replace on strings)
content = content.replace(/"budgetMin":/g, '"dinnerBudgetMin":');
content = content.replace(/"budgetMax":/g, '"dinnerBudgetMax":');

// 2. Add missing fields individually to avoid duplicates and handle schema gaps
const shopRegex = /\{[\s\S]*?\}/g;
content = content.replace(shopRegex, (match) => {
    if (!match.includes('"id":')) return match;
    
    let fm = match;
    
    // Schema fields
    const fields = [
        { key: 'hasLunch', value: 'false' },
        { key: 'hasDinner', value: 'true' },
        { key: 'isActive', value: 'true' },
        { key: 'createdAt', value: '"2026-04-01"' }
    ];

    fields.forEach(f => {
        if (!fm.includes(`"${f.key}"`)) {
            fm = fm.replace(/\}(\s*)$/, `,\n    "${f.key}": ${f.value}\n  }$1`);
        }
    });
    
    return fm;
});

// 3. Genre Remapping
const rules = [
    { code: 'udon', keywords: ['うどん', 'そば', '蕎麦', 'きすけ', '兎麦', 'いなの路', '三国', 'Kyutaro', '楽々'] },
    { code: 'italian', keywords: ['イタリア', 'ピザ', 'ピッツェリア', 'Pizzeria', 'Dal', 'Trattoria', 'バル', 'ワイン', 'pasta', 'ぱすた', 'パスタ', 'PISOLA', 'カーサビアンカ', 'Macauda', 'La Lanterna', 'イルテラ'] },
    { code: 'yoshoku', keywords: ['洋食', 'グリル', 'ハンバーグ', 'オムライス', 'サロン卵と私', 'フレンチ', 'ビストロ', 'とんかつ', 'コロッケ', 'フランス', 'ステーキ', 'テキ', 'ル・プログレ', 'ヴァリエ', 'ル・コントワ', 'マルヨシ', 'genso'] },
    { code: 'cafe', keywords: ['カフェ', 'cafe', 'パン', 'ベーカリー', 'ケーキ', 'パティスリー', 'コーヒー', '珈琲', '喫茶', 'クレープ', 'THE ALLEY', '甘党', '和果', 'BOIS', 'スイーツ'] },
    { code: 'okonomiyaki', keywords: ['お好み', 'たこ焼き', 'たこつぼ', '蛸八', 'ねぎ焼', 'モダン焼'] },
    { code: 'washoku', keywords: ['日本料理', '割烹', 'おばんざい', '天ぷら', '食堂', '定食', '弁当', 'お食事処', 'だし巻き', 'うなぎ', 'ふぐ', '牡蠣', '鯛専門店'] }
];

content = content.replace(shopRegex, (match) => {
    if (!match.includes('"genre": "other"')) return match;
    const nameMatch = match.match(/"name":\s*"([^"]*)"/);
    if (!nameMatch) return match;
    const name = nameMatch[1].toLowerCase();
    
    for (const r of rules) {
        if (r.keywords.some(k => name.includes(k.toLowerCase()))) {
            return match.replace(/"genre":\s*"other"/, `"genre": "${r.code}"`);
        }
    }
    return match;
});

// 4. Update Header and Title
content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']*'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);
content = content.replace(/大阪ディープ居酒屋/g, '大阪酒カス');

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log('✅ Master Fix (Budgets, Missing Flags, Genres, Titles) Complete.');
