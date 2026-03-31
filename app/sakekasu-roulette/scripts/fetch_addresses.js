const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const BATCH_SIZE = 100;
const OUTPUT_FILE = path.join(__dirname, '../refined_data_batch2.json');
const MOCK_DATA_PATH = path.join(__dirname, '../src/constants/MockData.ts');

// --- Area Mapping Rules ---
const AREA_MAPPING = [
    { code: 'umeda', keywords: ['北区梅田', '北区曽根崎', '芝田', '茶屋町', '鶴野町', '角田町', '小松原町', '堂山町', '神山町', '太融寺町', '兎我野町', '曽根崎新地', '堂島', '大深町', '中之島', '北区大淀'] },
    { code: 'fukushima', keywords: ['福島区福島', '福島区玉川', '福島駅', '新福島'] },
    { code: 'shinsaibashi', keywords: ['心斎橋筋', '西心斎橋', '東心斎橋', '心斎橋駅', '西区新町', '西区立売堀', '西区南堀江', '西区北堀江'] },
    { code: 'namba', keywords: ['中央区難波', '難波千日前', '千日前', '道頓堀', '宗右衛門町', '日本橋', '湊町', '難波駅', '浪速区桜川', '中央区道頓堀', '天王寺区難波'] },
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
    if (!shopsMatch) {
        console.error('Could not find MOCK_SHOPS array.');
        return;
    }

    const allShops = JSON.parse(shopsMatch[1]);
    const otherShops = allShops.filter(s => s.area === 'other').slice(0, BATCH_SIZE);
    
    console.log(`Targeting ${otherShops.length} shops for refinement.`);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    // Set user agent to avoid some blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    const results = [];

    for (let i = 0; i < otherShops.length; i++) {
        const shop = otherShops[i];
        console.log(`[${i+1}/${otherShops.length}] Fetching address for: ${shop.name}...`);
        
        try {
            // Use domcontentloaded for faster/more resilient loading
            await page.goto(shop.googleMapsUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
            
            // Wait for the main detail container or a specific selector
            await new Promise(r => setTimeout(r, 4000));
            await page.waitForSelector('button[data-item-id="address"]', { timeout: 10000 }).catch(() => {});

            // Extract Address
            let address = '';
            try {
                // Try several selectors found by subagent
                address = await page.evaluate(() => {
                    const addrBtn = document.querySelector('button[data-item-id="address"]');
                    if (addrBtn) return addrBtn.innerText.trim();
                    const ariaAddr = document.querySelector('button[aria-label*="住所"], button[aria-label*="Address"]');
                    if (ariaAddr) return ariaAddr.innerText.trim();
                    return '';
                });
            } catch (e) {}

            // Extract Phone
            let phone = '';
            try {
                phone = await page.evaluate(() => {
                    const phoneBtn = document.querySelector('button[data-item-id^="phone"]');
                    if (phoneBtn) return phoneBtn.innerText.trim();
                    return '';
                });
            } catch (e) {}

            if (address) {
                // Cleanup icons and newlines
                address = address.replace(/[\n]/g, ' ').replace(/\s+/g, ' ').trim();
                console.log(`  Found: ${address}`);
                shop.address = address;
                
                if (phone) {
                    shop.phone = phone.replace(/[\n]/g, ' ').trim();
                }

                // Filter out non-Osaka shops
                if (address.includes('京都府') || address.includes('兵庫県') || address.includes('奈良県')) {
                    console.log(`  Out of scope: ${address}`);
                    shop.isActive = false;
                }

                // Re-classify Area
                for (const areaDef of AREA_MAPPING) {
                    if (areaDef.keywords.some(k => address.includes(k) || shop.name.includes(k))) {
                        shop.area = areaDef.code;
                        console.log(`  Determined Area: ${shop.area}`);
                        break;
                    }
                }
            } else {
                console.log('  Address not found.');
            }

            results.push(shop);

            // Periodically save to avoid data loss
            if ((i + 1) % 10 === 0) {
                fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
            }

        } catch (error) {
            console.error(`  Error processing ${shop.name}:`, error.message);
            results.push(shop); // keep the original
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    await browser.close();
    console.log(`Done! Results saved to ${OUTPUT_FILE}`);
}

run().catch(console.error);
