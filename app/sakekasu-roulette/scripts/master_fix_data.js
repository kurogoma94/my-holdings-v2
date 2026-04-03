const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');

// Start from a clean baseline (aff459e has already been checked out)
let content = fs.readFileSync(mockDataPath, 'utf8');

console.log('Original length:', content.length);

// 1. Rename budget fields
content = content.replace(/"budgetMin":/g, '"dinnerBudgetMin":');
content = content.replace(/"budgetMax":/g, '"dinnerBudgetMax":');

// 2. Add hasLunch, hasDinner, isActive if missing
// The Shop interface now requires these.
// aff459e stores look like:
// {
//   "id": "1",
//   "name": "...",
//   ...
//   "phone": "..."
// }
// We need to add them before the closing brace.
content = content.replace(/(\n\s+)("phone":\s*"[^"]*")?\s*(\n\s*)(\}\s*,?\n)/g, (match, p1, p2, p3, p4) => {
    // If it already has one of these, skip (to avoid double entry)
    if (match.includes('hasLunch')) return match;
    
    let insert = '';
    if (p2) { // if phone exists
       insert = `${p1}${p2},\n${p1}"hasLunch": false,\n${p1}"hasDinner": true,\n${p1}"isActive": true${p3}${p4}`;
    } else {
       // Need to handle entries without phone too.
       // Actually let's use a simpler approach: regex for the end of a Shop object
       return match;
    }
    return insert;
});

// Let's use a more robust regex for adding fields to any shop missing them
const shopRegex = /\{[\s\S]*?\}/g;
content = content.replace(shopRegex, (match) => {
    if (match.includes('hasLunch')) return match;
    // Insert fields before the last }
    return match.replace(/\}(\s*)$/, ',\n    "hasLunch": false,\n    "hasDinner": true,\n    "isActive": true\n  }$1');
});

// 3. Apply Genre Remapping for 'other'
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
    
    // Extract name
    const nameMatch = match.match(/"name":\s*"([^"]*)"/);
    if (!nameMatch) return match;
    const name = nameMatch[1].toLowerCase();
    
    let matchedGenre = null;
    for (const r of rules) {
        if (r.keywords.some(k => name.includes(k.toLowerCase()))) {
            matchedGenre = r.code;
            break;
        }
    }
    
    if (matchedGenre) {
        return match.replace(/"genre":\s*"other"/, `"genre": "${matchedGenre}"`);
    }
    return match;
});

// 4. Update the "Updated At" timestamp
content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']*'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);

// 5. Global Title Rename (Safe way)
content = content.replace(/大阪ディープ居酒屋/g, '大阪酒カス');

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log('✅ Master Migration Complete. Re-verify with tsc now.');
