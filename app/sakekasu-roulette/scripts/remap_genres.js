const fs = require('fs');
const mockDataPath = require('path').join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const shops = [];
let cur = {};
let is = false;

content.split('\n').forEach(l => {
    const t = l.trim();
    if (t === '{') { is = true; cur = {}; }
    else if (t === '}' || t === '},') { if (is && cur.id) shops.push(cur); is = false; }
    else if (is) {
        let m = t.match(/^"(\w+)":\s*"([^"]*)"/);
        if (m) cur[m[1]] = m[2];
        const m2 = t.match(/^"(\w+)":\s*(true|false)/);
        if (m2) cur[m2[1]] = m2[2] === 'true';
    }
});

const rules = [
    { code: 'udon', keywords: ['うどん', 'そば', '蕎麦', 'きすけ', '兎麦', 'いなの路', '三国', 'Kyutaro', '楽々'] },
    { code: 'italian', keywords: ['イタリア', 'ピザ', 'ピッツェリア', 'Pizzeria', 'Dal', 'Trattoria', 'バル', 'ワイン', 'pasta', 'ぱすた', 'パスタ', 'PISOLA', 'カーサビアンカ', 'Macauda', 'La Lanterna', 'イルテラ'] },
    { code: 'yoshoku', keywords: ['洋食', 'グリル', 'ハンバーグ', 'オムライス', 'サロン卵と私', 'フレンチ', 'ビストロ', 'とんかつ', 'コロッケ', 'フランス', 'ステーキ', 'テキ', 'ル・プログレ', 'ヴァリエ', 'ル・コントワ', 'マルヨシ', 'genso'] },
    { code: 'cafe', keywords: ['カフェ', 'cafe', 'パン', 'ベーカリー', 'ケーキ', 'パティスリー', 'コーヒー', '珈琲', '喫茶', 'クレープ', 'THE ALLEY', '甘党', '和果', 'BOIS', 'スイーツ'] },
    { code: 'okonomiyaki', keywords: ['お好み', 'たこ焼き', 'たこつぼ', '蛸八', 'ねぎ焼', 'モダン焼'] },
    { code: 'washoku', keywords: ['日本料理', '割烹', 'おばんざい', '天ぷら', '食堂', '定食', '弁当', 'お食事処', 'だし巻き', 'うなぎ', 'ふぐ', '牡蠣', '鯛専門店'] }
];

let changes = 0;

shops.forEach(s => {
    if (!s.isActive || s.genre !== 'other') return;
    
    let matched = null;
    const name = s.name.toLowerCase();
    
    for (const r of rules) {
        if (r.keywords.some(k => name.includes(k.toLowerCase()))) {
            matched = r.code;
            break;
        }
    }
    
    if (matched) {
        // Find the specific chunk in content for this ID
        const idPattern = new RegExp(`("id":\\s*"${s.id}"[\\s\\S]*?)"genre":\\s*"other"`);
        if (idPattern.test(content)) {
            content = content.replace(idPattern, `$1"genre": "${matched}"`);
            changes++;
        }
    }
});

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log(`✅ Successfully remapped ${changes} shops to new genres.`);
