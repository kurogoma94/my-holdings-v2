const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '深江'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市'] }
];

const BROWSER_RESULTS = [
  {"id": "435", "name": "谷町 ふる里", "address": "大阪府大阪市中央区高津3丁目2-30", "isOsaka": true, "exists": true},
  {"id": "436", "name": "鮨と天ぷら からす", "address": "大阪府大阪市浪速区恵美須西3丁目3-26 3F", "isOsaka": true, "exists": true},
  {"id": "437", "name": "鮨 國松", "address": "大阪府八尾市東本町5丁目10-5", "isOsaka": true, "exists": true},
  {"id": "438", "name": "ニューハマヤ 瓦町店", "address": "大阪府大阪市中央区瓦町4丁目3-10", "isOsaka": true, "exists": true},
  {"id": "439", "name": "鮨 銀座おのでら 登龍門", "isOsaka": false},
  {"id": "440", "name": "NEW YORK PIZZA TONY'S", "isOsaka": false},
  {"id": "441", "name": "SEA & FARM by YANMAR MARCHÉ", "address": "大阪府大阪市北区茶屋町1-32 12F", "isOsaka": true, "exists": true},
  {"id": "442", "name": "だし巻き玉子専門店 百花", "address": "大阪府大阪市天王寺区四天王寺1丁目14-27", "isOsaka": true, "exists": true},
  {"id": "443", "name": "大衆酒場かど升", "address": "大阪府大阪市北区曾根崎2丁目14-13", "isOsaka": true, "exists": true},
  {"id": "444", "name": "パンとエスプレッソと堺筋俱楽部", "address": "大阪府大阪市中央区南船場1丁目15-12", "isOsaka": true, "exists": true},
  {"id": "445", "name": "洋食の店 もなみ", "address": "大阪府大阪市中央区谷町6丁目3-14", "isOsaka": true, "exists": true},
  {"id": "446", "name": "穴場 天満店", "address": "大阪府大阪市北区天神橋4丁目12-7", "isOsaka": true, "exists": true},
  {"id": "447", "name": "スタンド比嘉くん。", "address": "大阪府大阪市都島区東野田町5丁目8-19", "isOsaka": true, "exists": true},
  {"id": "448", "name": "千早川マス釣り場", "address": "大阪府南河内郡千早赤阪村大字千早1262-4", "isOsaka": true, "exists": true},
  {"id": "449", "name": "立呑みビストロやまもと", "address": "大阪府大阪市北区池田町10-10", "isOsaka": true, "exists": true},
  {"id": "450", "name": "魚籠屋", "isOsaka": false},
  {"id": "452", "name": "すざき", "address": "大阪府大阪市中央区北浜1-8-16 B1F", "isOsaka": true, "exists": true},
  {"id": "453", "name": "手造りうどん 楽々", "address": "大阪府交野市幾野6丁目6-1", "isOsaka": true, "exists": true},
  {"id": "454", "name": "中華そば 光洋軒", "address": "大阪府大阪市東成区深江南3丁目20-14", "isOsaka": true, "exists": true},
  {"id": "455", "name": "麺者 侍", "isOsaka": false},
  {"id": "456", "name": "焼鳥 日和", "address": "大阪府大阪市中央区高麗橋2丁目2-2", "isOsaka": true, "exists": true},
  {"id": "457", "name": "床島", "isOsaka": false},
  {"id": "458", "name": "洋食屋 グリルこっこ", "address": "大阪府豊中市中桜塚2丁目18-12", "isOsaka": true, "exists": true},
  {"id": "459", "name": "やむなし松濤", "isOsaka": false},
  {"id": "460", "name": "Guzman y Gomez - Shibuya", "isOsaka": false},
  {"id": "461", "name": "壹銭洋食 本店", "isOsaka": false},
  {"id": "462", "name": "Wine shop Lami", "address": "大阪府大阪市北区黒崎町2-2", "isOsaka": true, "exists": true},
  {"id": "463", "name": "今池飯店", "isOsaka": false},
  {"id": "464", "name": "平和樓", "address": "大阪府大阪市北区角田町9-26", "isOsaka": true, "exists": true},
  {"id": "465", "name": "鮨はまだ", "isOsaka": false}
];

function run() {
    console.log('Applying Batch 13 (IDs 435-465) results...');
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

    console.log(`Batch 13 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded (Non-Osaka/Closed): ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
