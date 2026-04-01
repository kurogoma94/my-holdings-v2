const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満', '芝田'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区'] }
];

const BROWSER_RESULTS = [
  {"id": "466", "name": "志津可 (シズカ)", "address": "大阪府大阪市北区西天満1丁目13-7", "isOsaka": true, "exists": true},
  {"id": "467", "name": "エクチュア からほり｢蔵｣本店", "address": "大阪府大阪市中央区谷町6丁目17-43", "isOsaka": true, "exists": true},
  {"id": "468", "name": "セイロンカリー", "address": "大阪府大阪市中央区南船場1丁目13-4", "isOsaka": true, "exists": true},
  {"id": "469", "name": "方違神社", "isOsaka": false},
  {"id": "470", "name": "縄寿司", "address": "大阪府大阪市北区曽根崎2丁目14-1", "isOsaka": true, "exists": true},
  {"id": "471", "name": "最上 北新地店", "address": "大阪府大阪市北区曽根崎新地1丁目5-6", "isOsaka": true, "exists": true},
  {"id": "472", "name": "レストラン菊水 屋上ビアガーデン", "isOsaka": false},
  {"id": "473", "name": "富士喜商店 新宿総本店", "isOsaka": false},
  {"id": "474", "name": "串カツ 武田", "address": "大阪府大阪市平野区平野本町1丁目5", "isOsaka": true, "exists": true},
  {"id": "475", "name": "リンカーン食堂", "address": "大阪府大阪市都島区東野田町2丁目2-2 2階", "isOsaka": true, "exists": true},
  {"id": "476", "name": "布施バル オルモ", "address": "大阪府東大阪市長堂1丁目2-3 1階", "isOsaka": true, "exists": true},
  {"id": "477", "name": "スタンドミヤコ 立ち呑み", "address": "大阪府大阪市都島区東野田町3丁目4-15", "isOsaka": true, "exists": true},
  {"id": "478", "name": "中津ブルワリー", "address": "大阪府大阪市北区中津3丁目18-7", "isOsaka": true, "exists": true},
  {"id": "479", "name": "おのみち屋", "address": "大阪府大阪市北区曾根崎新地1丁目9-8", "isOsaka": true, "exists": true},
  {"id": "480", "name": "蓮心", "isOsaka": false},
  {"id": "481", "name": "谷町 一味禅", "address": "大阪府大阪市中央区谷町7丁目3-4", "isOsaka": true, "exists": true},
  {"id": "482", "name": "福井", "address": "大阪府大阪市西区北堀江3丁目6-14", "isOsaka": true, "exists": true},
  {"id": "483", "name": "スタミナいちばん", "address": "大阪府大阪市生野区生野東4丁目7-12", "isOsaka": true, "exists": true},
  {"id": "484", "name": "肉しょうがうどんTaiyo", "address": "大阪府大阪市北区天神橋3丁目8-10", "isOsaka": true, "exists": true},
  {"id": "485", "name": "裏難波スシトフジ", "address": "大阪府大阪市中央区千日前2丁目5-7 2F", "isOsaka": true, "exists": true},
  {"id": "486", "name": "三好屋商店", "address": "大阪府大阪市中央区伏見町2丁目2-10", "isOsaka": true, "exists": true},
  {"id": "487", "name": "まんしゅう 西中島店", "address": "大阪府大阪市淀川区西中島3丁目14-7", "isOsaka": true, "exists": true},
  {"id": "488", "name": "鮨 こう介", "address": "大阪府大阪市北区芝田1丁目8-1 D.D.HOUSE 1F", "isOsaka": true, "exists": true},
  {"id": "489", "name": "すし処 ひでまる", "address": "大阪府大阪市北区天神橋4丁目1-2", "isOsaka": true, "exists": true},
  {"id": "490", "name": "月山祐寿司", "address": "大阪府大阪市此花区梅香3丁目33-10", "isOsaka": true, "exists": true},
  {"id": "491", "name": "鶏炭焼麺専門店 田村家 茨木店", "address": "大阪府茨木市園田町6-3", "isOsaka": true, "exists": true},
  {"id": "492", "name": "すしバリュー 門真店", "address": "大阪府門真市柳町20-11", "isOsaka": true, "exists": true},
  {"id": "493", "name": "炭焼き成吉思汗 やまか", "address": "大阪府大阪市北区東天満1丁目2-15", "isOsaka": true, "exists": true},
  {"id": "494", "name": "立呑旬鮮 すーさん", "address": "大阪府大阪市北区東天満1丁目11-15", "isOsaka": true, "exists": true},
  {"id": "495", "name": "舞鶴湾かき小屋 美味星", "isOsaka": false}
];

function run() {
    console.log('Applying Batch 14 (IDs 466-495) results...');
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

    console.log(`Batch 14 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
