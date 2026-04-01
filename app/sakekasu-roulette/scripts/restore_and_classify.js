const fs = require('fs');
const path = require('path');

const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const OSAKA_KEYWORDS = [
    '大阪', '北区', '都島区', '福島区', '此花区', '中央区', '西区', '港区', '大正区', '天王寺区', '浪速区', '西淀川区', '淀川区', '東淀川区', '東成区', '生野区', '旭区', '城東区', '鶴見区', '阿倍野区', '住之江区', '住吉区', '東住吉区', '平野区', '西成区',
    '堺市', '岸和田市', '豊中市', '池田市', '吹田市', '泉大津市', '高槻市', '貝塚市', '守口市', '枚方市', '茨木市', '八尾市', '泉佐野市', '富田林市', '寝屋川市', '河内長野市', '松原市', '大東市', '和泉市', '箕面市', '柏原市', '羽曳野市', '門真市', '摂津市', '高石市', '藤井寺市', '東大阪市', '泉南市', '四條畷市', '交野市', '大阪狭山市', '阪南市'
];

const AREA_RULES = [
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
    console.log('Starting data recovery and classification...');
    
    // Load Master Data
    const masterShops = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    console.log(`Master Data Count: ${masterShops.length}`);

    // 1. Refined Osaka Filtering
    const osakaShops = masterShops.filter(shop => {
        const text = (shop.address || '') + (shop.name || '');
        return OSAKA_KEYWORDS.some(k => text.includes(k));
    });
    console.log(`Filtered Osaka Shops: ${osakaShops.length}`);

    // 2. Comprehensive Area Classification
    osakaShops.forEach(shop => {
        // Only classify if 'other' or missing? 
        // Let's re-classify everyone based on the better rules for consistency.
        let foundArea = false;
        for (const rule of AREA_RULES) {
            if (rule.keywords.some(k => (shop.address || '').includes(k) || (shop.name || '').includes(k))) {
                shop.area = rule.code;
                foundArea = true;
                break;
            }
        }
        if (!foundArea) {
            shop.area = 'other';
        }
    });

    const categorizedCount = osakaShops.filter(s => s.area !== 'other').length;
    console.log(`Categorized: ${categorizedCount}`);
    console.log(`Other: ${osakaShops.length - categorizedCount}`);

    // 3. Update MockData.ts
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('Could not find array in MockData.ts');
        return;
    }

    const newShopsJson = JSON.stringify(osakaShops, null, 2);
    const newContent = content.replace(shopsMatch[1], newShopsJson);
    
    // Update timestamp
    const now = new Date().toISOString();
    const updatedContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${now}';`);

    fs.writeFileSync(MOCK_DATA_PATH, updatedContent);
    console.log('Restoration and Classification complete. MockData.ts updated.');
}

run();
