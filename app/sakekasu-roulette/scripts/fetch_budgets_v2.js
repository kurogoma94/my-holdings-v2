const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// [目的] 店舗の最新予算情報（昼・夜）を取得し、MockData.ts を更新する (V2.2 - Google 強化版)
// [改良点] ブラウザサブエージェントの分析に基づき、Google の最新セレクタと正規表現を採用

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const targetAreaArg = process.argv[2] || 'umeda';
const limit = parseInt(process.argv[3], 10) || 10;

const AREA_LIST = ['tenma', 'namba', 'tsuruhashi', 'umeda', 'shinsekai', 'kyobashi', 'abeno', 'kitahama', 'fukushima', 'other'];

async function run() {
    console.log(`[V2.2] Starting budget enrichment on branch: feature/data-enrichment`);
    
    if (!fs.existsSync(mockDataPath)) {
        console.error(`MockData not found.`); return;
    }

    const areasToProcess = targetAreaArg === 'all' ? AREA_LIST : [targetAreaArg];
    
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja-JP,ja;q=0.9' });

    let totalUpdated = 0;

    for (const area of areasToProcess) {
        console.log(`\n=== Processing Area: ${area} ===`);
        
        let content = fs.readFileSync(mockDataPath, 'utf8');
        const shopsMatch = content.match(/\{[\s\S]*?\}/g);
        
        if (!shopsMatch) {
            console.error(`Failed to parse shops in area ${area}.`); continue;
        }

        const targetShops = shopsMatch
            .map(s => {
                const idMatch = s.match(/"id":\s*"(\d+)"/);
                const nameMatch = s.match(/"name":\s*"([^"]+)"/);
                const areaMatch = s.match(/"area":\s*"([^"]+)"/);
                const dinnerMinMatch = s.match(/"dinnerBudgetMin":\s*(\d+)/);
                return {
                    raw: s,
                    id: idMatch ? idMatch[1] : null,
                    name: nameMatch ? nameMatch[1] : null,
                    area: areaMatch ? areaMatch[1] : null,
                    dinnerBudgetMin: dinnerMinMatch ? parseInt(dinnerMinMatch[1], 10) : null
                };
            })
            .filter(s => s.id && s.area === area)
            .slice(0, limit);

        console.log(`Analyzing ${targetShops.length} shops in ${area}...`);

        for (const shop of targetShops) {
            console.log(`\nProcessing: [${shop.id}] ${shop.name}`);
            
            try {
                const query = `${shop.name} ${area} 食べログ 予算`;
                await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
                
                const delay = 3000 + Math.random() * 3000;
                await new Promise(r => setTimeout(r, delay));

                const scrapeResult = await page.evaluate(() => {
                    const selectors = ['.VwiC3b', '.MU0D0b', 'div.g'];
                    let combinedText = "";
                    selectors.forEach(sel => {
                        document.querySelectorAll(sel).forEach(el => combinedText += " " + el.innerText);
                    });

                    const res = { dMin: null, dMax: null, lMin: null, lMax: null };
                    const parse = (s) => parseInt(s.replace(/[^\d]/g, ''), 10);
                    const pricePattern = /[￥¥]([\d,]+)(?:\s*[～-]\s*[￥¥]([\d,]+))?/g;
                    let match;
                    const prices = [];
                    while ((match = pricePattern.exec(combinedText)) !== null) {
                        prices.push({ min: parse(match[1]), max: match[2] ? parse(match[2]) : null });
                    }

                    const nightMatch = combinedText.match(/(?:夜|ディナー|予算\s*\(夜\)).*?[￥¥]([\d,]+)(?:\s*[～-]\s*[￥¥]([\d,]+))?/);
                    if (nightMatch) {
                        res.dMin = parse(nightMatch[1]);
                        if (nightMatch[2]) res.dMax = parse(nightMatch[2]);
                    }

                    const dayMatch = combinedText.match(/(?:昼|ランチ|予算\s*\(昼\)).*?[￥¥]([\d,]+)(?:\s*[～-]\s*[￥¥]([\d,]+))?/);
                    if (dayMatch) {
                        res.lMin = parse(dayMatch[1]);
                        if (dayMatch[2]) res.lMax = parse(dayMatch[2]);
                    }

                    if (!res.dMin && prices.length > 0) {
                        res.dMin = prices[0].min;
                        res.dMax = prices[0].max;
                        if (prices.length > 1) {
                            res.lMin = prices[1].min;
                            res.lMax = prices[1].max;
                        }
                    }

                    return res;
                });

                if (scrapeResult.dMin || scrapeResult.lMin) {
                    console.log(`  => Found: D:¥${scrapeResult.dMin}~¥${scrapeResult.dMax} | L:¥${scrapeResult.lMin}~¥${scrapeResult.lMax}`);
                    
                    const shopBlockRegex = new RegExp(`(\"id\":\\s*\"${shop.id}\"[\\s\\S]*?)(dinnerBudgetMin\":\\s*\\d+|googleMapsUrl\":)`);
                    
                    let replacement = `$1"dinnerBudgetMin": ${scrapeResult.dMin || shop.dinnerBudgetMin || 0}`;
                    if (scrapeResult.dMax) replacement += `,\n    "dinnerBudgetMax": ${scrapeResult.dMax}`;
                    if (scrapeResult.lMin) replacement += `,\n    "lunchBudgetMin": ${scrapeResult.lMin}`;
                    if (scrapeResult.lMax) replacement += `,\n    "lunchBudgetMax": ${scrapeResult.lMax}`;
                    if (!replacement.includes('googleMapsUrl')) replacement += ',\n    "googleMapsUrl":';

                    content = content.replace(shopBlockRegex, replacement);
                    totalUpdated++;
                } else {
                    console.log(`  => Info not found.`);
                    const isBlocked = await page.evaluate(() => document.body.innerText.includes('ロボットではないことを確認'));
                    if (isBlocked) {
                        console.error('  => CRITICAL: BLOCKED BY CAPTCHA. Skipping area.');
                        break;
                    }
                }

            } catch (e) {
                console.error(`  => Error: ${e.message}`);
            }
        }
        
        fs.writeFileSync(mockDataPath, content, 'utf8');
    }

    console.log(`\n[V2.2] Process completed. Total shops updated: ${totalUpdated}`);
    await browser.close();
}

run();

run();
