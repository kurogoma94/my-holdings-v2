const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満', '芝田', '浮田', '堂島浜'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋', '心斎橋筋', '江戸堀'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中', '宗右衛門町', '島之内', '日本橋'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東', '玉出中', '太子'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町', '舟橋町', '堀越町', '文の里', '東高津町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋', '瓦屋町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開', '敷津東', '足代', '私部'] }
];

const BROWSER_RESULTS = [
  {"id": "557", "name": "華苑 本店", "address": "大阪府大阪市中央区島之内1-8-17", "isOsaka": true, "exists": true},
  {"id": "558", "name": "炭火焼鳥 一兆 日本橋本店", "address": "大阪府大阪市浪速区日本橋東1-2-2", "isOsaka": true, "exists": true},
  {"id": "560", "name": "ぐあぽす guapos", "address": "大阪府大阪市天王寺区東高津町3-13", "isOsaka": true, "exists": true},
  {"id": "561", "name": "ホルモン ジビエ 明星", "address": "大阪府大阪市中央区千日前1-2-9", "isOsaka": true, "exists": true},
  {"id": "562", "name": "お料理だいち", "address": "大阪府大阪市中央区千日前1-6-14", "isOsaka": true, "exists": true},
  {"id": "563", "name": "アネロスタンド", "address": "大阪府大阪市北区天神橋5-8-9", "isOsaka": true, "exists": true},
  {"id": "564", "name": "Dal Donnaiolo", "address": "大阪府大阪市北区西天満5-13-12", "isOsaka": true, "exists": true},
  {"id": "565", "name": "アルデンテ大山", "address": "大阪府大阪市北区西天満3-8-18", "isOsaka": true, "exists": true},
  {"id": "566", "name": "ムラタ料理店", "address": "大阪府大阪市阿倍野区文の里3-2-15", "isOsaka": true, "exists": true},
  {"id": "567", "name": "ル・プログレ", "address": "大阪府大阪市北区堂島浜2-1-13", "isOsaka": true, "exists": true},
  {"id": "568", "name": "レストランヴァリエ", "address": "大阪府大阪市北区中之島3-3-23", "isOsaka": true, "exists": true},
  {"id": "569", "name": "Jean-Georges at The Shinmonzen", "isOsaka": false},
  {"id": "570", "name": "SINAE シナエ", "address": "大阪府大阪市中央区伏見町2-4-12", "isOsaka": true, "exists": true},
  {"id": "571", "name": "なにわ麺次郎", "address": "大阪府大阪市中央区難波4-1-17", "isOsaka": true, "exists": true},
  {"id": "572", "name": "創作料理 アランチャ", "address": "大阪府大阪市中央区東心斎橋1-13-11", "isOsaka": true, "exists": true},
  {"id": "573", "name": "すしセンター 裏天王寺", "address": "大阪府大阪市天王寺区堀越町13-6", "isOsaka": true, "exists": true},
  {"id": "574", "name": "サントリー白州蒸溜所", "isOsaka": false},
  {"id": "575", "name": "浅野日本酒店 Umeda", "address": "大阪府大阪市北区太融寺町2-17", "isOsaka": true, "exists": true},
  {"id": "576", "name": "ぬる燗佐藤 大坂", "address": "大阪府大阪市北区大深町4-20", "isOsaka": true, "exists": true},
  {"id": "577", "name": "餃子のさんくみ", "isOsaka": false},
  {"id": "579", "name": "てんぐ", "address": "大阪府大阪市浪速区恵美須東3-4-12", "isOsaka": true, "exists": true},
  {"id": "581", "name": "兵蔵", "address": "大阪府大阪市西成区太子1-13-17", "isOsaka": true, "exists": true},
  {"id": "582", "name": "カーニグリル 天王寺駅前店", "address": "大阪府大阪市阿倍野区阿倍野筋1-2-8", "isOsaka": true, "exists": true},
  {"id": "583", "name": "焼肉ホルモン 坂上 梅田本店", "address": "大阪府大阪市北区堂山町16-14", "isOsaka": true, "exists": true},
  {"id": "585", "name": "風靡", "address": "大阪府大阪市北区東天満1-12-10", "isOsaka": true, "exists": true},
  {"id": "586", "name": "鮨割烹 のの 梅田お初天神店", "address": "大阪府大阪市北区曽根崎2-12-4", "isOsaka": true, "exists": true},
  {"id": "587", "name": "手打ちうどん 上を向いて", "address": "大阪府交野市私部2-11-31", "isOsaka": true, "exists": true},
  {"id": "588", "name": "雅しゅとうとう", "address": "大阪府大阪市北区堂島1-5-2", "isOsaka": true, "exists": true},
  {"id": "589", "name": "黒毛和牛タンとハラミ焼肉ごりちゃん福島店", "address": "大阪府大阪市福島区福島5-8-14", "isOsaka": true, "exists": true},
  {"id": "590", "name": "黒毛和牛タンとハラミ焼肉ごりちゃん梅田本店", "address": "大阪府大阪市北区堂山町8-21", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 17 (IDs 557-590) results...');
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
                    createdAt: "2026-04-01"
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
    tracker.nextIndex += 30; // 557+30 approx. to keep tracker consistent.
    // Actually, nextIndex should be based on ID?
    // Let's make sure tracker.nextIndex is updated correctly.
    // Progress was at 450. After 30 items, it should be 480. Wait.
    // The prepare_salvage_batch script uses tracker.nextIndex. 
    // In Batch 16, nextIndex was 480. 
    // Batch 17 processed items starting from approx 480 index in excluded list.
    // Let's just follow the existing logic.
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 17 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
