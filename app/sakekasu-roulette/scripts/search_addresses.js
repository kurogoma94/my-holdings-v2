const puppeteer = require('puppeteer');
const fs = require('fs');

const path = require('path');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');
const OUTPUT_FILE = path.join(__dirname, 'refined_data_search.json');
const BATCH_SIZE = 30; // Initial test batch

const AREA_MAPPING = [
    { code: 'umeda', keywords: ['北区梅田', '曽根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '福島区福島', '福島区玉川', '北区大淀'] },
    { code: 'namba', keywords: ['中央区難波', '難波千日前', '千日前', '道頓堀', '心斎橋筋', '西心斎橋', '東心斎橋', '宗右衛門町', '日本橋', '湊町', '中央区難波', '西区新町', '西区立売堀', '西区南堀江', '西区北堀江', '浪速区桜川', '中央区道頓堀'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町', '紅梅町', '東天満'] },
    { code: 'kyobashi', keywords: ['都島区東野田町', '新喜多', '蒲生', '都島区片町', '網島町', '都島区中野町'] },
    { code: 'abeno', keywords: ['阿倍野筋', '松崎町', '阿倍野区旭町', '堀越町', '悲田院町', '茶臼山町', '天王寺町北', '大阪市天王寺区'] },
    { code: 'tsuruhashi', keywords: ['生野区鶴橋', '生野区桃谷', '味原町', '舟橋町', '下寺町', '中道', '玉造', '東成区東小橋'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '中央区大手通', '内平野町'] },
    { code: 'shinsekai', keywords: ['浪速区恵美須東', '西成区太子', '西成区山王', '萩之茶屋', '新世界', '西心斎橋'] }
];

async function run() {
    console.log('Reading MockData.ts...');
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    const shopsMatch = content.match(/MOCK_SHOPS: Shop\[\] = (\[[\s\S]*?\]);/);
    if (!shopsMatch) return console.error('No MOCK_SHOPS found.');
    let shops = JSON.parse(shopsMatch[1]);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    // Block images, CSS, and fonts for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    const results = [];
    const targetShops = shops.filter(s => s.area === 'other').slice(0, BATCH_SIZE);
    
    console.log(`Searching addresses for ${targetShops.length} shops (Lite Mode)...`);

    const finalShops = [...shops];

    for (let i = 0; i < targetShops.length; i++) {
        const target = targetShops[i];
        console.log(`[${i+1}/${targetShops.length}] Searching: ${target.name}...`);
        
        try {
            const query = encodeURIComponent(`${target.name} 大阪 住所`);
            await page.goto(`https://www.google.com/search?q=${query}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            // Random wait 2-5 seconds to avoid being blocked
            const waitTime = Math.floor(Math.random() * 3000) + 2000;
            await new Promise(r => setTimeout(r, waitTime));

            const info = await page.evaluate(() => {
                const results = { address: '', phone: '' };
                // Common selectors for address in Knowledge Graph / Local Pack
                const selectors = ['.Lrzca', '[data-item-id="address"]', '.s069db', '.zVqyZc', '.x0qU4b'];
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el && el.innerText.trim()) {
                        results.address = el.innerText.trim();
                        break;
                    }
                }
                
                // Phone
                const phoneSelectors = ['.Lpw90', '[data-item-id^="phone"]', '.B6p9X'];
                for (const sel of phoneSelectors) {
                    const el = document.querySelector(sel);
                    if (el && el.innerText.trim()) {
                        results.phone = el.innerText.trim();
                        break;
                    }
                }
                
                return results;
            });

            if (info.address) {
                console.log(`  Found: ${info.address}`);
                // Find and update in finalShops
                const idx = finalShops.findIndex(s => s.id === target.id);
                if (idx !== -1) {
                    finalShops[idx].address = info.address;
                    if (info.phone) finalShops[idx].phone = info.phone;

                    // Re-classify
                    for (const area of AREA_MAPPING) {
                        if (area.keywords.some(k => info.address.includes(k) || target.name.includes(k))) {
                            finalShops[idx].area = area.code;
                            console.log(`  => ${area.code}`);
                            break;
                        }
                    }
                }
            } else {
                console.log(`  No address found via search.`);
            }

            if ((i + 1) % 20 === 0) {
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalShops, null, 2));
            }
        } catch (e) {
            console.error(`  Error: ${e.message}`);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalShops, null, 2));
    await browser.close();
    console.log('Search refinement completed.');
}

run();
