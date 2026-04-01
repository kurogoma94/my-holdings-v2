const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三'] }
];

const BROWSER_RESULTS = [
  {"id": "373", "name": "鮨かぜのぎ", "address": "大阪府大阪市中央区南船場3丁目8-2", "isOsaka": true, "exists": true},
  {"id": "374", "name": "鮨あさひ", "address": "大阪府大阪市西区新町1-22-12", "isOsaka": true, "exists": true},
  {"id": "375", "name": "りんご屋 西梅田店", "address": "大阪府大阪市北区梅田1丁目3-1", "isOsaka": true, "exists": true},
  {"id": "376", "name": "セアブラノ神 伏見剛力", "isOsaka": false},
  {"id": "377", "name": "うさみ亭 マツバヤ", "address": "大阪府大阪市中央区南船場3丁目8-1", "isOsaka": true, "exists": true},
  {"id": "378", "name": "海鮮工房 はしだて物産", "isOsaka": false},
  {"id": "379", "name": "天平 北新地本店", "address": "大阪府大阪市北区曽根崎新地1丁目8-12", "isOsaka": true, "exists": true},
  {"id": "380", "name": "ワイン酒場トマト", "address": "大阪府大阪市北区曽根崎1丁目7-15", "isOsaka": true, "exists": true},
  {"id": "381", "name": "阿蘇溶岩石焼 といとい 穴座", "address": "大阪府大阪市北区曽根崎1丁目7-10", "isOsaka": true, "exists": true},
  {"id": "382", "name": "にほんしゅ屋しゅうろく", "isOsaka": false},
  {"id": "383", "name": "メキシコ食堂 オラレ！", "isOsaka": false},
  {"id": "384", "name": "夜景 シュラスコテーブル 梅田店", "address": "大阪府大阪市北区小松原町1-27", "isOsaka": true, "exists": true},
  {"id": "385", "name": "タマゴのイザカヤ Atama", "address": "大阪府大阪市淀川区十三本町1-2-10", "isOsaka": true, "exists": true},
  {"id": "386", "name": "XEX WEST Salvatore Cuomo Bros.／The BAR", "address": "大阪府大阪市北区梅田2丁目2-22", "isOsaka": true, "exists": true},
  {"id": "387", "name": "朝呑み 楽酒", "isOsaka": false},
  {"id": "388", "name": "炉端焼き 亀清", "isOsaka": false},
  {"id": "389", "name": "炉端とおでん 呼炉凪来 梅田店", "address": "大阪府大阪市北区堂山町7-7", "isOsaka": true, "exists": true},
  {"id": "390", "name": "お好み焼き 花", "address": "大阪府大阪市都島区東野田町4-2-15", "isOsaka": true, "exists": true},
  {"id": "391", "name": "つけ麺 ひらの", "address": "大阪府大阪市東小橋1丁目1-6", "isOsaka": true, "exists": true},
  {"id": "392", "name": "トリタニ商店", "address": "大阪府大阪市中央区谷町6丁目2-41", "isOsaka": true, "exists": true},
  {"id": "393", "name": "鮨 奏", "address": "大阪府大阪市中央区西心斎橋1丁目10-3", "isOsaka": true, "exists": true},
  {"id": "394", "name": "ノドボトケ、上ル", "address": "大阪府大阪市北区天神橋4-5-7", "isOsaka": true, "exists": true},
  {"id": "395", "name": "空掘トーストカフェ ファイン", "address": "大阪府大阪市中央区松屋町5-5", "isOsaka": true, "exists": true},
  {"id": "396", "name": "串焼き猿", "address": "大阪府大阪市中央区道頓堀2-4-5", "isOsaka": true, "exists": true},
  {"id": "397", "name": "三定(さんさだ)", "address": "大阪府大阪市東成区東小橋1丁目6-7", "isOsaka": true, "exists": true},
  {"id": "398", "name": "焼肉ホルモンこたろう 三ノ宮店", "isOsaka": false},
  {"id": "399", "name": "最 本町店", "address": "大阪府大阪市中央区久太郎町3-4-10", "isOsaka": true, "exists": true},
  {"id": "400", "name": "料理が上手?な嫁の店", "isOsaka": false},
  {"id": "401", "name": "京 菓る茶cafe", "isOsaka": false},
  {"id": "402", "name": "UWASASTORE", "address": "大阪府大阪市北区小松原町1-20", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 11 (Indices 300-329) results...');
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

    console.log(`Batch 11 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
