const fs = require('fs');
const mockDataPath = require('path').join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const c = fs.readFileSync(mockDataPath, 'utf8');

const shops = [];
let cur = {};
let is = false;

c.split('\n').forEach(l => {
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

const others = shops.filter(s => s.isActive && s.genre === 'other');
console.log(`Total "other" shops: ${others.length}`);

// Common genre-related keywords found in names
const keywords = [
    'うどん', 'カレー', 'カフェ', 'cafe', 'お好み焼き', 'たこ焼き', 'イタリアン', 
    'フレンチ', 'ビストロ', '洋食', '中華', '餃子', 'ピザ', '食堂', '割烹', 
    'ステーキ', '鉄板', 'おでん', 'そば', '蕎麦', '天ぷら', '肉', 'バル', '立ち飲み',
    'ワイン', 'パン', 'ケーキ', '喫茶', 'コーヒー', 'パスタ'
];

const counts = {};
keywords.forEach(k => counts[k] = 0);

others.forEach(s => {
    const name = s.name.toLowerCase();
    let hit = false;
    for (const k of keywords) {
        if (name.includes(k.toLowerCase())) {
            counts[k]++;
            hit = true;
            // A shop might match multiple, but that's fine for rough count
        }
    }
    if (!hit) {
        // Try to identify from comment if possible? Unreliable.
    }
});

// Sort ascending order
const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);

console.log("Keyword matches in names:");
sorted.forEach(([k, count]) => {
    if (count > 0) {
         console.log(`${k}: ${count}`);
    }
});

// Print the names that didn't match anything just to see what they are
const noMatch = others.filter(s => !keywords.some(k => s.name.toLowerCase().includes(k.toLowerCase())));
console.log(`\nShops matching NO primary keyword: ${noMatch.length}`);
console.log(noMatch.map(s => s.name).slice(0, 20).join(', ') + ' ...');
