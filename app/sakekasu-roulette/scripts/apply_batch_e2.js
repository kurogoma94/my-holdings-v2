const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const BATCH_E2_RESULTS = [
  { id: "74", hasLunch: false, hasDinner: true },  // 丸正餃子店: 夕方から
  { id: "76", hasLunch: false, hasDinner: true },  // 墨や: 夜のみ
  { id: "78", hasLunch: false, hasDinner: true },  // Wine Bar Base: 夜のみ
  { id: "80", hasLunch: true, hasDinner: true },   // すし処 広川: 昼夜両方
  { id: "85", hasLunch: false, hasDinner: true },  // 牧水: 夜のみ
  { id: "87", hasLunch: false, hasDinner: true },  // 八起亭: 夜のみ
  { id: "88", hasLunch: true, hasDinner: true },   // にしかわ: 昼夜両方
  { id: "89", hasLunch: false, hasDinner: true },  // ジャグラー: 夜のみ
  { id: "90", hasLunch: false, hasDinner: true },  // THE MUSEN IN SHOCK: 夜のみ
  { id: "94", hasLunch: true, hasDinner: true },   // Trattoria Vispa: 昼夜(金曜ディナーあり)
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
        const r = BATCH_E2_RESULTS.find(x => x.id === shop.id);
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
