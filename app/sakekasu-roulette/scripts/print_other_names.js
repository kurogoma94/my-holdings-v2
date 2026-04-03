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
        let m = t.match(/^"([^"]+)":\s*"([^"]*)"/);
        if (m) cur[m[1]] = m[2];
        const m2 = t.match(/^"([^"]+)":\s*(true|false)/);
        if (m2) cur[m2[1]] = m2[2] === 'true';
    }
});

const others = shops.filter(s => s.isActive && s.genre === 'other');
console.log(others.map(s => s.name).join('\n'));
