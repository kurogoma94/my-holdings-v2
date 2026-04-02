const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

const RULES = [
  { area: 'nishinakajima', keywords: ['西中島', '新大阪', '宮原', '東中島', '木川'] },
  { area: 'umeda', keywords: ['曽根崎', '芝田', '茶屋町', '梅田', '太融寺', '兎我野', '小松原', '堂山町', '堂島'] },
  { area: 'tenma', keywords: ['天神橋', '池田町', '浪花町', '黒崎町', '南森町', '東天満', '中崎'] },
  { area: 'abeno', keywords: ['阿倍野', '悲田院', '堀越町', '四天王寺', '天王寺', '昭和町'] },
  { area: 'namba', keywords: ['難波', '千日前', '道頓堀', '宗右衛門', '高津', '日本橋', '大国'] },
  { area: 'shinsaibashi', keywords: ['堀江', '南船場', '西心斎橋', '東心斎橋', '心斎橋', '四ツ橋'] },
  { area: 'kitahama', keywords: ['北浜', '淀屋橋', '平野町', '瓦町', '京町堀', '高麗橋', '内平野', '船場', '肥後橋', '本町'] },
  { area: 'fukushima', keywords: ['福島', '野田'] }
];

function run() {
    console.log('Reading MockData.ts...');
    let content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    
    const startMarker = 'export const MOCK_SHOPS: Shop[] = [';
    const endMarker = '];';
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.lastIndexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        console.error('Markers not found in MockData.ts');
        return;
    }

    const jsonText = content.substring(startIndex + startMarker.length - 1, endIndex + 1);
    let shops = JSON.parse(jsonText);
    let movedCount = 0;
    const stats = {};

    shops = shops.map(shop => {
        if (shop.area === 'other' && shop.isActive) {
            const addr = shop.address || '';
            const name = shop.name || '';
            for (const rule of RULES) {
                if (rule.keywords.some(k => addr.includes(k) || name.includes(k))) {
                    shop.area = rule.area;
                    movedCount++;
                    stats[rule.area] = (stats[rule.area] || 0) + 1;
                    break;
                }
            }
        }
        return shop;
    });

    console.log(`Reclassified ${movedCount} shops.`);
    console.log('Stats:', stats);

    const updatedJson = JSON.stringify(shops, null, 2);
    let newContent = content.substring(0, startIndex + startMarker.length - 1) + updatedJson + content.substring(endIndex + 1);

    // Update MOCK_DATA_UPDATED_AT
    const now = new Date().toISOString();
    newContent = newContent.replace(/export const MOCK_DATA_UPDATED_AT = '.*?';/, `export const MOCK_DATA_UPDATED_AT = '${now}';`);

    fs.writeFileSync(MOCK_DATA_PATH, newContent);
    console.log('Successfully updated MockData.ts');
}

run();
