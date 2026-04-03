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

const anomalies = [];
shops.forEach(s => {
    // Look for shops containing '高槻' in name or address
    if ((s.name && s.name.includes('高槻')) || (s.address && s.address.includes('高槻'))) {
        anomalies.push(s);
    }
});

console.log(`Found ${anomalies.length} Takatsuki shops`);
anomalies.forEach(s => console.log(JSON.stringify(s, null, 2)));

// Also look for ANY shop that is in "umeda", "namba", "shinsaibashi", "tenma" etc, but whose address contains a different city
const badMapped = shops.filter(s => {
    if (!s.address) return false;
    const isTakatsuki = s.address.includes('高槻市');
    const isBlow = s.address.includes('吹田市') || s.address.includes('豊中市') || s.address.includes('茨木市');
    const isSakai = s.address.includes('堺市');
    const isHigashi = s.address.includes('東大阪市');
    
    // If it's a known non-central city but mapped to a central ward
    if (isTakatsuki && s.area !== 'hokusetsu' && s.area !== 'other') return true;
    if (isBlow && s.area !== 'hokusetsu' && s.area !== 'other') return true;
    if (isSakai && s.area !== 'senshu' && s.area !== 'other') return true;
    if (isHigashi && s.area !== 'higashiosaka' && s.area !== 'other') return true;
    return false;
});

console.log(`\nFound ${badMapped.length} potentially badly mapped shops from outer cities to internal wards`);
badMapped.forEach(s => console.log(`Name: ${s.name}, Area: ${s.area}, Address: ${s.address}`));
