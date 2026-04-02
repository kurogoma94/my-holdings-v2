const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const BATCH_PENDING_PATH = path.join(__dirname, '../scripts/batch_pending.json');

const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
const pendingData = JSON.parse(fs.readFileSync(BATCH_PENDING_PATH, 'utf8'));

const missing = pendingData.toSearch.filter(p => !content.includes(`"id": "${p.id}"`));
console.log('Missing IDs from batch_pending.json in MockData.ts:');
console.log(missing.map(m => m.id));
console.log('Total missing:', missing.length);
