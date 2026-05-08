/**
 * 不正な店舗名（住所入り、長すぎる名前等）を検出するスクリプト
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

const lines = content.split('\n');
const suspiciousShops = [];
let currentShop = {};
let inShop = false;

for (const line of lines) {
  const trimmed = line.trim();
  
  if (trimmed === '{') {
    inShop = true;
    currentShop = {};
    continue;
  }
  
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) {
      const name = currentShop.name || '';
      let reasons = [];
      
      // 長すぎる名前（40文字以上）
      if (name.length > 40) reasons.push(`長い(${name.length}文字)`);
      
      // 郵便番号パターン
      if (/\d{3}-\d{4}/.test(name) || /〒/.test(name)) reasons.push('郵便番号');
      
      // 全角郵便番号
      if (/[０-９]{3}[-ー][０-９]{4}/.test(name)) reasons.push('全角郵便番号');
      
      // 都道府県+市区町村パターン
      if (/[都道府県].*[市区町村]/.test(name)) reasons.push('住所(都道府県)');
      
      // 丁目パターン
      if (/丁目/.test(name)) reasons.push('住所(丁目)');
      
      // 番地パターン（−数字−数字）
      if (/[０-９]+[−ー][０-９]+[−ー][０-９]+/.test(name)) reasons.push('番地');
      
      // 「さぁみな！（略称）」のようなメタ情報
      if (/略称/.test(name)) reasons.push('略称表記');
      
      if (reasons.length > 0) {
        suspiciousShops.push({
          id: currentShop.id,
          name: name,
          comment: currentShop.comment || '',
          reasons: reasons.join(', '),
        });
      }
    }
    inShop = false;
    continue;
  }
  
  if (!inShop) continue;
  
  const strMatch = trimmed.match(/^"(\w+)":\s*"([^"]*)"[,]?$/);
  if (strMatch) {
    currentShop[strMatch[1]] = strMatch[2];
  }
}

console.log(`=== 不正な店舗名 検出結果 (${suspiciousShops.length}件) ===\n`);
suspiciousShops.forEach(s => {
  console.log(`ID: ${s.id}`);
  console.log(`  Name:    ${s.name}`);
  console.log(`  Comment: ${s.comment}`);
  console.log(`  Reason:  ${s.reasons}`);
  console.log('');
});
