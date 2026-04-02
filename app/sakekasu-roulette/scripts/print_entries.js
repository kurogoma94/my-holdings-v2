const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../src/constants/MockData.ts'), 'utf8');

const ids = ['124', '126', '130', '131'];
ids.forEach(id => {
    const start = content.indexOf(`"id": "${id}"`);
    if (start !== -1) {
        const end = content.indexOf('}', start);
        console.log(`--- Entry for ID ${id} ---`);
        console.log(content.substring(start - 10, end + 1));
    } else {
        console.log(`--- ID ${id} NOT FOUND ---`);
    }
});
