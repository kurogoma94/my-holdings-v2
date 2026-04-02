const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');

const RESEARCH_DATA_KEYS = [
    '435','436','437','438','441','442','443','444','445','446','447','448','449','452','453','454','458','462','464','465',
    '439','440','450','455','456','457','459','460','461','463'
];

RESEARCH_DATA_KEYS.forEach(id => {
    const exists = content.includes(`"id": "${id}"`);
    if (!exists) {
        console.log(`ID ${id} NOT found in MockData.ts`);
    } else {
        // If it exists, check if it's standardized
        const startIdx = content.indexOf(`"id": "${id}"`);
        const itemEndIdx = content.indexOf('}', startIdx);
        const itemText = content.substring(startIdx, itemEndIdx);
        const commentStandardized = itemText.includes('"comment": "ラードニキが行きたいお店"');
        console.log(`ID ${id} exists. Comment standardized: ${commentStandardized}`);
    }
});
