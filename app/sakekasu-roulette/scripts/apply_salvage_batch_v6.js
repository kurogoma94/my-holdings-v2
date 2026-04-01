const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃花山'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区'] }
];

const BROWSER_RESULTS = [
  {"id": "216", "name": "海鮮と幻餃子 ぼちぼち", "address": "〒550-0002 大阪府大阪市西区江戸堀１丁目１９−２４", "isOsaka": true, "area": "Honmachi", "exists": true},
  {"id": "217", "name": "ゆうすけ", "address": "〒532-0011 大阪府大阪市淀川区西中島３丁目１５−３", "isOsaka": true, "area": "Nishinakajima", "exists": true},
  {"id": "218", "name": "山空海温泉", "address": "〒563-0123 大阪府豊能郡能勢町下田尻８０１", "isOsaka": true, "area": "Nose", "exists": true},
  {"id": "219", "name": "レストランひだまり 道の駅 能勢", "address": "〒563-0351 大阪府豊能郡能勢町栗栖７０", "isOsaka": true, "area": "Nose", "exists": true},
  {"id": "220", "name": "ぱすた屋しかちゃん", "address": "〒553-0003 大阪府大阪市福島区福島７丁目１１−５１", "isOsaka": true, "area": "Fukushima", "exists": true},
  {"id": "221", "name": "バリバール 福島店", "address": "〒553-0003 大阪府大阪市福島区福島７丁目１１−５１", "isOsaka": true, "area": "Fukushima", "exists": true},
  {"id": "222", "name": "DE FRITES STAAN", "address": "〒542-0086 大阪府大阪市中央区西心斎橋１丁目１３−２１", "isOsaka": true, "area": "Shinsaibashi", "exists": true},
  {"id": "223", "name": "ブルーノ HEPナビオ店", "address": "〒530-0017 大阪府大阪市北区角田町７−１０ HEP NAVIO 7F", "isOsaka": true, "area": "Umeda", "exists": true},
  {"id": "224", "name": "SAYAMISTYLE(サヤミスタイル)", "address": "〒542-0075 大阪府大阪市中央区難波千日前７−１２", "isOsaka": true, "area": "Namba", "exists": true},
  {"id": "225", "name": "日本料理 寺田", "address": "〒543-0052 大阪府大阪市天王寺区大道１丁目５−１３", "isOsaka": true, "area": "Tennoji", "exists": true},
  {"id": "226", "name": "洋食屋 ふじ家", "address": "〒540-0028 大阪府大阪市中央区槍屋町２丁目２−１", "isOsaka": true, "area": "Honmachi", "exists": true},
  {"id": "227", "name": "鮨 まごのて", "address": "〒531-0072 大阪府大阪市北区豊崎３丁目１０−２", "isOsaka": true, "area": "Umeda", "exists": true},
  {"id": "228", "name": "酒屋へちかん", "address": "〒530-0041 大阪府大阪市北区天神橋４丁目１２−１７", "isOsaka": true, "area": "Tenma", "exists": true},
  {"id": "229", "name": "寿しわげんせ", "address": "〒542-0082 大阪府大阪市中央区島之内２丁目１３−２７", "isOsaka": true, "area": "Shinsaibashi", "exists": true},
  {"id": "230", "name": "しっとう屋", "address": "〒532-0011 大阪府大阪市淀川区西中島３丁目１７−１０", "isOsaka": true, "area": "Nishinakajima", "exists": true},
  {"id": "231", "name": "墨国回転鶏料理", "address": "〒530-0033 大阪府大阪市北区池田町８−４", "isOsaka": true, "area": "Tenma", "exists": true},
  {"id": "232", "name": "フーナ", "address": "〒530-0022 大阪府大阪市北区浪花町５−１４", "isOsaka": true, "area": "Tenma", "exists": true},
  {"id": "233", "name": "お魚処 藁ヤキ炭ヒデ", "address": "〒550-0003 大阪府大阪市西区京町堀１丁目１２−１１", "isOsaka": true, "area": "Honmachi", "exists": true},
  {"id": "234", "name": "梅田 ちょうつがひ", "address": "〒530-0017 大阪府大阪市北区角田町８−４７ 阪急32番街 28F", "isOsaka": true, "area": "Umeda", "exists": true},
  {"id": "235", "name": "焼肉 新楽井", "address": "〒544-0034 大阪府大阪市生野区桃谷２丁目１５−１２", "isOsaka": true, "area": "Tsuruhashi", "exists": true},
  {"id": "236", "name": "MONIQUE", "address": "〒530-0015 大阪府大阪市北区中崎西２丁目４−３５", "isOsaka": true, "area": "Umeda", "exists": true},
  {"id": "238", "name": "パルレ", "address": "〒530-0015 大阪府大阪市北区中崎西４丁目３−４５", "isOsaka": true, "area": "Umeda", "exists": true},
  {"id": "239", "name": "濃厚中華そば よし田", "address": "〒542-0083 大阪府大阪市中央区東心斎橋１丁目６−１５", "isOsaka": true, "area": "Shinsaibashi", "exists": true},
  {"id": "240", "name": "をにわ 河原町店", "address": "〒600-8025 京都府京都市下京区清水町４５４−１", "isOsaka": false, "area": "Kyoto", "exists": true},
  {"id": "241", "name": "牡蛎処 桝政", "address": "〒671-1332 兵庫県たつの市御津町室津１０３４−８０", "isOsaka": false, "area": "Hyogo", "exists": true},
  {"id": "242", "name": "瀬越海産", "address": "〒671-1332 兵庫県たつの市御津町室津１０３４−２", "isOsaka": false, "area": "Hyogo", "exists": true},
  {"id": "243", "name": "お初の十忠八九", "address": "〒530-0057 大阪府大阪市北区曽根崎２丁目１３−１７", "isOsaka": true, "area": "Umeda", "exists": true},
  {"id": "244", "name": "ヘミングウェイ", "address": "〒554-0052 大阪府大阪市此花区常吉２丁目１３−１８", "isOsaka": true, "area": "Konohana", "exists": true},
  {"id": "245", "name": "すし専門ストア 新橋かど平", "address": "〒105-0004 東京都港区新橋４丁目１１−５", "isOsaka": false, "area": "Tokyo", "exists": true},
  {"id": "246", "name": "すし専門ストア かど平", "address": "〒105-0004 東京都港区新橋３丁目６−１１", "isOsaka": false, "area": "Tokyo", "exists": true}
];

function run() {
    console.log('Applying Batch 6 (IDs 216-246) results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const pendingJson = JSON.parse(fs.readFileSync(PENDING_PATH, 'utf8'));
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
            // Find related data from master
            const masterItem = master.find(m => m.id === result.id);
            if (masterItem) {
                const newShop = {
                    ...masterItem,
                    address: result.address,
                    isActive: true,
                    createdAt: "2026-03-31"
                };

                // Area Re-classification
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

    console.log(`Batch 6 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
