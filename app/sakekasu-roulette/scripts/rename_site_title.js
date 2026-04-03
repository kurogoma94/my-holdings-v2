const fs = require('fs');
const path = require('path');

const files = [
    'src/app.json',
    'src/assets/manifest.json',
    'src/app/(tabs)/index.tsx',
    'src/app/+html.tsx',
    'specs/app_planning.md',
    'specs/deploy_guide.md'
];

files.forEach(f => {
    const full = path.join(__dirname, '..', f);
    if (fs.existsSync(full)) {
        let content = fs.readFileSync(full, 'utf8');
        content = content.replace(/大阪ディープ居酒屋/g, '大阪酒カス');
        fs.writeFileSync(full, content, 'utf8');
        console.log('Fixed', f);
    }
});
