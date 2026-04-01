const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曽根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '中崎西', '北区南森町', '北区本庄東', '北区中崎西'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '中央区東心斎橋', '中央区西心斎橋', '中央区心斎橋筋'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '中央区難波', '中央区千日前', '中央区道頓堀', '中央区日本橋'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '阿倍野筋', '松崎町', '旭町', '天王寺町北', '大道', '堀越町', '悲田院町', '茶臼山町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '中央区本町', '中央区北浜', '中央区淀屋橋', '中央区伏見町', '中央区道修町', '中央区平野町', '中央区淡路町', '中央区瓦町'] },
];

function run() {
    console.log('Finalizing classification...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) return;

    let shops = JSON.parse(shopsMatch[1]);
    let updatedCount = 0;

    shops.forEach(shop => {
        if (shop.area === 'other') {
            for (const rule of RULES) {
                if (rule.keywords.some(k => (shop.address || '').includes(k) || (shop.name || '').includes(k))) {
                    shop.area = rule.code;
                    updatedCount++;
                    break;
                }
            }
        }
    });

    console.log(`Updated ${updatedCount} shops.`);
    console.log(`Remaining 'other': ${shops.filter(s => s.area === 'other').length}`);

    const newContent = content.replace(shopsMatch[1], JSON.stringify(shops, null, 2));
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Classification finalized.');
}

run();
