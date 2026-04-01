const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目'] }
];

const BROWSER_RESULTS = [
  {"id": "403", "name": "ロンパル", "address": "大阪府大阪市大正区千島１丁目２３−１１５", "isOsaka": true, "exists": true},
  {"id": "405", "name": "ビストロリアン", "address": "大阪府大阪市旭区高殿７丁目７−３", "isOsaka": true, "exists": true},
  {"id": "406", "name": "カチャトーレ ヤマガミ", "address": "大阪府大阪市北区豊崎４丁目３−１", "isOsaka": true, "exists": true},
  {"id": "407", "name": "Ristorante 迫", "address": "大阪府大阪市北区末広町３−２", "isOsaka": true, "exists": true},
  {"id": "408", "name": "MAKIBI", "address": "大阪府大阪市北区西天満３丁目１−２７", "isOsaka": true, "exists": true},
  {"id": "409", "name": "梅田 海鮮居酒屋いこう", "address": "大阪府大阪市北区太融寺町２−２１", "isOsaka": true, "exists": true},
  {"id": "410", "name": "実乃里 de バル", "address": "大阪府大阪市中央区北久宝寺町２丁目６−７", "isOsaka": true, "exists": true},
  {"id": "411", "name": "比良山荘", "isOsaka": false},
  {"id": "412", "name": "活魚寿司 岸和田今木店", "address": "大阪府岸和田市今木町１５−１", "isOsaka": true, "exists": true},
  {"id": "413", "name": "KITASHINCHI 鉄板焼 sia", "address": "大阪府大阪市北区曾根崎新地１−１１−４", "isOsaka": true, "exists": true},
  {"id": "414", "name": "アニメバー たまりば", "address": "大阪府大阪市北区天神橋３丁目７−３０", "isOsaka": true, "exists": true},
  {"id": "415", "name": "北京本店", "isOsaka": false},
  {"id": "416", "name": "薪鳥新神戸", "isOsaka": false},
  {"id": "417", "name": "ル・コントワ", "address": "大阪府大阪市北区曾根崎新地１−５−２１", "isOsaka": true, "exists": true},
  {"id": "418", "name": "まりお流らーめん", "isOsaka": false},
  {"id": "419", "name": "銀座屋", "address": "大阪府大阪市北区梅田１丁目２−２", "isOsaka": true, "exists": true},
  {"id": "420", "name": "みちくさ能勢", "address": "大阪府豊能郡能勢町下田尻８０１", "isOsaka": true, "exists": true},
  {"id": "421", "name": "グリル 太平", "address": "大阪府大阪市生野区田島４丁目４−６５", "isOsaka": true, "exists": true},
  {"id": "422", "name": "ダイナミックキッチン＆バー 燦－SUN－ OBPツインタワー店", "address": "大阪府大阪市中央区城見２丁目１−６１", "isOsaka": true, "exists": true},
  {"id": "423", "name": "キャッスルカフェ", "address": "大阪府大阪市中央区城見１丁目２−２７", "isOsaka": true, "exists": true},
  {"id": "424", "name": "Oh！マイステーキ", "address": "大阪府大阪市中央区心斎橋筋１丁目３−２９", "isOsaka": true, "exists": true},
  {"id": "425", "name": "Back Street Coffee", "address": "大阪府大阪市城東区中央２丁目１−１２", "isOsaka": true, "exists": true},
  {"id": "426", "name": "BEER BELLY 天満", "address": "大阪府大阪市北区池田町７−４", "isOsaka": true, "exists": true},
  {"id": "427", "name": "弄堂 南森町本店", "address": "大阪府大阪市北区天神橋２丁目２−８", "isOsaka": true, "exists": true},
  {"id": "428", "name": "炭火焼 炭達磨", "address": "大阪府大阪市北区豊崎３丁目３−１４", "isOsaka": true, "exists": true},
  {"id": "429", "name": "鮨白", "address": "大阪府大阪市北区東天満１丁目１１−１５", "isOsaka": true, "exists": true},
  {"id": "431", "name": "第一旭 関目店", "address": "大阪府大阪市城東区関目２丁目１２−２４", "isOsaka": true, "exists": true},
  {"id": "432", "name": "饂飩工房 うばら", "address": "大阪府大阪市中央区谷町６丁目１５−１７", "isOsaka": true, "exists": true},
  {"id": "433", "name": "fried sandwich Age.3 GINZA", "isOsaka": false},
  {"id": "434", "name": "海鮮居酒屋 海鍋亭(うみなべ亭) 梅田店", "address": "大阪府大阪市北区太融寺町２−２１", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 12 (IDs 403-434) results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(path.join(__dirname, 'refined_data_search.json'), 'utf8'));
    
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
                    createdAt: "2026-03-31"
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

    console.log(`Batch 12 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
