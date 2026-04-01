const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '黒崎町'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪'] }
];

const BROWSER_RESULTS = [
  {"id": "311", "name": "炭火焼肉 たむら 蒲生本店", "address": "大阪府大阪市城東区中央1-8-30", "isOsaka": true, "exists": true},
  {"id": "312", "name": "旬菜 山﨑", "address": "大阪府吹田市佐井寺南が丘15-8", "isOsaka": true, "exists": true},
  {"id": "313", "name": "寿し処 錦", "address": "大阪府守口市寺内町1丁目8-8", "isOsaka": true, "exists": true},
  {"id": "315", "name": "日本酒 蔵朱 (マキショウ)", "address": "大阪府大阪市中央区谷町7-1-24", "isOsaka": true, "exists": true},
  {"id": "316", "name": "炭火焼肉 河内屋", "address": "大阪府東大阪市宝持4-2-19", "isOsaka": true, "exists": true},
  {"id": "317", "name": "味の洋食 ニューとん助", "address": "大阪府大阪市住之江区中加賀屋3-1-22", "isOsaka": true, "exists": true},
  {"id": "318", "name": "舟田", "address": "大阪府大阪市東成区大今里西2-8-12", "isOsaka": true, "exists": true},
  {"id": "319", "name": "橋本屋", "address": "大阪府大阪市中央区南船場2-2-21ｰ101", "isOsaka": true, "exists": true},
  {"id": "321", "name": "醤油らーめん専門 金久右衛門 本店", "address": "大阪府大阪市東成区深江北3-2-8", "isOsaka": true, "exists": true},
  {"id": "322", "name": "すき焼き・しゃぶしゃぶ きよ助", "address": "大阪府大阪市中央区上本町西1-3-28", "isOsaka": true, "exists": true},
  {"id": "323", "name": "鮨 なかみせ", "address": "大阪府大阪市北区曽根崎2-5-40", "isOsaka": true, "exists": true},
  {"id": "324", "name": "鉄板焼き イルテラ", "address": "大阪府大阪市北区中崎西4-2-30", "isOsaka": true, "exists": true},
  {"id": "325", "name": "Udon Kyutaro", "address": "大阪府大阪市中央区久太郎町3-1-16", "isOsaka": true, "exists": true},
  {"id": "327", "name": "クニーズ・南河生鮮市場", "address": "大阪府羽曳野市西浦3丁目6-920-1", "isOsaka": true, "exists": true},
  {"id": "328", "name": "いわや", "address": "大阪府大阪市城東区中央1丁目13-18", "isOsaka": true, "exists": true},
  {"id": "330", "name": "白銀亭 イトゥビル店", "address": "大阪府大阪市中央区南本町3-6-14", "isOsaka": true, "exists": true},
  {"id": "332", "name": "くら おさかな市場", "address": "大阪府貝塚市二色南町3-1", "isOsaka": true, "exists": true},
  {"id": "333", "name": "中華料理 若水", "address": "大阪府大阪市淀川区宮原5丁目3-41", "isOsaka": true, "exists": true},
  {"id": "334", "name": "あなごと日本酒 なかむら", "address": "大阪府大阪市北区梅田2丁目5-1", "isOsaka": true, "exists": true},
  {"id": "335", "name": "日本酒 かんき", "address": "大阪府大阪市北区梅田1丁目1-3 大阪駅前第3ビル B1-54", "isOsaka": true, "exists": true},
  {"id": "308", "name": "料理屋 植むら", "isOsaka": false},
  {"id": "309", "name": "赤石", "isOsaka": false},
  {"id": "310", "name": "ととまや", "isOsaka": false},
  {"id": "320", "name": "ラーメン 菜苑", "isOsaka": false},
  {"id": "326", "name": "三田天然温泉 寿ノ湯", "isOsaka": false},
  {"id": "329", "name": "Norðurljósavegur 9", "isOsaka": false},
  {"id": "331", "name": "casa di kudos", "isOsaka": false}
];

function run() {
    console.log('Applying Batch 9 (Indices 240-269) results...');
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

    console.log(`Batch 9 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
