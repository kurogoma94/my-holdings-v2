const fs = require('fs');
const content = fs.readFileSync('c:/Users/kurog/OneDrive/My AI Campany/Black Sesame HD/app/sakekasu-roulette/src/constants/MockData.ts', 'utf8');
const start = content.indexOf('export const MOCK_SHOPS: Shop[] = [');
const end = content.lastIndexOf('];');
const shops = JSON.parse(content.substring(start + 'export const MOCK_SHOPS: Shop[] = '.length - 1, end + 1));
const researchedIds = ['1','4','8','10','11','12','13','14','17','19','20','21','23','24','25','26','28','29','32','33','34','38','39','41','44','45','46','48','50','52','217','230','487'];
const pending = shops.filter(s => s.isActive && !researchedIds.includes(s.id)).slice(0, 30);
pending.forEach(s => {
    console.log(`${s.id}: ${s.name} (${s.address})`);
});
