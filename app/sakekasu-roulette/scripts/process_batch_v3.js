const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');

const OSAKA_KEYWORDS = [
    '大阪', '北区', '都島区', '福島区', '此花区', '中央区', '西区', '港区', '大正区', '天王寺区', '浪速区', '西淀川区', '淀川区', '東淀川区', '東成区', '生野区', '旭区', '城東区', '鶴見区', '阿倍野区', '住之江区', '住吉区', '東住吉区', '平野区', '西成区',
    '堺市', '岸和田市', '豊中市', '池田市', '吹田市', '泉大津市', '高槻市', '貝塚市', '守口市', '枚方市', '茨木市', '八尾市', '泉佐野市', '富田林市', '寝屋川市', '河内長野市', '松原市', '大東市', '和泉市', '箕面市', '柏原市', '羽曳野市', '門真市', '摂津市', '高石市', '藤井寺市', '東大阪市', '泉南市', '四條畷市', '交野市', '大阪狭山市', '阪南市'
];

function run() {
    console.log('Cleaning up data and preparing Batch 3...');
    
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) {
        console.error('MockData match failed');
        return;
    }
    
    let shops = JSON.parse(shopsMatch[1]);
    
    // Cleanup: Remove 116, 121, 124 and move questionable to unverified
    const removedToManual = shops.filter(s => s.id === '116' || s.id === '121' || s.id === '124');
    let manualList = [];
    if (fs.existsSync(UNVERIFIED_PATH)) {
        manualList = JSON.parse(fs.readFileSync(UNVERIFIED_PATH, 'utf8'));
    }
    // Only 121 and 124 to manual (116 is just dead)
    manualList.push(...removedToManual.filter(s => s.id !== '116'));
    fs.writeFileSync(UNVERIFIED_PATH, JSON.stringify(manualList, null, 2));

    shops = shops.filter(s => s.id !== '116' && s.id !== '121' && s.id !== '124');
    
    // Dedup by ID
    const uniqueShops = [];
    const seenIds = new Set();
    shops.forEach(s => {
        if (!seenIds.has(s.id)) {
            uniqueShops.push(s);
            seenIds.add(s.id);
        }
    });

    const updatedContent = content.replace(shopsMatch[1], JSON.stringify(uniqueShops, null, 2));
    fs.writeFileSync(MOCK_DATA_PATH, updatedContent);
    console.log(`Cleanup Done. Unique Shops: ${uniqueShops.length}. Manual Review list updated.`);

    // Batch 3 Prep
    const startIndex = tracker.nextIndex; // Should be 60
    const batchSize = 30;
    const batchIds = tracker.excludedIds.slice(startIndex, startIndex + batchSize);
    const batchItems = master.filter(s => batchIds.includes(s.id));
    
    const toSearch = [];
    const autoSalvaged = [];
    const ignored = [];

    batchItems.forEach(item => {
        if (item.address) {
            const isOsaka = OSAKA_KEYWORDS.some(k => item.address.includes(k) || item.name.includes(k));
            if (isOsaka) {
                autoSalvaged.push(item);
            } else {
                ignored.push(item);
            }
        } else {
            toSearch.push(item);
        }
    });

    console.log(`\nBatch 3 Statistics:`);
    console.log(`- Auto-salvaged: ${autoSalvaged.length}`);
    console.log(`- To Search: ${toSearch.length}`);
    console.log(`- Ignored: ${ignored.length}`);
    
    fs.writeFileSync('batch_pending_v3.json', JSON.stringify({ autoSalvaged, toSearch }, null, 2));
    console.log('\nPending verification list written to batch_pending_v3.json');
}

run();
