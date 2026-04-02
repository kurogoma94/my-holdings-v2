const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../src/constants/MockData.ts'), 'utf8');

const start = content.indexOf('export const MOCK_SHOPS: Shop[] = [');
const end = content.lastIndexOf('];');
const jsonText = content.substring(start + 'export const MOCK_SHOPS: Shop[] = '.length - 1, end + 1);

let shops;
try {
    shops = JSON.parse(jsonText);
} catch (e) {
    console.error('JSON Error:', e.message);
    process.exit(1);
}

const target = shops.find(s => s.id === '167');
console.log('ID 167:', JSON.stringify(target, null, 2));

const nishinakajimaCandidates = shops.filter(s => {
    const addr = s.address || '';
    const name = s.name || '';
    return (addr.includes('西中島') || name.includes('西中島')) && s.isActive;
});
console.log('Nishinakajima Candidates (Name or Addr):', nishinakajimaCandidates.length);
console.log(nishinakajimaCandidates.map(s => `[${s.id}] ${s.name}`).join('\n'));

const others = shops.filter(s => s.area === 'other' && s.isActive);
console.log('Total Other & Active:', others.length);
