const fs = require('fs');
const mockDataPath = require('path').join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const shops = [];
let current = {};
let is = false;

content.split('\n').forEach(line => {
    const t = line.trim();
    if (t === '{') { is = true; current = {}; }
    else if (t === '}' || t === '},') { if (is && current.id) shops.push(current); is = false; }
    else if (is) {
        let m = t.match(/^"(\w+)":\s*"([^"]*)"/);
        if (m) current[m[1]] = m[2];
        m = t.match(/^"(\w+)":\s*(true|false)/);
        if (m) current[m[1]] = m[2] === 'true';
    }
});

const others = shops.filter(s => s.isActive && s.area === 'other');
console.log(`Remaining active others: ${others.length}`);
others.forEach(s => console.log(`- ${s.name} (${s.address})`));
