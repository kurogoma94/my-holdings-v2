const fs = require('fs');
const path = require('path');

const BATCH_FILE = path.join(__dirname, '../refined_data_batch1.json');

const AREA_MAPPING = [
    { code: 'umeda', keywords: ['北区梅田', '北区曽根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '北区大淀'] },
    { code: 'fukushima', keywords: ['福島区福島', '福島区玉川', '福島駅', '新福島'] },
    { code: 'shinsaibashi', keywords: ['心斎橋筋', '西心斎橋', '東心斎橋', '心斎橋駅', '西区新町', '西区立売堀', '西区南堀江', '西区北堀江'] },
    { code: 'namba', keywords: ['中央区難波', '難波千日前', '千日前', '道頓堀', '宗右衛門町', '日本橋', '湊町', '難波駅', '浪速区桜川', '中央区道頓堀', '天王寺区難波'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '紅梅町', '東天満'] },
    { code: 'kyobashi', keywords: ['都島区東野田町', '新喜多', '蒲生', '都島区片町', '網島町', '都島区中野町'] },
    { code: 'abeno', keywords: ['阿倍野筋', '松崎町', '阿倍野区旭町', '堀越町', '悲田院町', '茶臼山町', '天王寺町北', '大阪市天王寺区'] },
    { code: 'tsuruhashi', keywords: ['生野区鶴橋', '生野区桃谷', '味原町', '舟橋町', '下寺町', '中道', '玉造', '東成区東小橋'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '中央区大手通', '内平野町'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区太子', '西成区山王', '萩之茶屋', '新世界', '西心斎橋'] }
];

function run() {
    if (!fs.existsSync(BATCH_FILE)) {
        console.error('Batch file not found.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(BATCH_FILE, 'utf8'));
    let updatedCount = 0;

    data.forEach(shop => {
        const oldArea = shop.area;
        if (shop.address) {
            for (const area of AREA_MAPPING) {
                if (area.keywords.some(k => shop.address.includes(k) || shop.name.includes(k))) {
                    shop.area = area.code;
                    break;
                }
            }
        }
        if (oldArea !== shop.area) {
            console.log(`Re-classified: ${shop.name} (${oldArea} -> ${shop.area})`);
            updatedCount++;
        }
    });

    fs.writeFileSync(BATCH_FILE, JSON.stringify(data, null, 2));
    console.log(`Updated ${updatedCount} shops with new area categories.`);
}

run();
