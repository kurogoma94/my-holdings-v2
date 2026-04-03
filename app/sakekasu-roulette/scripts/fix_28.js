const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf-8');

// Pattern: "id": "28" ... "hasDinner": true
const idPattern = /("id":\s*"28"[\s\S]*?"hasDinner":\s*)true/;

if (idPattern.test(content)) {
  content = content.replace(idPattern, '$1false');
  fs.writeFileSync(mockDataPath, content, 'utf-8');
  console.log('✅ Successfully updated ID 28 hasDinner to false');
} else {
  console.log('❌ Pattern not found for ID 28');
}
