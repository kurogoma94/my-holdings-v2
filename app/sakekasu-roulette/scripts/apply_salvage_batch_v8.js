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
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野'] }
];

const BROWSER_RESULTS = [
  {"id": "277", "name": "グリル ロン", "address": "大阪府大阪市北区芝田1丁目1-3 阪急三番街 B2F", "isOsaka": true, "exists": true},
  {"id": "278", "name": "Bar continue", "address": "大阪府大阪市東成区大今里4丁目23-15", "isOsaka": true, "exists": true},
  {"id": "279", "name": "うなぎの中庄 心斎橋店", "address": "大阪府大阪市中央区東心斎橋1-17-15 丸清ビル1F", "isOsaka": true, "exists": true},
  {"id": "280", "name": "味の洋食 ニューとん助", "address": "大阪府大阪市住之江区中加賀屋3-1-22", "isOsaka": true, "exists": true},
  {"id": "281", "name": "舟田", "address": "大阪府大阪市東成区大今里西2丁目8-12", "isOsaka": true, "exists": true},
  {"id": "282", "name": "和洋酒菜 ひで", "address": "大阪府大阪市中央区心斎橋筋2丁目1-3", "isOsaka": true, "exists": true},
  {"id": "283", "name": "酒場 やまと", "address": "大阪府大阪市北区小松原町2-4 大阪富国生命ビル B2F", "isOsaka": true, "exists": true},
  {"id": "284", "name": "美食米門 梅田", "address": "大阪府大阪市北区梅田2-2-22 ハービス PLAZA ENT 5F", "isOsaka": true, "exists": true},
  {"id": "285", "name": "友安製作所 Cafe & Bar 阿倍野", "address": "大阪府大阪市阿倍野区阿倍野筋2-3-8", "isOsaka": true, "exists": true},
  {"id": "286", "name": "王道家直系 我道家 OSAKA", "address": "大阪府大阪市浪速区湊町1丁目3-1 B1F", "isOsaka": true, "exists": true},
  {"id": "287", "name": "寿司 常", "address": "大阪府大阪市北区天神橋2丁目4-3", "isOsaka": true, "exists": true},
  {"id": "288", "name": "華風料理 一芳亭 本店", "address": "大阪府大阪市浪速区難波中2-6-22", "isOsaka": true, "exists": true},
  {"id": "289", "name": "焼肉 まつえ", "address": "大阪府大阪市東淀川区小松4丁目9-26", "isOsaka": true, "exists": true},
  {"id": "290", "name": "PIZZERIA NAPOLETANA ASSO DA YAMAGUCHI中崎町", "address": "大阪府大阪市北区黒崎町9-5 1階", "isOsaka": true, "exists": true},
  {"id": "291", "name": "焼肉 こてつ", "address": "大阪府大阪市阿倍野区天王寺町北2丁目2-5", "isOsaka": true, "exists": true},
  {"id": "292", "name": "イタリアン チャイナバル村塾", "address": "大阪府大阪市中央区難波千日前14-18 ピースフィールドビル 1F", "isOsaka": true, "exists": true},
  {"id": "293", "name": "燻製工房 ホイコッケン", "address": "広島県広島市南区元宇品町15-7", "isOsaka": false, "exists": true},
  {"id": "294", "name": "もつ煮本舗 まるさん食堂", "address": "茨城県水戸市平須町1820-263", "isOsaka": false, "exists": true},
  {"id": "295", "name": "橋本屋", "address": "大阪府大阪市中央区南船場2丁目2-21ｰ101", "isOsaka": true, "exists": true},
  {"id": "296", "name": "ラーメン 菜苑", "address": "東京都江東区亀戸3丁目1-8 飯沼ビル", "isOsaka": false, "exists": true},
  {"id": "297", "name": "醤油らーめん専門 金久右衛門 本店", "address": "大阪府大阪市東成区深江北3丁目2-8 シティメゾン深江", "isOsaka": true, "exists": true},
  {"id": "299", "name": "すき焼き・しゃぶしゃぶ きよ助", "address": "大阪府大阪市中央区上本町西1丁目3-28", "isOsaka": true, "exists": true},
  {"id": "300", "name": "鮨 なかみせ", "address": "大阪府大阪市北区曽根崎2丁目5-40", "isOsaka": true, "exists": true},
  {"id": "301", "name": "鉄板焼き イルテラ", "address": "大阪府大阪市北区中崎西4丁目2-30", "isOsaka": true, "exists": true},
  {"id": "302", "name": "Udon Kyutaro", "address": "大阪府大阪市中央区久太郎町3-1-16 丼池繊維会館 1F", "isOsaka": true, "exists": true},
  {"id": "303", "name": "三田天然温泉 寿ノ湯", "address": "兵庫県三田市富士が丘5丁目2", "isOsaka": false, "exists": true},
  {"id": "304", "name": "クニーズ・南河生鮮市場", "address": "大阪府羽曳野市西浦3丁目6-920-1", "isOsaka": true, "exists": true},
  {"id": "305", "name": "いわや", "address": "大阪府大阪市城東区中央1丁目13-18 角屋がもよんビル 5F", "isOsaka": true, "exists": true},
  {"id": "306", "name": "Norðurljósavegur 9", "address": "Norðurljósavegur 9, 241 Grindavík, アイスランド", "isOsaka": false, "exists": true},
  {"id": "307", "name": "白銀亭 イトゥビル店", "address": "大阪府大阪市中央区南本町3丁目6-14 イトゥビル B2F", "isOsaka": true, "exists": true}
];

function run() {
    console.log('Applying Batch 8 (IDs 277-307) results...');
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

    console.log(`Batch 8 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
