const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Parse shops manually to preserve file structure later
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

const targetShops = shops.filter(s => s.isActive && s.area === 'other' && (!s.address || s.address.trim() === ''));
console.log(`Found ${targetShops.length} missing address shops. Scraping from Google Maps URLs...`);

async function run() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    let changes = 0;
    
    for (let i = 0; i < targetShops.length; i++) {
        const target = targetShops[i];
        console.log(`[${i+1}/${targetShops.length}] ID:${target.id} ${target.name}`);
        
        try {
            // First try normal Google search using the query name (which is faster and more reliable than the Maps SPA)
            const queryName = target.name;
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(queryName + ' 大阪 住所')}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            let address = await page.evaluate(() => {
                const selectors = [
                    '[data-attrid="kc:/location/location:address"]',
                    '.Lrzca',
                    '[data-item-id="address"]',
                    '.s069db',
                    '.Z0LcW'
                ];
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el && el.innerText.trim() && (el.innerText.includes('府') || el.innerText.includes('市') || el.innerText.includes('区'))) {
                        return el.innerText.replace(/所在地[:：\s]*/, '').trim();
                    }
                }
                return null;
            });
            
            // If failed, load the actual Google Maps URL
            if (!address && target.googleMapsUrl) {
                await page.goto(target.googleMapsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                address = await page.evaluate(() => {
                    const btn = document.querySelector('button[data-tooltip="住所をコピー"]');
                    if (btn) return btn.getAttribute('aria-label').replace(/^住所:\s*/, '').trim();
                    const texts = Array.from(document.querySelectorAll('.fontBodyMedium'));
                    const addrEl = texts.find(el => el.innerText.includes('府') || el.innerText.includes('市'));
                    if (addrEl) return addrEl.innerText.trim();
                    return null;
                });
            }

            if (address) {
                console.log(`  => Found: ${address}`);
                // Replace in content string
                const idPattern = new RegExp(`("id":\\s*"${target.id}"[\\s\\S]*?"createdAt":\\s*"[^"]*")`);
                if (idPattern.test(content)) {
                    content = content.replace(idPattern, `$1,\n    "address": "${address}"`);
                    changes++;
                }
            } else {
                console.log(`  => Not found`);
            }
        } catch (e) {
            console.log(`  => Error: ${e.message}`);
        }
        
        // Random wait
        await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000));
    }
    
    if (changes > 0) {
        fs.writeFileSync(mockDataPath, content, 'utf8');
        console.log(`\n✅ Saved ${changes} newly found addresses to MockData.ts!`);
    } else {
        console.log('\n❌ No addresses were found or updated.');
    }
    
    await browser.close();
}

run();
