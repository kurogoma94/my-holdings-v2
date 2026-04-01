const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '中崎西'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通'] },
];

function run() {
    console.log('Applying Batch 5 results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const pendingJson = JSON.parse(fs.readFileSync(PENDING_PATH, 'utf8'));
    
    // IDs from browser subagent report (Batch 5)
    const salvageIds = ["185", "186", "187", "190", "193", "194", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "213", "214", "215"];
    const manualIds = ["211"];
    
    const allToVerify = pendingJson.toSearch;
    const salvagedShops = allToVerify.filter(s => salvageIds.includes(s.id));
    const manualShops = allToVerify.filter(s => manualIds.includes(s.id));

    // Update MockData.ts
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) return console.error('MockData match failed');
    let currentShops = JSON.parse(shopsMatch[1]);
    
    const currentIds = new Set(currentShops.map(s => s.id));
    salvagedShops.forEach(shop => {
        if (!currentIds.has(shop.id)) {
            // Area Re-classification
            let foundArea = false;
            for (const rule of AREA_RULES) {
                if (rule.keywords.some(k => (shop.address || '').includes(k) || (shop.name || '').includes(k))) {
                    shop.area = rule.code;
                    foundArea = true;
                    break;
                }
            }
            if (!foundArea && shop.area === 'other') shop.area = 'other';
            currentShops.push(shop);
        }
    });

    const updatedJson = JSON.stringify(currentShops, null, 2);
    fs.writeFileSync(MOCK_DATA_PATH, content.replace(shopsMatch[1], updatedJson));

    // Update Unverified List
    let unverified = [];
    if (fs.existsSync(UNVERIFIED_PATH)) {
        unverified = JSON.parse(fs.readFileSync(UNVERIFIED_PATH, 'utf8'));
    }
    const unverifiedIds = new Set(unverified.map(s => s.id));
    manualShops.forEach(shop => {
        if (!unverifiedIds.has(shop.id)) {
            unverified.push(shop);
        }
    });
    fs.writeFileSync(UNVERIFIED_PATH, JSON.stringify(unverified, null, 2));

    // Update Tracker
    tracker.nextIndex += 30;
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 5 complete.`);
    console.log(`- Salvaged: ${salvagedShops.length}`);
    console.log(`- Moved to Manual Review: ${manualShops.length}`);
    console.log(`- Excluded: ${allToVerify.length - salvagedShops.length - manualShops.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
