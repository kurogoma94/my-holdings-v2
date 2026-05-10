const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, 'src', 'constants', 'MockData.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // MOCK_SHOPS の配列部分を抽出（簡易的）
  const match = content.match(/export const MOCK_SHOPS: Shop\[\] = (\[[\s\S]*\]);/);
  if (!match) {
    console.error('MOCK_SHOPS not found or format mismatch');
    process.exit(1);
  }
  
  const shops = JSON.parse(match[1]);
  console.log(`Total shops: ${shops.length}`);
  
  const ids = new Set();
  const duplicates = [];
  shops.forEach(s => {
    if (ids.has(s.id)) {
      duplicates.push(s.id);
    }
    ids.add(s.id);
  });
  
  if (duplicates.length > 0) {
    console.error(`Duplicate IDs found: ${duplicates.join(', ')}`);
  } else {
    console.log('No duplicate IDs found.');
  }
  
  // 必須フィールドの厳密チェック
  const requiredFields = ['id', 'name', 'area', 'genre', 'comment', 'rating', 'hasLunch', 'hasDinner', 'isActive', 'createdAt'];
  let errorCount = 0;
  
  shops.forEach(s => {
    requiredFields.forEach(field => {
      if (s[field] === undefined) {
        console.error(`Missing field "${field}" in shop ID: ${s.id}`);
        errorCount++;
      }
    });
  });

  if (errorCount > 0) {
    console.error(`Total missing field errors: ${errorCount}`);
    process.exit(1);
  }

  console.log('Validation complete: All records have required fields.');
} catch (e) {
  console.error('Validation failed with error:', e.message);
  process.exit(1);
}
