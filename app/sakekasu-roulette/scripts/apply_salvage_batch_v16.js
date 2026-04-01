const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満', '芝田', '浮田'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋', '心斎橋筋'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中', '宗右衛門町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東', '玉出中'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町', '舟橋町', '堀越町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋', '瓦屋町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開', '敷津東', '足代'] }
];

const BROWSER_RESULTS = [
  {"id": "527", "name": "家和らぎ 心斎橋 和食", "address": "大阪府大阪市中央区心斎橋筋1丁目3-12 田毎プラザビル 1F", "isOsaka": true, "exists": true},
  {"id": "528", "name": "CAFE Bar ONE PEACE", "address": "大阪府大阪市北区堂山町6-10 第二名門ビル 5F", "isOsaka": true, "exists": true},
  {"id": "529", "name": "ときすし 本店", "address": "大阪府大阪市中央区難波千日前4-21", "isOsaka": true, "exists": true},
  {"id": "530", "name": "焼豚ラーメン三條", "isOsaka": false},
  {"id": "531", "name": "Viande wood ヴィアンド ウッド (わさび食堂)", "address": "大阪府大阪市西成区玉出中2丁目16-6", "isOsaka": true, "exists": true},
  {"id": "532", "name": "彩華ラーメン 布施店", "address": "大阪府東大阪市足代3丁目1-15", "isOsaka": true, "exists": true},
  {"id": "533", "name": "寿司処 松の", "isOsaka": false},
  {"id": "534", "name": "うなぎ じん田", "address": "大阪府大阪市北区池田町7-6", "isOsaka": true, "exists": true},
  {"id": "535", "name": "焼肉 㐂舌 きたん 法善寺", "address": "大阪府大阪市中央区道頓堀1丁目7-12", "isOsaka": true, "exists": true},
  {"id": "536", "name": "The old bridge", "address": "大阪府大阪市天王寺区舟橋町20-21", "isOsaka": true, "exists": true},
  {"id": "537", "name": "麺家獅子丸", "isOsaka": false},
  {"id": "538", "name": "新川にしや", "address": "大阪府大阪市浪速区難波中1丁目17-16", "isOsaka": true, "exists": true},
  {"id": "539", "name": "ピノキオ (天三店)", "address": "大阪府大阪市北区天神橋3丁目2-33", "isOsaka": true, "exists": true},
  {"id": "540", "name": "めん処 竹ちゃん", "address": "大阪府大阪市中央区瓦屋町2丁目10-14", "isOsaka": true, "exists": true},
  {"id": "541", "name": "新ちゃん", "isOsaka": false},
  {"id": "542", "name": "MAKE ONE TWO", "address": "大阪府大阪市中央区平野町2丁目2-12 生駒ビルヂング 1F", "isOsaka": true, "exists": true},
  {"id": "543", "name": "Bar W", "address": "大阪府大阪市中央区宗右衛門町2-16", "isOsaka": true, "exists": true},
  {"id": "544", "name": "一口いなりむろや 本店", "address": "大阪府大阪市西区南堀江2丁目1-17", "isOsaka": true, "exists": true},
  {"id": "545", "name": "カンティーナリマ", "address": "大阪府大阪市北区浮田2丁目6-13 メゾンまさみ", "isOsaka": true, "exists": true},
  {"id": "546", "name": "酒房 ワビスケ ルシアス店", "address": "大阪府大阪市阿倍野区阿倍野筋1丁目5-1 ルシアスビル B1F", "isOsaka": true, "exists": true},
  {"id": "547", "name": "十枡", "isOsaka": false},
  {"id": "548", "name": "焼肉ジャック 天王寺駅前店", "address": "大阪府大阪市天王寺区堀越町16-9 毎日シルバービルディング 7F", "isOsaka": true, "exists": true},
  {"id": "549", "name": "大衆焼肉ホルモン にくさわ 本店", "address": "大阪府大阪市中央区千日前2丁目5-7", "isOsaka": true, "exists": true},
  {"id": "550", "name": "焼き鳥 小松", "address": "大阪府大阪市福島区福島4丁目2-65", "isOsaka": true, "exists": true},
  {"id": "551", "name": "鯛専門店 徳ます", "address": "大阪府大阪市西区江戸堀1丁目17-4 Art Lab. 1971", "isOsaka": true, "exists": true},
  {"id": "552", "name": "焼肉次郎 京橋本店", "address": "大阪府大阪市都島区東野田町2丁目3-3", "isOsaka": true, "exists": true},
  {"id": "553", "name": "海鮮丼専門店 木津 魚市食堂", "address": "大阪府大阪市浪速区敷津東2丁目2-8", "isOsaka": true, "exists": true},
  {"id": "554", "name": "焼肉 藤もと 大吉商店", "address": "大阪府大阪市福島区福島2丁目7-17", "isOsaka": true, "exists": true},
  {"id": "555", "name": "すしの助 北浜店", "address": "大阪府大阪市中央区淡路町2丁目2-2 タケウチ アバクスビル 2階", "isOsaka": true, "exists": true},
  {"id": "556", "name": "ラーメン大戦争 梅田店", "address": "大阪府大阪市北区堂山町15-14", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 16 (IDs 527-556) results...');
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
    tracker.nextIndex += 30;
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 16 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
