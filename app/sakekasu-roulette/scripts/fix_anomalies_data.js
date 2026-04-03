const fs = require('fs');
const mockDataPath = require('path').join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Fix スタンドＢ
content = content.replace(/"name": "高槻大衆ネオン居酒屋 スタンドＢ",\s*"area": "([^"]*)",([\s\S]*?)"address": "([^"]*)"/g, (match, p1, p2, p3) => {
    return `"name": "高槻大衆ネオン居酒屋 スタンドＢ",\n    "area": "hokusetsu",${p2}"address": "大阪府高槻市高槻町14-8 幸ビル 2F"`;
});

// Fix 焼肉はぐれ雲なんば
content = content.replace(/"name": "焼肉はぐれ雲なんば",\s*"area": "([^"]*)",([\s\S]*?)"address": "([^"]*)"/g, (match, p1, p2, p3) => {
    return `"name": "焼肉はぐれ雲なんば",\n    "area": "namba",${p2}"address": "大阪府大阪市浪速区難波中1-7-21 難波中央ビル1F"`;
});

// Fix 地酒蔵大阪 なんば本店
content = content.replace(/"name": "地酒蔵大阪 なんば本店",\s*"area": "([^"]*)"/g, `"name": "地酒蔵大阪 なんば本店",\n    "area": "namba"`);

// Fix 麺屋 帆のる大阪なんば店
content = content.replace(/"name": "麺屋 帆のる大阪なんば店",\s*"area": "([^"]*)"/g, `"name": "麺屋 帆のる大阪なんば店",\n    "area": "namba"`);

// Fix 和牛タン次郎 大阪天満店
content = content.replace(/"name": "和牛タン次郎 大阪天満店",\s*"area": "([^"]*)"/g, `"name": "和牛タン次郎 大阪天満店",\n    "area": "tenma"`);

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log("Fixed 5 anomalies!");
