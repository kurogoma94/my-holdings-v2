const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町'] }
];

const BROWSER_RESULTS = [
  {"id": "247", "name": "Grill Cafe Excellent", "address": "〒595-0814 大阪府泉北郡忠岡町新浜２丁目５", "isOsaka": true, "exists": true},
  {"id": "248", "name": "楽園", "address": "〒115-0045 東京都北区赤羽１丁目１４−３", "isOsaka": false, "exists": true},
  {"id": "249", "name": "大衆酒場 つくねとたまごアカイワ 赤羽店", "address": "〒115-0045 東京都北区赤羽１丁目１８−１０", "isOsaka": false, "exists": true},
  {"id": "250", "name": "赤羽ホルモン", "address": "〒115-0045 東京都北区赤羽１丁目３８−８", "isOsaka": false, "exists": true},
  {"id": "251", "name": "赤羽 トロ函", "address": "〒115-0045 東京都北区赤羽１丁目１７−７", "isOsaka": false, "exists": true},
  {"id": "252", "name": "ニクマレヤ 赤羽本店", "address": "〒115-0045 東京都北区赤羽１丁目３９−５", "isOsaka": false, "exists": true},
  {"id": "253", "name": "酒肴 佐藤商店", "address": "〒115-0045 東京都北区赤羽１丁目１３−８", "isOsaka": false, "exists": true},
  {"id": "254", "name": "馬ん馬んいくどん", "address": "〒115-0045 東京都北区赤羽１丁目２３−５", "isOsaka": false, "exists": true},
  {"id": "255", "name": "いこい本店", "address": "〒115-0045 東京都北区赤羽１丁目３−８", "isOsaka": false, "exists": true},
  {"id": "256", "name": "大衆肉ビストロLit", "address": "〒115-0045 東京都北区赤羽１丁目１３−１", "isOsaka": false, "exists": true},
  {"id": "257", "name": "居酒屋燃えた うらめし屋 赤羽", "address": "〒115-0045 東京都北区赤羽１丁目３５−９", "isOsaka": false, "exists": true},
  {"id": "258", "name": "もつ焼のんき", "address": "〒542-0083 大阪府大阪市中央区東心斎橋１丁目１６−１３", "isOsaka": true, "exists": true},
  {"id": "259", "name": "闇市", "address": "〒115-0045 東京都北区赤羽１丁目１４−１７", "isOsaka": false, "exists": true},
  {"id": "260", "name": "酒・肴 とやお", "address": "〒115-0045 東京都北区赤羽１丁目１５−１", "isOsaka": false, "exists": true},
  {"id": "261", "name": "PANAME Crêpes de Paris ＆ Café Bar", "address": "〒542-0086 大阪府大阪市中央区西心斎橋１丁目１０−４１", "isOsaka": true, "exists": true},
  {"id": "262", "name": "n°29（ナンバーニーキュー)", "address": "〒550-0013 大阪府大阪市西区新町１丁目２４−８", "isOsaka": true, "exists": true},
  {"id": "263", "name": "薬薗(yakuen)", "address": "〒530-0043 大阪府大阪市北区天満３丁目１−５", "isOsaka": true, "exists": true},
  {"id": "264", "name": "居酒屋 たこしげ", "address": "〒542-0086 大阪府大阪市中央区西心斎橋２丁目１２−８", "isOsaka": true, "exists": true},
  {"id": "265", "name": "焼肉冷麺 肉五郎 アメリカ村店", "address": "〒542-0086 大阪府大阪市中央区西心斎橋２丁目１０−３１", "isOsaka": true, "exists": true},
  {"id": "266", "name": "KOME MAME", "address": "〒542-0012 大阪府大阪市中央区谷町７丁目１−１１", "isOsaka": true, "exists": true},
  {"id": "267", "name": "Sweet Check", "address": "〒542-0086 大阪府大阪市中央区西心斎橋１丁目６−１７", "isOsaka": true, "exists": true},
  {"id": "268", "name": "家系総本山 吉村家", "address": "〒220-0005 神奈川県横浜市西区南幸２丁目１２−６", "isOsaka": false, "exists": true},
  {"id": "269", "name": "209スタンド", "address": "〒150-0043 東京都渋谷区道玄坂２丁目９−１０", "isOsaka": false, "exists": true},
  {"id": "270", "name": "KILN THE BEER HOUSE", "address": "〒530-0012 大阪府大阪市北区芝田１丁目８−１", "isOsaka": true, "exists": true},
  {"id": "271", "name": "こたや", "address": "〒598-0021 大阪府泉佐野市日根野５９４−１", "isOsaka": true, "exists": true},
  {"id": "272", "name": "立呑み処 たよし", "address": "〒542-0076 大阪府大阪市中央区難波３丁目２−２６", "isOsaka": true, "exists": true},
  {"id": "273", "name": "こめとはな (寺西家町家蔵 )", "address": "〒545-0011 大阪府大阪市阿倍野区昭和町１丁目９−２１", "isOsaka": true, "exists": true},
  {"id": "274", "name": "炭kappo hirac", "address": "〒530-0002 大阪府大阪市北区曽根崎新地１丁目５−８", "isOsaka": true, "exists": true},
  {"id": "275", "name": "中華そば フラン軒", "address": "〒542-0081 大阪府大阪市中央区北久宝寺町３丁目５−３", "isOsaka": true, "exists": true},
  {"id": "276", "name": "にんにく鶏焼肉サン", "address": "〒542-0086 大阪府大阪市中央区西心斎橋２丁目１０−３１", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 7 (IDs 247-276) results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(path.join(__dirname, 'refined_data_search.json'), 'utf8'));
    
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

    console.log(`Batch 7 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
