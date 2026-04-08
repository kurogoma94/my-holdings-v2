const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// [目的] 店舗の最新予算情報（昼・夜）を取得し、MockData.ts を更新する (V2.2 - Google 強化版)
// [改良点] ブラウザサブエージェントの分析に基づき、Google の最新セレクタと正規表現を採用

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const targetAreaArg = process.argv[2] || 'umeda';
const limit = parseInt(process.argv[3], 10) || 10;
const AREA_LIST = ['tenma', 'namba', 'tsuruhashi', 'umeda', 'shinsekai', 'kyobashi', 'abeno', 'kitahama', 'fukushima', 'other'];

const UA_POOL = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];

async function run() {
    console.log(`[V2.5] Starting TRIPLE-ENGINE budget enrichment on branch: feature/data-enrichment`);
    
    if (!fs.existsSync(mockDataPath)) {
        console.error(`MockData not found.`); return;
    }

    const areasToProcess = targetAreaArg === 'all' ? AREA_LIST : [targetAreaArg];
    
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });

    let totalUpdated = 0;
    const engines = ['google', 'bing', 'duckduckgo'];
    let currentEngineIdx = 0;

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
                const isActiveMatch = s.match(/"isActive":\s*(true|false)/);
                return {
                    raw: s,
                    id: idMatch ? idMatch[1] : null,
                    name: nameMatch ? nameMatch[1] : null,
                    area: areaMatch ? areaMatch[1] : null,
                    isActive: isActiveMatch ? isActiveMatch[1] === 'true' : true
                };
            })
            .filter(s => s.id && s.area === area && s.isActive)
            .slice(0, limit);

        console.log(`Analyzing ${targetShops.length} shops in ${area}...`);

        for (const shop of targetShops) {
            const engine = engines[currentEngineIdx];
            console.log(`\nProcessing: [${shop.id}] ${shop.name} (Engine: ${engine})`);
            
            try {
                let searchQuery = `${shop.name}`;
                if (area !== 'other' && !shop.name.includes(area)) searchQuery += ` ${area}`;
                searchQuery += " 食べログ 予算";

                await page.setUserAgent(UA_POOL[Math.floor(Math.random() * UA_POOL.length)]);

                let searchUrl;
                if (engine === 'google') searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                else if (engine === 'bing') searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`;
                else searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;

                await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
                await new Promise(r => setTimeout(r, 10000 + Math.random() * 5000));

                const scrapeResult = await page.evaluate((currentEngine) => {
                    const res = { dMin: null, dMax: null, lMin: null, lMax: null, isClosed: false, isBlocked: false };
                    
                    const bodyText = document.body.innerText;
                    const html = document.documentElement.outerHTML;
                    
                    // 検知判定強化
                    if (bodyText.includes('ロボットではない') || 
                        bodyText.includes('Unusual traffic') || 
                        html.includes('recaptcha') ||
                        bodyText.includes('JavaScript を有効に')) {
                        res.isBlocked = true; return res;
                    }

                    if (bodyText.includes('閉店') || bodyText.includes('閉業') || bodyText.includes('営業していません')) {
                        res.isClosed = true;
                    }

                    const parse = (s) => parseInt(s.replace(/[^\d]/g, ''), 10);
                    const pricePattern = /[￥¥]([\d,]+)(?:\s*[～-]\s*[￥¥]([\d,]+))?/g;
                    
                    let combinedText = "";
                    if (currentEngine === 'google') document.querySelectorAll('.VwiC3b, .MU0D0b, div.g').forEach(el => combinedText += " " + el.innerText);
                    else if (currentEngine === 'bing') document.querySelectorAll('.b_caption, .b_algo').forEach(el => combinedText += " " + el.innerText);
                    else document.querySelectorAll('.result__snippet, .tile--ad').forEach(el => combinedText += " " + el.innerText);

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
                        res.dMin = prices[0].min; res.dMax = prices[0].max;
                        if (prices.length > 1) { res.lMin = prices[1].min; res.lMax = prices[1].max; }
                    }

                    return res;
                }, engine);

                if (scrapeResult.isBlocked) {
                    console.warn(`  => [!] ${engine} blocked us. Rotating engine...`);
                    currentEngineIdx = (currentEngineIdx + 1) % engines.length;
                    continue; 
                }

                if (scrapeResult.isClosed) {
                    console.log(`  => Detected CLOSED.`);
                    const shopBlockRegex = new RegExp(`(\"id\":\\s*\"${shop.id}\"[\\s\\S]*?\"isActive\":\\s*)true`);
                    content = content.replace(shopBlockRegex, `$1false`);
                    totalUpdated++;
                } else if (scrapeResult.dMin || scrapeResult.lMin) {
                    console.log(`  => Found: D:¥${scrapeResult.dMin} | L:¥${scrapeResult.lMin}`);
                    const shopBlockRegex = new RegExp(`(\"id\":\\s*\"${shop.id}\"[\\s\\S]*?)(dinnerBudgetMin\":\\s*\\d+|googleMapsUrl\":)`);
                    let replacement = `$1"dinnerBudgetMin": ${scrapeResult.dMin || 0}`;
                    if (scrapeResult.dMax) replacement += `,\n    "dinnerBudgetMax": ${scrapeResult.dMax}`;
                    if (scrapeResult.lMin) replacement += `,\n    "lunchBudgetMin": ${scrapeResult.lMin}`;
                    if (scrapeResult.lMax) replacement += `,\n    "lunchBudgetMax": ${scrapeResult.lMax}`;
                    if (!replacement.includes('googleMapsUrl')) replacement += ',\n    "googleMapsUrl":';
                    content = content.replace(shopBlockRegex, replacement);
                    totalUpdated++;
                } else {
                    console.log(`  => Info not found.`);
                }

            } catch (e) {
                console.error(`  => Error: ${e.message}`);
            }
        }
        
        fs.writeFileSync(mockDataPath, content, 'utf8');
    }

    console.log(`\n[V2.5] Process completed. Total shops updated/closed: ${totalUpdated}`);
    await browser.close();
}

run();

run();
