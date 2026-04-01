const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const AREA_MAPPING = [
    { code: 'umeda', keywords: ['北区梅田', '北区曽根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '北区大淀'] },
    { code: 'fukushima', keywords: ['福島区福島', '福島区玉川', '福島駅', '新福島'] },
    { code: 'shinsaibashi', keywords: ['心斎橋筋', '西心斎橋', '東心斎橋', '心斎橋駅', '西区新町', '西区立売堀', '西区南堀江', '西区北堀江'] },
    { code: 'namba', keywords: ['中央区難波', '難波千日前', '千日前', '道頓堀', '宗右衛門町', '日本橋', '湊町', '難波駅', '浪速区桜川', '中央区道頓堀', '天王寺区難波', '浪速区稲荷', '元町', '敷津東', '敷津西'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '紅梅町', '東天満'] },
    { code: 'kyobashi', keywords: ['都島区東野田町', '新喜多', '蒲生', '都島区片町', '網島町', '都島区中野町'] },
    { code: 'abeno', keywords: ['阿倍野筋', '松崎町', '阿倍野区旭町', '堀越町', '悲田院町', '茶臼山町', '天王寺町北', '大阪市天王寺区'] },
    { code: 'tsuruhashi', keywords: ['生野区鶴橋', '生野区桃谷', '味原町', '舟橋町', '下寺町', '中道', '玉造', '東成区東小橋'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '中央区大手通', '内平野町'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区太子', '西成区山王', '萩之茶屋', '新世界'] }
];

function run() {
    console.log('Reading MockData.ts...');
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) return console.error('No MOCK_SHOPS found.');
    
    let shops = JSON.parse(shopsMatch[1]);
    let updatedCount = 0;

    shops.forEach(shop => {
        if (shop.area === 'other') {
            const oldArea = shop.area;
            const address = shop.address || '';
            const name = shop.name || '';
            const searchTarget = address + name;
            const isOsaka = address.includes('大阪');

            for (const area of AREA_MAPPING) {
                if (area.keywords.some(k => {
                    const match = searchTarget.includes(k);
                    // For common keywords, require 'Osaka' in address unless it's a very specific keyword
                    if (match && (k === '本町' || k === '元町' || k === '一番')) {
                        return isOsaka;
                    }
                    return match;
                })) {
                    shop.area = area.code;
                    break;
                }
            }
            if (oldArea !== shop.area) {
                console.log(`Re-classified: ${shop.name} (${oldArea} -> ${shop.area})`);
                updatedCount++;
            }
        }
    });

    if (updatedCount > 0) {
        // Find the exact string of the array again to be sure
        const freshContent = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
        const freshMatch = freshContent.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
        const newContent = freshContent.replace(freshMatch[1], JSON.stringify(shops, null, 2));
        fs.writeFileSync(MOCK_DATA_PATH, newContent);
        console.log(`Updated ${updatedCount} shops in MockData.ts.`);
    } else {
        console.log('No shops needed re-classification.');
    }
}

run();
