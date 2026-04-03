const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const shops = [];
let currentShop = {};
let inShop = false;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  if (trimmed === '{') { inShop = true; currentShop = { _lineIdStart: i }; continue; }
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) shops.push({ ...currentShop });
    inShop = false;
    continue;
  }
  if (!inShop) continue;
  const strMatch = trimmed.match(/^"(\w+)":\s*"([^"]*)"[,]?$/);
  if (strMatch) { currentShop[strMatch[1]] = strMatch[2]; continue; }
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) { currentShop[boolMatch[1]] = boolMatch[2] === 'true'; continue; }
}

// Find target shops (genre: other, hasLunch is strictly false, active)
const targetShops = shops.filter(s => s.isActive && s.genre === 'other' && s.hasLunch === false);
console.log(`Found ${targetShops.length} shops to check for lunch hours...`);

async function run() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    // Block resources
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    let changes = 0;
    
    for (let i = 0; i < Math.min(targetShops.length, 150); i++) {
        const target = targetShops[i];
        console.log(`\n[${i+1}/${targetShops.length}] ID:${target.id} ${target.name}`);
        
        try {
            // Priority 1: Use the googleMapsUrl directly if available
            await page.goto(target.googleMapsUrl || `https://www.google.com/search?q=${encodeURIComponent(target.name + ' 大阪 営業時間')}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            // Random Wait
            const waitTime = Math.floor(Math.random() * 2000) + 1500;
            await new Promise(r => setTimeout(r, waitTime));

            // Extract hours from Google Maps or Search
            const hasLunch = await page.evaluate(() => {
                // If the UI has a "営業時間の詳細" or similar list
                let text = '';
                const hTable = document.querySelector('table'); // Sometimes maps show a table
                if (hTable) text += hTable.innerText;
                
                const otherElements = document.querySelectorAll('.t39EBf, .Lrzca, span[aria-label^="営業時間"], div[aria-label^="営業時間"], .Lpw90');
                otherElements.forEach(el => text += ' ' + el.innerText);

                // Just grep the whole document body if we are desperate
                if (!text || text.length < 5) text = document.body.innerText;

                // Look for common lunch hour digits: 11:, 12:, 13:, 14:
                // Typically "11:00～" or "12:00～15:00"
                const hasLunchTime = /((11|12|13)[:：]\d{2})/.test(text) || /(午前|昼)11/.test(text) || /正午/.test(text);
                const hasOnlyDinner = /(17|18|19)[:：]\d{2}(～|-).*(23|24|0|1)[:：]/.test(text) && !/((11|12|13)[:：]\d{2})/.test(text);
                
                if (hasLunchTime && !text.includes('11:00～11:00')) return true; // Found lunch explicitly
                
                // If only dinner hours are heavily featured and no 11, 12, 13
                if (hasOnlyDinner) return false;
                
                return false; // Safely default to false
            });

            if (hasLunch) {
                console.log(`  => 🍔 LUNCH DETECTED`);
                const idPattern = new RegExp(`("id":\\s*"${target.id}"[\\s\\S]*?"hasLunch":\\s*)false`);
                if (idPattern.test(content)) {
                    content = content.replace(idPattern, `$1true`);
                    changes++;
                }
            } else {
                 console.log(`  => No lunch detected or not enough info`);
            }

        } catch (e) {
            console.error(`  => Error: ${e.message}`);
        }
    }
    
    if (changes > 0) {
        fs.writeFileSync(mockDataPath, content, 'utf8');
        console.log(`\n✅ Successfully updated ${changes} shops to have lunch!`);
    } else {
        console.log('\n❌ No lunch hours found to update.');
    }
    
    await browser.close();
}

run();
