const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

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
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const pendingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch_pending.json'), 'utf8'));
    
    // Add the verified ones manually (from subagent output)
    const browserVerified = [
        { id: "116", name: "賛否両論", address: "大阪府大阪市中央区心斎橋筋１丁目７−１", area: "shinsaibashi" },
        { id: "117", name: "和牛肉専門 焼肉 松", address: "大阪府大阪市浪速区大国２丁目１０−１２", area: "namba" },
        { id: "118", name: "goody 中津店", address: "大阪府大阪市北区中津１丁目１７−１２", area: "umeda" },
        { id: "119", name: "桜原精肉店", address: "大阪府大阪市北区天神橋４丁目１０−８", area: "tenma" },
        { id: "120", name: "居酒屋 大黒", address: "大阪府大阪市都島区東野田町３丁目１−１", area: "kyobashi" },
        { id: "121", name: "浪芳庵", address: "大阪府大阪市浪速区敷津東１丁目７−３１", area: "namba" },
        { id: "122", name: "ホルモン倶楽部", address: "大阪府大阪市北区浪花町１−１７", area: "tenma" },
        { id: "123", name: "天八うどん どんでん", address: "大阪府大阪市北区浮田２丁目４−１０", area: "tenma" },
        { id: "124", name: "和果 北堀江店", address: "大阪府大阪市西区北堀江１丁目１１−６", area: "shinsaibashi" }
    ];

    const salvagedShops = [...pendingData.automaticallySalvaged, ...browserVerified];
    
    console.log(`Applying salvage for ${salvagedShops.length} shops...`);

    // Load current MockData
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) return console.error('No shops found');
    
    let currentShops = JSON.parse(shopsMatch[1]);
    
    // Merge (avoid duplicates by ID)
    const currentIds = new Set(currentShops.map(s => s.id));
    salvagedShops.forEach(shop => {
        if (!currentIds.has(shop.id)) {
            // Re-classify area if needed
            let foundArea = false;
            for (const rule of AREA_RULES) {
                if (rule.keywords.some(k => (shop.address || '').includes(k) || (shop.name || '').includes(k))) {
                    shop.area = rule.code;
                    foundArea = true;
                    break;
                }
            }
            if (!foundArea && !shop.area) shop.area = 'other';
            
            currentShops.push(shop);
        }
    });

    // Update MockData.ts
    const updatedJson = JSON.stringify(currentShops, null, 2);
    const updatedContent = content.replace(shopsMatch[1], updatedJson);
    fs.writeFileSync(MOCK_DATA_PATH, updatedContent);

    // Update Tracker
    tracker.nextIndex += 30; // Move to next batch
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 2 complete. Current MockData total: ${currentShops.length}`);
}

run();
