const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const OSAKA_KEYWORDS = [
    '大阪', '北区', '都島区', '福島区', '此花区', '中央区', '西区', '港区', '大正区', '天王寺区', '浪速区', '西淀川区', '淀川区', '東淀川区', '東成区', '生野区', '旭区', '城東区', '鶴見区', '阿倍野区', '住之江区', '住吉区', '東住吉区', '平野区', '西成区',
    '堺市', '岸和田市', '豊中市', '池田市', '吹田市', '泉大津市', '高槻市', '貝塚市', '守口市', '枚方市', '茨木市', '八尾市', '泉佐野市', '富田林市', '寝屋川市', '河内長野市', '松原市', '大東市', '和泉市', '箕面市', '柏原市', '羽曳野市', '門真市', '摂津市', '高石市', '藤井寺市', '東大阪市', '泉南市', '四條畷市', '交野市', '大阪狭山市', '阪南市'
];

async function run() {
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    
    const startIndex = tracker.nextIndex;
    const batchSize = 30;
    const batchIds = tracker.excludedIds.slice(startIndex, startIndex + batchSize);
    
    console.log(`Processing Batch: ${startIndex + 1} to ${startIndex + batchIds.length} of ${tracker.total}`);
    
    const batchItems = master.filter(s => batchIds.includes(s.id));
    
    const toSearch = [];
    const automaticallySalvaged = [];
    const confirmedNonOsaka = [];

    batchItems.forEach(item => {
        if (item.address) {
            const isOsaka = OSAKA_KEYWORDS.some(k => item.address.includes(k) || item.name.includes(k));
            if (isOsaka) {
                automaticallySalvaged.push(item);
            } else {
                confirmedNonOsaka.push(item);
            }
        } else {
            // Need browser search
            toSearch.push(item);
        }
    });

    console.log(`- Automatically Salvaged (with existing address): ${automaticallySalvaged.length}`);
    console.log(`- Confirmed Non-Osaka: ${confirmedNonOsaka.length}`);
    console.log(`- Needs Verification (no address): ${toSearch.length}`);
    
    if (toSearch.length > 0) {
        console.log('\n--- NEEDS MANUAL/BROWSER VERIFICATION ---');
        console.log(JSON.stringify(toSearch.map(s => ({id: s.id, name: s.name, url: s.googleMapsUrl})), null, 2));
    }
    
    // Save state for browser subagent
    fs.writeFileSync('batch_pending.json', JSON.stringify({ automaticallySalvaged, confirmedNonOsaka, toSearch }, null, 2));
}

run();
