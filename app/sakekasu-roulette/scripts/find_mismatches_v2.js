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

const mismatches = [];

const rules = [
    { nameRegex: /梅田|北新地|堂山|東梅田|西梅田/, invalidAreaRegex: /^(?!umeda).*$/, areaName: 'umeda' },
    { nameRegex: /難波|なんば|道頓堀|千日前/, invalidAreaRegex: /^(?!namba).*$/, areaName: 'namba' },
    { nameRegex: /心斎橋|堀江|南船場/, invalidAreaRegex: /^(?!shinsaibashi).*$/, areaName: 'shinsaibashi' },
    { nameRegex: /天満|天神橋|南森町/, invalidAreaRegex: /^(?!tenma).*$/, areaName: 'tenma' },
    { nameRegex: /京橋|都島/, invalidAreaRegex: /^(?!kyobashi).*$/, areaName: 'kyobashi' },
    { nameRegex: /福島|鷺洲/, invalidAreaRegex: /^(?!fukushima).*$/, areaName: 'fukushima' },
    { nameRegex: /阿倍野|天王寺/, invalidAreaRegex: /^(?!abeno).*$/, areaName: 'abeno' },
    { nameRegex: /鶴橋|桃谷/, invalidAreaRegex: /^(?!tsuruhashi).*$/, areaName: 'tsuruhashi' },
    { nameRegex: /北浜|淀屋橋/, invalidAreaRegex: /^(?!kitahama).*$/, areaName: 'kitahama' },
    { nameRegex: /新世界|西成|動物園前/, invalidAreaRegex: /^(?!shinsekai).*$/, areaName: 'shinsekai' },
    { nameRegex: /十三|西中島|新大阪/, invalidAreaRegex: /^(?!nishinakajima).*$/, areaName: 'nishinakajima' },
    { nameRegex: /高槻/, invalidCityPattern: '高槻市', areaName: 'hokusetsu' },
    { nameRegex: /堺|中百舌鳥/, invalidCityPattern: '堺市', areaName: 'senshu' },
    { nameRegex: /吹田|江坂/, invalidCityPattern: '吹田市', areaName: 'hokusetsu' }
];

shops.forEach(s => {
    if (!s.isActive || !s.address) return;
    
    for (const rule of rules) {
        if (rule.nameRegex.test(s.name)) {
            let isBad = false;
            if (rule.invalidAreaRegex && rule.invalidAreaRegex.test(s.area)) {
                // Ignore shops that have string matches as chain names but actually exist in mapped address.
                // e.g. "梅田屋" in namba. But how to know?
                // If it's a known chain "梅田ホルモン なんば店", we can ignore if address contains correct ward
                isBad = true;
            }
            if (rule.invalidCityPattern && !s.address.includes(rule.invalidCityPattern)) {
                isBad = true;
            }
            
            if (isBad) {
                mismatches.push({
                    name: s.name,
                    area: s.area,
                    address: s.address,
                    expectedArea: rule.areaName
                });
            }
            break;
        }
    }
});

console.log(`Found ${mismatches.length} potential semantic location mismatches:`);
mismatches.forEach(m => {
    console.log(`- ${m.name}`);
    console.log(`  Current Area: ${m.area} | Current Address: ${m.address}`);
    console.log(`  Expected Area based on Name: ${m.expectedArea}\n`);
});
