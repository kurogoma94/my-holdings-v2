const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

// Batch D: 31 shops researched via web search
// Sources: tabelog, retty, hotpepper, gnavi, official sites
const BATCH_D_RESULTS = [
  // === Confirmed via web search ===
  { id: "62", hasLunch: true, hasDinner: true },   // アレグロ難波店: 土日祝ランチ11:30-15:00, ディナー17:00-23:00
  { id: "65", hasLunch: true, hasDinner: true },   // まんねん: 11:00～翌朝（通し営業）
  { id: "68", hasLunch: true, hasDinner: true },   // 串かつ 越源: 12:00-21:00
  { id: "70", hasLunch: false, hasDinner: true },  // 國型製作所: 17:30～翌2:00
  { id: "71", hasLunch: false, hasDinner: true },  // スタンドザッキー: 18:00-02:00
  { id: "74", hasLunch: false, hasDinner: true },  // 立呑み大黒: 15:00-22:00 (夕方から)
  { id: "85", hasLunch: false, hasDinner: true },  // 焼鳥 祐: 17:00-23:00
  { id: "88", hasLunch: false, hasDinner: true },  // 立ち飲みじんべえ: 16:00-23:30
  { id: "89", hasLunch: false, hasDinner: true },  // 焼野菜ぎんなん: 17:00-24:00
  { id: "92", hasLunch: false, hasDinner: true },  // 鳥しん: 18:00-27:00
  { id: "93", hasLunch: false, hasDinner: true },  // とりだん: 17:00-翌1:00
  { id: "96", hasLunch: false, hasDinner: true },  // サコ家: 18:00-02:00
  { id: "97", hasLunch: false, hasDinner: true },  // 高田揚揚: 15:00-23:30 (夕方から)
  { id: "98", hasLunch: false, hasDinner: true },  // 我恵你好: 17:00-00:00
  { id: "99", hasLunch: true, hasDinner: true },   // プルチーノ: 11:30-14:30, 17:30-22:30
  { id: "100", hasLunch: false, hasDinner: true },  // コメジルシ: 月-水19:00-, 土12:00-(土日のみ昼) → 基本夜メイン
  { id: "103", hasLunch: true, hasDinner: true },  // 新喜楽 東店: ランチ11:00-15:00, ディナー17:00-22:30
  { id: "104", hasLunch: false, hasDinner: true },  // スタンドNagumo: 16:30-23:00

  // === Inferred from genre/type (not found in search) ===
  { id: "53", hasLunch: false, hasDinner: true },  // 4坪牡蠣小屋: 牡蠣バー→夜メイン
  { id: "58", hasLunch: false, hasDinner: true },  // ゑり瀬: 北新地の貝料理→夜のみ
  { id: "60", hasLunch: false, hasDinner: true },  // スタンドミコノス: 立ち飲み→夜のみ
  { id: "61", hasLunch: false, hasDinner: true },  // 天満のハコ: 天満の居酒屋→夜のみ
  { id: "63", hasLunch: false, hasDinner: true },  // ビアバーガンブリヌス: ビアバー→夜のみ
  { id: "69", hasLunch: false, hasDinner: true },  // 焼とんろき: 焼とん→夜のみ
  { id: "76", hasLunch: true, hasDinner: true },   // 麺屋てっぺん: ラーメン→昼夜想定
  { id: "78", hasLunch: false, hasDinner: true },  // スタンド三津寺: スタンド→夜のみ
  { id: "80", hasLunch: false, hasDinner: true },  // すし慎: 鮨→夜メイン想定
  { id: "87", hasLunch: false, hasDinner: true },  // ぴっかり: 焼とん→夜のみ
  { id: "90", hasLunch: false, hasDinner: true },  // 岩亀: 居酒屋→夜のみ
  { id: "94", hasLunch: false, hasDinner: true },  // 壱鳥: 焼鳥→夜のみ
  { id: "102", hasLunch: true, hasDinner: false },  // TACO BITEZ: タコス→ランチ〜夕方想定
];

function run() {
    console.log('Reading MockData.ts...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');

    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);

    let updatedCount = 0;
    shops = shops.map(shop => {
        const result = BATCH_D_RESULTS.find(r => r.id === shop.id);
        if (result) {
            shop.hasLunch = result.hasLunch;
            shop.hasDinner = result.hasDinner;
            updatedCount++;
        }
        return shop;
    });

    console.log(`Updated ${updatedCount} shops with Batch D data.`);

    const updatedJson = JSON.stringify(shops, null, 2);
    let newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);

    const now = new Date().toISOString();
    newContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${now}';`);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Successfully updated MockData.ts with Batch D.');
}

run();
