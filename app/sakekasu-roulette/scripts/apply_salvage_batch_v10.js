const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(__dirname, 'salvage_tracker.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const UNVERIFIED_PATH = path.join(__dirname, 'unverified_salvage.json');
const PENDING_PATH = path.join(__dirname, 'batch_pending.json');

const AREA_RULES = [
    { code: 'fukushima', keywords: ['福島区'] },
    { code: 'umeda', keywords: ['北区梅田', '曾根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '中崎西', '豊崎', '北新地', '黒崎町', '大淀'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '天神橋筋六丁目', '天満橋'] },
    { code: 'shinsaibashi', keywords: ['心斎橋', '堀江', '西区新町', '西区立売堀', '南堀江', '北堀江', '西区江戸堀', '西区京町堀', '島之内', 'アメ村', 'アメリカ村', '南船場'] },
    { code: 'namba', keywords: ['難波', '千日前', '道頓堀', '浪速区難波中', '浪速区元町', '浪速区桜川', '浪速区湊町', '浪速区稲荷', '浪速区塩草', '浪速区幸町', '浪速区立葉', '浪速区大国', '浪速区戎本町'] },
    { code: 'tsuruhashi', keywords: ['生野区', '東成区', '桃谷', '今里', '深江', '深江橋'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区', '新世界'] },
    { code: 'kyobashi', keywords: ['都島区', '城東区', '蒲生'] },
    { code: 'abeno', keywords: ['阿倍野区', '天王寺区', '昭和町', '天王寺町'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '大手通', '谷町', '上本町', '本町橋'] },
    { code: 'other', keywords: ['淀川区', '西中島', '能勢', '豊能郡', '此花区', '泉佐野', '忠岡町', '住之江', '東淀川', '上新庄', '羽曳野', '貝塚', '守口', '吹田', '東大阪', '十三'] }
];

const BROWSER_RESULTS = [
  {"id": "339", "name": "かがやきダイナー", "address": "〒531-0075 大阪府大阪市北区大淀南１丁目３−１７", "isOsaka": true, "exists": true},
  {"id": "340", "name": "梅田日本酒エビス", "address": "〒530-0026 大阪府大阪市北区神山町１５−１０", "isOsaka": true, "exists": true},
  {"id": "341", "name": "べにくらげ", "address": "〒540-0029 大阪府大阪市中央区本町橋５−４", "isOsaka": true, "exists": true},
  {"id": "343", "name": "鉄板焼肉 ホルモンまきの", "address": "〒530-0027 大阪府大阪市北区堂山町１１−１４", "isOsaka": true, "exists": true},
  {"id": "344", "name": "天ぷら大吉 なんばこめじるし店", "address": "〒556-0011 大阪府大阪市浪速区難波中２丁目１０−２５", "isOsaka": true, "exists": true},
  {"id": "345", "name": "居酒屋 ながほり", "address": "〒542-0082 大阪府大阪市中央区島之内１丁目１１−５", "isOsaka": true, "exists": true},
  {"id": "346", "name": "南越谷SUSHI WORKS", "address": "〒343-0845 埼玉県越谷市南越谷１丁目１−６４", "isOsaka": false, "exists": true},
  {"id": "347", "name": "きみや", "address": "〒544-0034 大阪府大阪市生野区桃谷２丁目９−４", "isOsaka": true, "exists": true},
  {"id": "348", "name": "にんにくバル ザ・ガーリック中野", "address": "〒164-0001 東京都中野区中野５丁目３２−５", "isOsaka": false, "exists": true},
  {"id": "349", "name": "小料理 おばんざい 小よし", "address": "〒542-0083 大阪府大阪市中央区東心斎橋１丁目１３−１２", "isOsaka": true, "exists": true},
  {"id": "350", "name": "湯どうふ うえ川 南店", "address": "〒542-0084 大阪府大阪市中央区宗右衛門町３−１１", "isOsaka": true, "exists": true},
  {"id": "351", "name": "蛸八", "address": "〒542-0071 大阪府大阪市中央区道頓堀１丁目５−１０", "isOsaka": true, "exists": true},
  {"id": "353", "name": "ぎょうざの焼吉", "address": "〒553-0003 大阪府大阪市福島区福島５丁目１１−２０", "isOsaka": true, "exists": true},
  {"id": "355", "name": "TACOS 3HERMANOS HARAJUKU", "address": "〒150-0001 東京都渋谷区神宮前３丁目２７−３", "isOsaka": false, "exists": true},
  {"id": "356", "name": "黒羊羊肉串店 BLACK SHEEP", "address": "〒530-0033 大阪府大阪市北区池田町７−８", "isOsaka": true, "exists": true},
  {"id": "357", "name": "たこ焼き&BAR プルプ", "address": "〒542-0083 大阪府大阪市中央区東心斎橋２丁目１−１３", "isOsaka": true, "exists": true},
  {"id": "358", "name": "花かご", "address": "〒530-0027 大阪府大阪市北区堂山町８−１０", "isOsaka": true, "exists": true},
  {"id": "359", "name": "立ち喰い寿司 ゲンヤ倶楽部", "address": "〒532-0023 大阪府大阪市淀川区十三東３丁目２８−４", "isOsaka": true, "exists": true},
  {"id": "360", "name": "北新地おにぎり 夜の一粒", "address": "〒530-0002 大阪府大阪市北区曽根崎新地１丁目３−２４", "isOsaka": true, "exists": true},
  {"id": "361", "name": "卵かけめし 肉すい専門 やまや", "address": "〒530-0027 大阪府大阪市北区堂山町１７−７", "isOsaka": true, "exists": true},
  {"id": "362", "name": "しゃぶ長", "address": "〒542-0083 大阪府大阪市中央区東心斎橋１丁目１５−２５", "isOsaka": true, "exists": true},
  {"id": "363", "name": "揚子江ラーメン 名門", "address": "〒530-0027 大阪府大阪市北区堂山町１７−１", "isOsaka": true, "exists": true},
  {"id": "364", "name": "按田餃子 代々木上原店", "address": "〒151-0066 東京都渋谷区西原３丁目７−６", "isOsaka": false, "exists": true},
  {"id": "365", "name": "田舎の大鵬", "address": "〒604-8316 京都府京都市中京区要法寺町４５１", "isOsaka": false, "exists": true},
  {"id": "366", "name": "貝鮮浜焼きバイキング あみ浜食堂", "address": "〒530-0012 大阪府大阪市北区芝田１丁目１−３", "isOsaka": true, "exists": true},
  {"id": "367", "name": "なにわ而楽", "address": "〒530-0002 大阪府大阪市北区曽根崎新地１丁目５−７", "isOsaka": true, "exists": true},
  {"id": "368", "name": "御幸町ONO", "address": "〒604-8044 京都府京都市中京区大日町４２３", "isOsaka": false, "exists": true},
  {"id": "369", "name": "炭炉まん", "address": "〒530-0027 大阪府大阪市北区堂山町６−６", "isOsaka": true, "exists": true},
  {"id": "370", "name": "立ち飲みやみー", "address": "〒530-0027 大阪府大阪市北区堂山町１７−５", "isOsaka": true, "exists": true},
  {"id": "371", "name": "野菜酒場あしおと", "address": "〒600-8095 京都府京都市下京区扇酒屋町２７６−２", "isOsaka": false, "exists": true}
];

function run() {
    console.log('Applying Batch 10 (Indices 270-299) results...');
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

    console.log(`Batch 10 complete.`);
    console.log(`- Salvaged: ${salvagedCount}`);
    console.log(`- Excluded: ${excludeIds.length}`);
    console.log(`- Current total in MockData: ${currentShops.length}`);
}

run();
