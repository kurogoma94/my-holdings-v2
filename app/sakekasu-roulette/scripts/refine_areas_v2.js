const puppeteer = require('puppeteer');
const fs = require('fs');

const LIST_URL = 'https://maps.app.goo.gl/khPkcLq3mF1BuEa67';
const MOCK_DATA_PATH = '../src/constants/MockData.ts';
const OUTPUT_FILE = 'refined_data_full.json';

const AREA_MAPPING = [
    { code: 'umeda', keywords: ['北区梅田', '曽根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '福島区福島'] },
    { code: 'namba', keywords: ['中央区難波', '難波千日前', '千日前', '道頓堀', '心斎橋筋', '西心斎橋', '東心斎橋', '宗右衛門町', '日本橋', '湊町', '中央区難波', '西区新町', '西区立売堀', '西区南堀江', '西区北堀江'] },
    { code: 'tenma', keywords: ['北区天神橋', '北区天満', '池田町', '山崎町', '浪花町', '菅栄町', '錦町', '末広町', '与力町', '同心', '南森町'] },
    { code: 'kyobashi', keywords: ['都島区東野田町', '新喜多', '蒲生', '都島区片町'] },
    { code: 'abeno', keywords: ['阿倍野筋', '松崎町', '阿倍野区旭町', '堀越町', '悲田院町', '茶臼山町', '天王寺町北'] },
    { code: 'tsuruhashi', keywords: ['生野区鶴橋', '生野区桃谷', '味原町', '舟橋町', '下寺町', '中道', '玉造'] },
    { code: 'kitahama', keywords: ['北浜', '淀屋橋', '伏見町', '道修町', '平野町', '淡路町', '瓦町', '備後町', '安土町', '本町', '南本町', '船場中央', '久太郎町', '北久太郎町', '中央区大手通'] },
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

    console.log('Navigating to list page...');
    await page.goto(LIST_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Wait for the side panel items to load
    await page.waitForSelector('.fontHeadlineSmall', { timeout: 30000 });

    const results = [];
    const targetIds = shops.filter(s => s.area === 'other').map(s => s.id);
    console.log(`Targeting ${targetIds.length} shops in 'other' area.`);

    // To iterate, we need to scroll. Let's do it item by item.
    let processedCount = 0;

    // Helper: Find item by name and click
    for (let shop of shops) {
        if (shop.area !== 'other') {
            results.push(shop);
            continue;
        }

        console.log(`[${processedCount+1}/${targetIds.length}] Refining: ${shop.name}...`);
        
        try {
            // Find the item in the list by text and click it
            const itemSelector = `[aria-label="${shop.name}"]`;
            const element = await page.$(itemSelector);
            
            if (element) {
                await element.click();
                // Wait for potential sidebar update
                await new Promise(r => setTimeout(r, 2500));
                
                // Extract address and phone from the panel
                const extraInfo = await page.evaluate(() => {
                    const addrBtn = document.querySelector('button[data-item-id="address"]');
                    const phoneBtn = document.querySelector('button[data-item-id^="phone"]');
                    return {
                        address: addrBtn ? addrBtn.innerText.trim() : '',
                        phone: phoneBtn ? phoneBtn.innerText.trim() : ''
                    };
                });

                if (extraInfo.address) {
                    console.log(`  Found Address: ${extraInfo.address}`);
                    shop.address = extraInfo.address;
                    if (extraInfo.phone) shop.phone = extraInfo.phone;

                    // Re-classify
                    for (const area of AREA_MAPPING) {
                        if (area.keywords.some(k => extraInfo.address.includes(k) || shop.name.includes(k))) {
                            shop.area = area.code;
                            console.log(`  => Classified to: ${area.code}`);
                            break;
                        }
                    }
                }
            } else {
                console.log(`  Item not found in current list view. (Might need scrolling)`);
                // Simple scroll to reveal more if possible
                await page.evaluate(() => window.scrollBy(0, 500));
            }
        } catch (e) {
            console.error(`  Error: ${e.message}`);
        }

        results.push(shop);
        processedCount++;

        if (processedCount % 20 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
            console.log(`Saved checkpoint at ${processedCount} items.`);
        }
        
        // Safety break for testing if you want
        if (processedCount >= 20) break;
    }

    // Save final
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    await browser.close();
    console.log('Batch testing (20 items) completed.');
}

run();
