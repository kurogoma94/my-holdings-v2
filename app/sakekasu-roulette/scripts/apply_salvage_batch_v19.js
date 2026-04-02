const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区', '福島', '野田'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '大淀', '西天満', '芝田', '浮田', '堂島浜'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋', '心斎橋筋', '江戸堀'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中', '宗右衛門町', '島之内', '日本橋', '難波千日前', '幸町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北', '玉造'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東', '玉出中', '太子', '山王'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町', '舟橋町', '堀越町', '文の里', '東高津町', '空堀町', '小橋町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋', '瓦屋町', '中央区上汐'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '住吉区', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開', '敷津東', '足代', '私部', '東住吉区'] }
];

const BROWSER_RESULTS = [
  {"id": "622", "name": "鮨 なかもと", "address": "大阪府大阪市中央区難波千日前4-35", "isOsaka": true, "exists": true},
  {"id": "623", "name": "お食事処 美登里", "address": "大阪府大阪市東成区中道3-14-11", "isOsaka": true, "exists": true},
  {"id": "624", "name": "鮨実紀 Sushi Minoki", "address": "大阪府大阪市北区曽根崎新地1-2-6 新松リンデンビル1F", "isOsaka": true, "exists": true},
  {"id": "625", "name": "うを勢 総本店", "isOsaka": false},
  {"id": "627", "name": "釜山", "address": "大阪府大阪市東成区東小橋3-12-15", "isOsaka": true, "exists": true},
  {"id": "628", "name": "どんたく堂山店", "address": "大阪府大阪市北区堂山町16-12", "isOsaka": true, "exists": true},
  {"id": "629", "name": "八重勝", "address": "大阪府大阪市浪速区恵美須東3-4-13", "isOsaka": true, "exists": true},
  {"id": "631", "name": "ニューブンゴ 福島本店", "address": "大阪府大阪市福島区福島7-11-51 ふくろうじ商店街47号", "isOsaka": true, "exists": true},
  {"id": "632", "name": "鉄板料理 Rakuda 安城店", "isOsaka": false},
  {"id": "633", "name": "ゑんどう寿司 中央市場店", "address": "大阪府大阪市福島区野田1-1-86", "isOsaka": true, "exists": true},
  {"id": "634", "name": "桃白白", "isOsaka": false},
  {"id": "635", "name": "ベトコンラーメン 新京 中川店", "isOsaka": false},
  {"id": "636", "name": "圓家", "isOsaka": false},
  {"id": "637", "name": "焼肉 安萬 安城本店", "isOsaka": false},
  {"id": "638", "name": "虎連坊 ヒルトンプラザウエスト店", "address": "大阪府大阪市北区梅田2-2-2 ヒルトンプラザウエストB2F", "isOsaka": true, "exists": true},
  {"id": "639", "name": "万両 南森町店", "address": "大阪府大阪市北区南森町1-2-14 ロイヤルハイツ1F", "isOsaka": true, "exists": true},
  {"id": "640", "name": "アングル", "isOsaka": false},
  {"id": "641", "name": "イタリア料理 casa bianca(カーサビアンカ)", "address": "大阪府大阪市東住吉区南田辺3丁目", "isOsaka": true, "exists": true},
  {"id": "642", "name": "中華 味一 目黒", "isOsaka": false},
  {"id": "643", "name": "寿司と天ぷら ニューツルマツ", "address": "大阪府大阪市中央区千日前2-7-22", "isOsaka": true, "exists": true},
  {"id": "644", "name": "わらまさ", "address": "大阪府大阪市中央区難波千日前14-25", "isOsaka": true, "exists": true},
  {"id": "645", "name": "SAKE NERD (サケナード)", "address": "大阪府大阪市浪速区幸町1-2-8 82minatomachi 3F", "isOsaka": true, "exists": true},
  {"id": "646", "name": "カウンター焼肉うしすき", "address": "大阪府大阪市北区曾根崎新地1-8-3 遅ビル 3F", "isOsaka": true, "exists": true},
  {"id": "647", "name": "中国菜 OIL(オイル)", "address": "大阪府大阪市福島区福島6-19-12", "isOsaka": true, "exists": true},
  {"id": "648", "name": "餃子工房 ユーミン", "address": "大阪府大阪市天王寺区空堀町6-1", "isOsaka": true, "exists": true},
  {"id": "649", "name": "渡邊咖喱 梅田本店", "address": "大阪府大阪市北区曾根崎新地2-2-5", "isOsaka": true, "exists": true},
  {"id": "650", "name": "中華そば ひふみ", "address": "大阪府大阪市北区曾根崎新地1-6-28", "isOsaka": true, "exists": true},
  {"id": "651", "name": "喫茶ルプラ｜Lupra's Roasting Factory & café", "address": "大阪府大阪市天王寺区小橋町8-15", "isOsaka": true, "exists": true},
  {"id": "652", "name": "マロリーポークステーキ難波店", "address": "大阪府大阪市中央区難波5-1-60 なんばCITY本館 B1F", "isOsaka": true, "exists": true},
  {"id": "653", "name": "寿司としゃぶしゃぶ No.8 梅田店", "address": "大阪府大阪市北区堂山町6-1 3F", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 19 (IDs 622-653) results...');
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
                    createdAt: "2026-04-02"
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
    tracker.nextIndex += 30; // ID is processed in chunks of 30 from the exclude list.
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Batch 19 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
