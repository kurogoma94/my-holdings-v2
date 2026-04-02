const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区', '福島', '野田'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '中崎', '豊崎', '北新地', '大淀', '西天満', '芝田', '浮田', '堂島浜'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋', '心斎橋筋', '江戸堀', '西心斎橋'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中', '宗右衛門町', '島之内', '日本橋', '難波千日前', '幸町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北', '玉造'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東', '玉出中', '太子', '山王'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町', '舟橋町', '堀越町', '文の里', '東高津町', '空堀町', '小橋町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋', '瓦屋町', '中央区上汐'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '住吉区', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開', '敷津東', '足代', '私部', '東住吉区', '平野区', '九条'] }
];

const BROWSER_RESULTS = [
  {"id": "654", "name": "焼鳥エナミ", "address": "大阪府大阪市北区西天満5-6-8", "isOsaka": true, "exists": true},
  {"id": "655", "name": "bistro & wine 苑（én)", "isOsaka": false},
  {"id": "656", "name": "ひつまぶし 鰻伸", "isOsaka": false},
  {"id": "657", "name": "ヨネヤ 梅田本店", "address": "大阪府大阪市北区角田町梅田地下街2-5 ホワイティうめだノースモール1", "isOsaka": true, "exists": true},
  {"id": "658", "name": "立ち寿司 杉尾 西中島店", "address": "大阪府大阪市淀川区西中島3-19-7 第一ユヤマビル", "isOsaka": true, "exists": true},
  {"id": "659", "name": "くろしを", "address": "大阪府大阪市大正区三軒家西1-17-2", "isOsaka": true, "exists": true},
  {"id": "660", "name": "桜もみじ", "address": "大阪府大阪市平野区平野西5-9-28 コーポ神田1F", "isOsaka": true, "exists": true},
  {"id": "661", "name": "炭焼きとおでん猪頭 梅田｜兎我野町店", "address": "大阪府大阪市北区兎我野町11-19 本社浪速ビル1F", "isOsaka": true, "exists": true},
  {"id": "662", "name": "ずいき", "address": "大阪府大阪市北区兎我野町13-6", "isOsaka": true, "exists": true},
  {"id": "663", "name": "味真", "address": "大阪府堺市西区浜寺船尾町東3-377", "isOsaka": true, "exists": true},
  {"id": "664", "name": "かすうどん うのたけ", "address": "大阪府大阪市中央区西心斎橋2-9-5 日宝三ツ寺会館 2F", "isOsaka": true, "exists": true},
  {"id": "665", "name": "柳井", "address": "大阪府大阪市中央区上汐2-4-6", "isOsaka": true, "exists": true},
  {"id": "666", "name": "喰海", "address": "大阪府大阪市北区堂島1-3-29 日宝新地レジャービル 1F", "isOsaka": true, "exists": true},
  {"id": "667", "name": "にくさぶろう", "address": "大阪府大阪市西区九条南1-3-16 レアレア九条56番館 1F", "isOsaka": true, "exists": true},
  {"id": "668", "name": "焼肉ホルモン 万千", "address": "大阪府大阪市中央区島之内2-13-9 第一右田ビル 1F", "isOsaka": true, "exists": true},
  {"id": "669", "name": "グリル 末松", "isOsaka": false},
  {"id": "670", "name": "グリル小宝", "isOsaka": false},
  {"id": "671", "name": "玄風館", "address": "大阪府大阪市北区堂山町3-12 ステージスカラブビル 2F", "isOsaka": true, "exists": true},
  {"id": "672", "name": "牛もつ鍋専門店やま本 京橋店", "address": "大阪府大阪市城東区蒲生1-1-22", "isOsaka": true, "exists": true},
  {"id": "673", "name": "牛もつどて鍋 まつい亭", "address": "大阪府大阪市都島区東野田町3-13-6", "isOsaka": true, "exists": true},
  {"id": "674", "name": "バルコラメント", "address": "大阪府大阪市北区茶屋町14-7", "isOsaka": true, "exists": true},
  {"id": "675", "name": "焼鳥えんや 中津店", "address": "大阪府大阪市北区豊崎3-6-11 エイトビル1階", "isOsaka": true, "exists": true},
  {"id": "676", "name": "饂飩とお酒 からほり きぬ川", "address": "大阪府大阪市中央区谷町7-6-35", "isOsaka": true, "exists": true},
  {"id": "678", "name": "La Lanterna di Genova", "address": "大阪府大阪市北区中崎3-2-8", "isOsaka": true, "exists": true},
  {"id": "679", "name": "魚太郎 浜焼きバーベキュー", "isOsaka": false},
  {"id": "680", "name": "丸鶴", "isOsaka": false},
  {"id": "681", "name": "豚足のかどや", "address": "大阪府大阪市浪速区難波中1-4-15 南松竹マンション1F", "isOsaka": true, "exists": true},
  {"id": "682", "name": "焼肉ギャング", "address": "大阪府大阪市北区曽根崎2-10-21 日宝曽根崎イースト1F", "isOsaka": true, "exists": true},
  {"id": "683", "name": "Macauda", "address": "大阪府大阪市中央区常盤町2-1-3 ハイネス常盤101", "isOsaka": true, "exists": true},
  {"id": "684", "name": "と木と", "address": "大阪府大阪市中央区瓦屋町1-2-11 からほりかわらやえん101", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 20 (IDs 654-684) results...');
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

    console.log(`Batch 20 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
