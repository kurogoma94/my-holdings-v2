const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区', '福島'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満', '芝田', '浮田', '堂島浜'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋', '心斎橋筋', '江戸堀'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中', '宗右衛門町', '島之内', '日本橋', '難波千日前'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北', '玉造'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東', '玉出中', '太子', '山王'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町', '舟橋町', '堀越町', '文の里', '東高津町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋', '瓦屋町', '中央区上汐'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '住吉区', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開', '敷津東', '足代', '私部'] }
];

const BROWSER_RESULTS = [
  {"id": "591", "name": "源兵衛 なんば店", "address": "大阪府大阪市浪速区難波中2-4-5", "isOsaka": true, "exists": true},
  {"id": "592", "name": "肉の天満屋 神楽亭", "address": "大阪府大阪市北区天神橋4-11-10", "isOsaka": true, "exists": true},
  {"id": "593", "name": "すし政 中店", "address": "大阪府大阪市北区天神橋5-6-19", "isOsaka": true, "exists": true},
  {"id": "594", "name": "千番", "address": "大阪府大阪市西成区山王3-5-25", "isOsaka": true, "exists": true},
  {"id": "595", "name": "鳴門鯛", "isOsaka": false},
  {"id": "596", "name": "西端手打 上戸うどん", "isOsaka": false},
  {"id": "597", "name": "谷川米殻店", "isOsaka": false},
  {"id": "598", "name": "山越うどん", "isOsaka": false},
  {"id": "599", "name": "かどや 大街道店", "isOsaka": false},
  {"id": "600", "name": "お好み焼き 丸福 今里店 姉妹店", "address": "大阪府大阪市東成区大今里4-2-1", "isOsaka": true, "exists": true},
  {"id": "601", "name": "焼肉屋輪‐りん-玉造本店", "address": "大阪府大阪市天王寺区玉造元町3-19", "isOsaka": true, "exists": true},
  {"id": "603", "name": "HICARU COFFEE ROASTER", "address": "大阪府大阪市中央区上汐1-1-23", "isOsaka": true, "exists": true},
  {"id": "604", "name": "うなぎ 和友", "isOsaka": false},
  {"id": "605", "name": "みかん 今里店", "address": "大阪府大阪市東成区大今里南1-11-3 ロイヤル大今里1F", "isOsaka": true, "exists": true},
  {"id": "606", "name": "炭焼きうなぎの魚伊 本店", "address": "大阪府大阪市旭区高殿4-8-10", "isOsaka": true, "exists": true},
  {"id": "607", "name": "ザ・ミュンヒ", "address": "大阪府八尾市刑部2-386", "isOsaka": true, "exists": true},
  {"id": "608", "name": "BENJAMIN STEAKHOUSE KYOTO", "isOsaka": false},
  {"id": "609", "name": "千とせ 本店", "address": "大阪府大阪市中央区難波千日前8-1", "isOsaka": true, "exists": true},
  {"id": "610", "name": "魚仁", "isOsaka": false},
  {"id": "611", "name": "食堂 二十", "address": "大阪府大阪市北区曽根崎新地1-5-29", "isOsaka": true, "exists": true},
  {"id": "612", "name": "鮨 惣五郎", "address": "大阪府大阪市北区曽根崎新地1-3-11", "isOsaka": true, "exists": true},
  {"id": "613", "name": "ミンモアハウス", "address": "大阪府大阪市北区曽根崎新地1-11-9", "isOsaka": true, "exists": true},
  {"id": "614", "name": "L’occas - bar à vin - ワインバー ロカス", "address": "大阪府大阪市西区新町1-23-9", "isOsaka": true, "exists": true},
  {"id": "615", "name": "江戸前にぎり寿し 春駒 本店", "address": "大阪府大阪市北区天神橋5-5-2", "isOsaka": true, "exists": true},
  {"id": "616", "name": "ニュールーブル", "address": "大阪府大阪市住吉区沢之町2-8-18", "isOsaka": true, "exists": true},
  {"id": "617", "name": "いわむら Chez Deuxieme", "address": "大阪府大阪市北区西天満4-6-13", "isOsaka": true, "exists": true},
  {"id": "618", "name": "いなさ寿司", "address": "大阪府八尾市本町5-1-1", "isOsaka": true, "exists": true},
  {"id": "619", "name": "コＮＯコＮＯコ", "address": "大阪府大阪市中央区難波3-7-3", "isOsaka": true, "exists": true},
  {"id": "620", "name": "クレープス・ド・アンヌ", "isOsaka": false},
  {"id": "621", "name": "さぁみな！（略称）", "address": "大阪府東大阪市新池島町3-12-12", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 18 (IDs 591-621) results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    
    const salvagedResults = BROWSER_RESULTS.filter(r => r.isOsaka && r.exists);
    const excludeIds = BROWSER_RESULTS.filter(r => !r.isOsaka || !r.exists).map(r => r.id);
    
    // Update MockData.ts
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) return console.error('MockData match failed');
    let currentShops = JSON.parse(shopsMatch[1]);
    const currentIds = new Set(currentShops.map(s => s.id));

    let salvagedCount = 0;

    salvagedResults.forEach(result => {
        if (!currentIds.has(result.id)) {
            const masterItem = master.find(m => m.id === result.id);
            if (masterItem) {
                const newShop = {
                    ...masterItem,
                    address: result.address,
                    isActive: true,
                    createdAt: "2026-04-02"
                };

                let foundArea = false;
                for (const rule of AREA_RULES) {
                    if (rule.keywords.some(k => (newShop.address || '').includes(k) || (newShop.name || '').includes(k))) {
                        newShop.area = rule.code;
                        foundArea = true;
                        break;
                    }
                }
                if (!foundArea) newShop.area = 'other';
                
                currentShops.push(newShop);
                salvagedCount++;
            }
        }
    });

    const updatedJson = JSON.stringify(currentShops, null, 2);
    fs.writeFileSync(MOCK_DATA_PATH, content.replace(shopsMatch[1], updatedJson));

    // Update Tracker
    tracker.nextIndex += 30; // ID is processed in chunks of 30 from the exclude list.
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 18 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
