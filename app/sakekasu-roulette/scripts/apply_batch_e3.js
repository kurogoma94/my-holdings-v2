const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const BATCH_E3_RESULTS = [
  { id: "95", hasLunch: false, hasDinner: true },  // ムスヒ: 夜のみ
  { id: "96", hasLunch: false, hasDinner: true },  // サコ家: 夜のみ
  { id: "97", hasLunch: false, hasDinner: true },  // 高田揚揚: 15:00-23:30
  { id: "98", hasLunch: false, hasDinner: true },  // 我恵你好: 17:00-
  { id: "99", hasLunch: true, hasDinner: true },   // プルチーノ: 11:30-14:30, 17:30-22:30
  { id: "100", hasLunch: true, hasDinner: true },  // コメジルシ: 土昼あり
  { id: "102", hasLunch: true, hasDinner: true },  // TACO BITEZ: 昼夜
  { id: "103", hasLunch: true, hasDinner: true },  // 新喜楽: 11:00-15:00, 17:00-22:30
  { id: "104", hasLunch: false, hasDinner: true },  // Nagumo: 16:30-23:00
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

    let count = 0;
    shops = shops.map(shop => {
        const r = BATCH_E3_RESULTS.find(x => x.id === shop.id);
        if (r) { shop.hasLunch = r.hasLunch; shop.hasDinner = r.hasDinner; count++; }
        return shop;
    });
    console.log(`Updated ${count} shops.`);

    const updatedJson = JSON.stringify(shops, null, 2);
    let newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);
    newContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}';`);
    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Done.');
}
run();
