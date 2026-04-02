const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const MASTER_DATA_PATH = path.join(__dirname, 'refined_data_search.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区', '福島', '野田'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '中崎', '豊崎', '北新地', '大淀', '西天満', '芝田', '浮田', '堂島浜'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋', '東天満', '末広町', '黒崎町', '天神橋', '黒崎町'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場', '北堀江', '東心斎橋', '心斎橋筋', '江戸堀', '西心斎橋'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町', '高津', '難波中', '宗右衛門町', '島之内', '日本橋', '難波千日前', '幸町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋', '東小橋', '田島', '生野東', '勝山北', '玉造', '深江南', '中本', '東中本'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界', '浪速区恵美須西', '恵美須東', '玉出中', '太子', '山王', '萩之茶屋', '天下茶屋'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生', '城見', 'OBP', '東野田町', '今福', '東中浜', '森之宮', '今福西'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町', '四天王寺', 'あべの', '阿倍野筋', '旭町', '舟橋町', '堀越町', '文の里', '東高津町', '空堀町', '小橋町', '悲田院町', '西田辺町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋', '松屋町', '高麗橋', '中央区瓦町', '伏見町', '日本橋', '瓦屋町', '中央区上汐', '常盤町'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '住吉区', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三', '大正', '旭区', '中津', '岸和田', '野江', '関目', '八尾市', '南河内郡', '交野市', '豊中市', '堺市', '長堂', '茨木市', '門真市', '此花区', '大正区', '横堤', '楠根南町', '西九条', '大開', '敷津東', '足代', '私部', '東住吉区', '平野区', '九条', '高槻市', '千里山西', '上新田', '明野町', '藤井寺市'] }
];

const BROWSER_RESULTS = [
  {"id": "716", "name": "ビッグジョー", "address": "大阪府藤井寺市野中2-66", "isOsaka": true, "exists": true},
  {"id": "717", "name": "宇宙", "address": "大阪府大阪市生野区田島4-7-27", "isOsaka": true, "exists": true},
  {"id": "718", "name": "膳處漢ぽっちり", "isOsaka": false},
  {"id": "720", "name": "島之内フジマル醸造所", "address": "大阪府大阪市中央区島之内1-1-14 三和ビル1F", "isOsaka": true, "exists": true},
  {"id": "721", "name": "焼鳥 サイヒ", "address": "大阪府大阪市中央区南船場4-10-22", "isOsaka": true, "exists": true},
  {"id": "722", "name": "北新地君しま", "address": "大阪府大阪市北区曽根崎新地1-2-24 ニューウメダビルB1F", "isOsaka": true, "exists": true},
  {"id": "723", "name": "鉄板焼ホルモン やまき", "address": "大阪府大阪市西成区萩之茶屋2-2-7", "isOsaka": true, "exists": true},
  {"id": "724", "name": "すき焼･鍋 なべや", "address": "大阪府大阪市西成区天下茶屋北2-6-5", "isOsaka": true, "exists": true},
  {"id": "725", "name": "Ellie", "address": "大阪府大阪市城東区森之宮2-6-4", "isOsaka": true, "exists": true},
  {"id": "726", "name": "居魚家 ぎんた", "address": "大阪府大阪市東成区中本5-22-12", "isOsaka": true, "exists": true},
  {"id": "727", "name": "ふく玄", "address": "大阪府大阪市東成区東中本1-15-35", "isOsaka": true, "exists": true},
  {"id": "728", "name": "串揚げ料理 みや田", "address": "大阪府大阪市東成区東中本2-2-10 ノバカネイチ緑橋104", "isOsaka": true, "exists": true},
  {"id": "729", "name": "銀座鮨 緑橋店", "address": "大阪府大阪市東成区東中本2-1-21", "isOsaka": true, "exists": true},
  {"id": "730", "name": "炭火焼酒楼 おいしかよ。", "address": "大阪府大阪市阿倍野区西田辺町2-8-10", "isOsaka": true, "exists": true},
  {"id": "731", "name": "パティスリールヴィジテ", "address": "大阪府大阪市東成区東中本3-16-15 サニーハイツ緑橋 1F", "isOsaka": true, "exists": true},
  {"id": "732", "name": "バールISOLA", "address": "大阪府大阪市城東区今福西1-5-2", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Final Batch 22 (IDs 716-732) results...');
    const tracker = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
    const master = JSON.parse(fs.readFileSync(MASTER_DATA_PATH, 'utf8'));
    
    const salvagedResults = BROWSER_RESULTS.filter(r => r.isOsaka && r.exists);
    const excludeIds = BROWSER_RESULTS.filter(r => r.isOsaka === false || r.exists === false).map(r => r.id);
    
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
    tracker.nextIndex = tracker.total; 
    fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2));

    console.log(`Final Batch 22 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
    console.log(`ALL DATA SALVAGED SUCCESSFULLY!`);
}

run();
