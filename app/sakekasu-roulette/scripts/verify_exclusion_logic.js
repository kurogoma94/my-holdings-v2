const fs = require('fs');
const path = require('path');

const ORIGINAL_DATA_PATH = path.join(__dirname, 'refined_data_search.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const OSAKA_KEYWORDS = [
    '大阪', '北区', '都島区', '福島区', '此花区', '中央区', '西区', '港区', '大正区', '天王寺区', '浪速区', '西淀川区', '淀川区', '東淀川区', '東成区', '生野区', '旭区', '城東区', '鶴見区', '阿倍野区', '住之江区', '住吉区', '東住吉区', '平野区', '西成区',
    '堺市', '岸和田市', '豊中市', '池田市', '吹田市', '泉大津市', '高槻市', '貝塚市', '守口市', '枚方市', '茨木市', '八尾市', '泉佐野市', '富田林市', '寝屋川市', '河内長野市', '松原市', '大東市', '和泉市', '箕面市', '柏原市', '羽曳野市', '門真市', '摂津市', '高石市', '藤井寺市', '東大阪市', '泉南市', '四條畷市', '交野市', '大阪狭山市', '阪南市'
];

function run() {
    console.log('Loading datasets...');
    const original = JSON.parse(fs.readFileSync(ORIGINAL_DATA_PATH, 'utf8'));
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    // Find the current shops in MockData.ts
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('Could not parse MockData.ts');
        return;
    }
    const currentShops = JSON.parse(shopsMatch[1]);
    const currentIds = new Set(currentShops.map(s => s.id));

    const excluded = original.filter(s => !currentIds.has(s.id));
    console.log(`Current Count: ${currentShops.length}`);
    console.log(`Excluded Count: ${excluded.length}`);

    const potentials = excluded.filter(shop => {
        const text = (shop.address || '') + (shop.name || '');
        return OSAKA_KEYWORDS.some(k => text.includes(k));
    });

    console.log('\n--- VERIFICATION RESULTS ---');
    console.log(`Potential Osaka shops incorrectly excluded: ${potentials.length}`);
    
    if (potentials.length > 0) {
        console.log('\nSample items that should likely be restored:');
        potentials.slice(0, 20).forEach(p => {
            console.log(`- [ID: ${p.id}] ${p.name} | Address: ${p.address || 'MISSING'}`);
        });
    }

    const reallyNotOsaka = excluded.filter(shop => !potentials.includes(shop));
    console.log(`\nShops that are likely truly NOT in Osaka: ${reallyNotOsaka.length}`);
    if (reallyNotOsaka.length > 0) {
        console.log('\nSample items truly correctly excluded:');
        reallyNotOsaka.slice(0, 10).forEach(p => {
            console.log(`- [ID: ${p.id}] ${p.name} | Address: ${p.address || 'MISSING'}`);
        });
    }
}

run();
