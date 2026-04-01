const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満', '芝田'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開'] }
];

const BROWSER_RESULTS = [
  {"id": "496", "name": "海鮮ブッフェダイニング 銀座八芳", "isOsaka": false},
  {"id": "497", "name": "すし楽", "isOsaka": false},
  {"id": "498", "name": "焼肉 味楽園(みらくえん)", "isOsaka": false},
  {"id": "499", "name": "東亞食堂 黒龍天神樓", "address": "大阪府大阪市北区天神橋4丁目2-12", "isOsaka": true, "exists": true},
  {"id": "500", "name": "らーめんコーさん 本店", "address": "大阪府大阪市大正区千島3丁目4-1", "isOsaka": true, "exists": true},
  {"id": "501", "name": "ぶたのほし", "isOsaka": false},
  {"id": "502", "name": "井出商店", "isOsaka": false},
  {"id": "503", "name": "麺匠 柳", "address": "大阪府大阪市鶴見区横堤1丁目11-45", "isOsaka": true, "exists": true},
  {"id": "504", "name": "味希", "address": "大阪府大阪市中央区東心斎橋1丁目13-9", "isOsaka": true, "exists": true},
  {"id": "505", "name": "焼肉 味吉園", "address": "大阪府寝屋川市楠根南町13-10", "isOsaka": true, "exists": true},
  {"id": "506", "name": "鮮魚 魚豊", "address": "大阪府大阪市中央区日本橋2丁目11-21", "isOsaka": true, "exists": true},
  {"id": "507", "name": "うどんちり本家 にし家本店", "address": "大阪府大阪市中央区東心斎橋1丁目18-18", "isOsaka": true, "exists": true},
  {"id": "508", "name": "餃子てんほう！", "address": "大阪府大阪市此花区西九条3丁目14-2", "isOsaka": true, "exists": true},
  {"id": "509", "name": "まる尾水産", "isOsaka": false},
  {"id": "510", "name": "もつ焼きのりちゃん", "address": "大阪府大阪市福島区大開1丁目20-4", "isOsaka": true, "exists": true},
  {"id": "512", "name": "高円寺肉合戦", "isOsaka": false}, // Closed
  {"id": "513", "name": "牛丼 ホルモン きつねや", "isOsaka": false},
  {"id": "514", "name": "道頓堀今井 本店", "address": "大阪府大阪市中央区道頓堀1丁目7-22", "isOsaka": true, "exists": true},
  {"id": "515", "name": "三軒茶屋一丁目食堂", "isOsaka": false},
  {"id": "516", "name": "らーめん 極 総本店", "address": "大阪府大阪市阿倍野区旭町1丁目1-26", "isOsaka": true, "exists": true},
  {"id": "517", "name": "和食処 大福", "address": "大阪府東大阪市長堂2丁目4-2", "isOsaka": true, "exists": true},
  {"id": "518", "name": "大福屋", "address": "大阪府大阪市北区梅田1丁目3-1 第1ビル", "isOsaka": true, "exists": true},
  {"id": "519", "name": "肉ホルモン てつ腕", "address": "大阪府大阪市浪速区難波中1丁目17-16", "isOsaka": true, "exists": true},
  {"id": "520", "name": "極食堂 ジャンジャン横丁本店", "address": "大阪府大阪市浪速区恵美須東3丁目4-7", "isOsaka": true, "exists": true},
  {"id": "521", "name": "しまながし", "address": "大阪府大阪市北区芝田1丁目1-3 阪急三番街", "isOsaka": true, "exists": true},
  {"id": "522", "name": "元祖 モダン焼 あべとん", "address": "大阪府大阪市天王寺区堀越町 アベノ地下街", "isOsaka": true, "exists": true},
  {"id": "523", "name": "焼肉かまちゃん", "address": "大阪府大阪市生野区勝山北1丁目1-2", "isOsaka": true, "exists": true},
  {"id": "524", "name": "たこつぼ 本店", "address": "大阪府大阪市阿倍野区阿倍野筋2丁目4-48", "isOsaka": true, "exists": true},
  {"id": "525", "name": "海鮮酒場 うおぷく", "address": "大阪府大阪市北区堂山町4-12 3F", "isOsaka": true, "exists": true},
  {"id": "526", "name": "勇すし", "address": "大阪府大阪市北区天神橋4丁目12-10", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 15 (IDs 496-526) results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    
    const salvagedResults = BROWSER_RESULTS.filter(r => r.isOsaka);
    const excludeIds = BROWSER_RESULTS.filter(r => !r.isOsaka).map(r => r.id);
    
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
    tracker.nextIndex += 30;
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 15 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
