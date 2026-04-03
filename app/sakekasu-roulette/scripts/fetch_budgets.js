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
  const numMatch = trimmed.match(/^"(\w+)":\s*(\d+(?:\.\d+)?)[,]?$/);
  if (numMatch) { currentShop[numMatch[1]] = parseFloat(numMatch[2]); continue; }
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) { currentShop[boolMatch[1]] = boolMatch[2] === 'true'; continue; }
}

// Target all active shops that don't have lunchBudgetMin defined yet
const targetShops = shops.filter(s => s.isActive && typeof s.lunchBudgetMin === 'undefined');
console.log(`Found ${targetShops.length} shops to check for budgets...`);

async function run() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    await page.setRequestInterception(true);
    page.on('request', req => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    let changes = 0;
    
    // We process up to 544
    for (let i = 0; i < targetShops.length; i++) {
        const target = targetShops[i];
        console.log(`\n[${i+1}/${targetShops.length}] ID:${target.id} ${target.name}`);
        
        try {
            // Using Google Search for exact Tabelog snippet
            const queryName = target.name.replace(/大阪/g, ''); // avoid double osaka
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(queryName + ' 食べログ 大阪 予算')}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            const waitTime = Math.floor(Math.random() * 2000) + 1500;
            await new Promise(r => setTimeout(r, waitTime));

            const budgets = await page.evaluate(() => {
                let fullText = document.body.innerText;
                const els = document.querySelectorAll('div.VwiC3b, div[data-snf], span');
                els.forEach(el => fullText += ' ' + el.innerText);

                // Find 予算(夜):￥3,000～￥3,999 予算(昼):￥1,000～￥1,999
                // Note: characters can be full width or half width, can contain commas.
                const parsePrice = (str) => {
                    if (!str) return null;
                    const numstr = str.replace(/[^\d]/g, '');
                    const n = parseInt(numstr, 10);
                    return isNaN(n) ? null : n;
                };

                const res = { dMin: null, dMax: null, lMin: null, lMax: null };

                // Generic regex to catch both formats
                // "(夜|夕|ディナー).*?￥(\d{1,3}(?:,\d{3})*).*?(～|-).*?￥?(\d{1,3}(?:,\d{3})*)?"
                const nightMatch = fullText.match(/(夜|夕|ディナー).*?[￥¥](\d{1,3}(?:,\d{3})*)(?:(?:～|-)[￥¥]?(\d{1,3}(?:,\d{3})*))?/);
                if (nightMatch) {
                    res.dMin = parsePrice(nightMatch[2]);
                    if (nightMatch[3]) res.dMax = parsePrice(nightMatch[3]);
                }

                const dayMatch = fullText.match(/(昼|昼間|ランチ).*?[￥¥](\d{1,3}(?:,\d{3})*)(?:(?:～|-)[￥¥]?(\d{1,3}(?:,\d{3})*))?/);
                if (dayMatch) {
                    res.lMin = parsePrice(dayMatch[2]);
                    if (dayMatch[3]) res.lMax = parsePrice(dayMatch[3]);
                }

                return res;
            });

            if (budgets.lMin || budgets.dMin) {
                console.log(`  => Found L: ¥${budgets.lMin}~¥${budgets.lMax} | D: ¥${budgets.dMin}~¥${budgets.dMax}`);
                // Replace in content string carefully
                const idPattern = new RegExp(`("id":\\s*"${target.id}"[\\s\\S]*?"genre":\\s*"[^"]*")`);
                if (idPattern.test(content)) {
                    let insertStr = `$1`;
                    if (budgets.lMin) insertStr += `,\n    "lunchBudgetMin": ${budgets.lMin}`;
                    if (budgets.lMax) insertStr += `,\n    "lunchBudgetMax": ${budgets.lMax}`;
                    // Update dinner budget to the scraped one if found
                    if (budgets.dMin) insertStr += `,\n    "dinnerBudgetMin": ${budgets.dMin}`;
                    if (budgets.dMax) insertStr += `,\n    "dinnerBudgetMax": ${budgets.dMax}`;
                    
                    // We must delete the old dinnerBudgetMin if we are re-injecting it, or just use regex carefully
                    // To be safe, we will just inject lunch budgets, and leave the old dinner budget if a new one wasn't found
                    // Wait, we renamed budgetMin to dinnerBudgetMin. I should remove the old ones when replacing!

                    // Let's use a simpler mechanism to replace the block
                    const blockRegex = new RegExp(`("id":\\s*"${target.id}"[\\s\\S]*?)"dinnerBudgetMin":\\s*\\d+(?:,\\s*"dinnerBudgetMax":\\s*\\d+)?`);
                    if (blockRegex.test(content)) {
                        let rep = `$1"dinnerBudgetMin": ${budgets.dMin || target.dinnerBudgetMin || 3000}`;
                        if (budgets.dMax) rep += `,\n    "dinnerBudgetMax": ${budgets.dMax}`;
                        else if (target.dinnerBudgetMax) rep += `,\n    "dinnerBudgetMax": ${target.dinnerBudgetMax}`;
                        
                        if (budgets.lMin) rep += `,\n    "lunchBudgetMin": ${budgets.lMin}`;
                        if (budgets.lMax) rep += `,\n    "lunchBudgetMax": ${budgets.lMax}`;

                        content = content.replace(blockRegex, rep);
                        changes++;
                    }
                }
            } else {
                 console.log(`  => No detailed budgets found.`);
                 // Just inject the old dinner budget so we don't pick it up again
                 const blockRegex = new RegExp(`("id":\\s*"${target.id}"[\\s\\S]*?)"dinnerBudgetMin":\\s*\\d+(?:,\\s*"dinnerBudgetMax":\\s*\\d+)?`);
                 if (blockRegex.test(content)) {
                    let rep = `$1"dinnerBudgetMin": ${target.dinnerBudgetMin || 3000}`;
                    if (target.dinnerBudgetMax) rep += `,\n    "dinnerBudgetMax": ${target.dinnerBudgetMax}`;
                    // Add dummy lunch to mark as checked if we actually had lunch? No, missing lunchBudget is fine.
                    // Wait, if it has no lunchBudgetMin, it will be scraped again. Let's add a dummy zero to skip next time.
                    rep += `,\n    "lunchBudgetMin": 0`;
                    
                    content = content.replace(blockRegex, rep);
                    changes++;
                 }
            }

        } catch (e) {
            console.error(`  => Error: ${e.message}`);
        }
    }
    
    if (changes > 0) {
        // Fix any remaining commas or structure issues using JSON parsing/stringifying just in case? No, regex usually works if clean.
        content = content.replace(/MOCK_DATA_UPDATED_AT = '[^']+'/, `MOCK_DATA_UPDATED_AT = '${new Date().toISOString()}'`);
        fs.writeFileSync(mockDataPath, content, 'utf8');
        console.log(`\n✅ Successfully updated budgets for ${changes} shops!`);
    } else {
        console.log('\n❌ No budgets were updated.');
    }
    
    await browser.close();
}

run();
