const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const BATCH_E1_RESULTS = [
  { id: "53", hasLunch: true, hasDinner: true },   // ふぐ久: 12:00-22:00
  { id: "58", hasLunch: true, hasDinner: true },   // 寿司処 眞: 11:30-22:30
  { id: "61", hasLunch: true, hasDinner: true },   // 鶏Soba 座銀: 10:30-22:00
  { id: "62", hasLunch: true, hasDinner: true },   // とんかつひろ喜: 11:30-14:00, 17:00-21:00
  { id: "63", hasLunch: true, hasDinner: false },  // 株式会社スズヤ: 9:00-19:00 (駄菓子屋)
  { id: "65", hasLunch: true, hasDinner: true },   // MON CRULLER: 12:00-22:00
  { id: "68", hasLunch: true, hasDinner: true },   // ハンバーグ卵: 11:00-15:00, 17:00-21:00
  { id: "69", hasLunch: true, hasDinner: true },   // いわ志: 11:30-15:00, 17:00-23:00
  { id: "70", hasLunch: true, hasDinner: true },   // あお山: 11:00-23:30
  { id: "71", hasLunch: true, hasDinner: true },   // グリルショップやの: 11:00-14:00, 17:00-20:00
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
        const r = BATCH_E1_RESULTS.find(x => x.id === shop.id);
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
