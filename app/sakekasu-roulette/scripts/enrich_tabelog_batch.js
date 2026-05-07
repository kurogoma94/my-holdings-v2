const https = require('https');
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');

const UA_POOL = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
];

function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': UA_POOL[Math.floor(Math.random() * UA_POOL.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://tabelog.com/osaka/'
            }
        }, (res) => {
            if (res.statusCode !== 200 && res.statusCode !== 301 && res.statusCode !== 302) {
                return reject(new Error(`Status ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', err => reject(err));
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

function parseBudget(str) {
    if (!str) return null;
    const clean = str.replace(/[^\d]/g, '');
    return parseInt(clean, 10);
}

async function run() {
    console.log(`[Tabelog Batch] Starting lightweight enrichment process...`);
    
    if (!fs.existsSync(mockDataPath)) {
        console.error(`MockData not found.`); return;
    }

    let content = fs.readFileSync(mockDataPath, 'utf8');
    const shopsMatch = content.match(/\{[\s\S]*?\}/g);
    
    if (!shopsMatch) {
        console.error(`Failed to parse shops.`); return;
    }

    const targetShops = shopsMatch
        .map(s => {
            const idMatch = s.match(/"id":\s*"(\d+)"/);
            const nameMatch = s.match(/"name":\s*"([^"]+)"/);
            const isActiveMatch = s.match(/"isActive":\s*(true|false)/);
            const hasBudget = s.includes('"dinnerBudgetMin"');
            return {
                raw: s,
                id: idMatch ? idMatch[1] : null,
                name: nameMatch ? nameMatch[1] : null,
                isActive: isActiveMatch ? isActiveMatch[1] === 'true' : true,
                hasBudget
            };
        })
        .filter(s => s.id && s.isActive && !s.hasBudget);

    console.log(`Found ${targetShops.length} shops missing budget information.`);

    let processedCount = 0;
    let savedCount = 0;

    for (const shop of targetShops) {
        console.log(`\n[${processedCount + 1}/${targetShops.length}] Processing: ID:${shop.id} ${shop.name}`);
        
        try {
            // First delay
            await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000));
            
            let query = shop.name;
            const url = `https://tabelog.com/rstLst/?vs=1&sk=${encodeURIComponent(query)}`;
            
            const html = await fetchHTML(url);
            
            const noResult = html.includes('に一致するお店は見つかりませんでした');
            if (noResult) {
                console.log(`  => No search results found on Tabelog.`);
                processedCount++;
                continue;
            }
            
            const nameMatch = html.match(/class="list-rst__rst-name-target[^>]*>([^<]+)<\/a>/);
            if (nameMatch) {
                const foundName = nameMatch[1].trim();
                const shortQuery = query.substring(0, Math.min(3, query.length));
                if (!foundName.includes(shortQuery) && !query.includes(foundName.substring(0, 2))) {
                    console.log(`  => Name mismatch: '${foundName}' != '${query}'. Skipping.`);
                    processedCount++;
                    continue;
                }
            } else {
                console.log(`  => Could not find shop names in result. Skipping.`);
                processedCount++;
                continue;
            }

            const dinnerMatch = html.match(/c-rating-v3__time--dinner.*?c-rating-v3__val[^>]*>([￥¥\d,～-]+)/);
            const lunchMatch = html.match(/c-rating-v3__time--lunch.*?c-rating-v3__val[^>]*>([￥¥\d,～-]+)/);
            
            let dMin = null, dMax = null, lMin = null, lMax = null;

            if (dinnerMatch) {
                const parts = dinnerMatch[1].split(/[～-]/);
                dMin = parseBudget(parts[0]);
                dMax = parseBudget(parts[1] || parts[0]);
            }
            if (lunchMatch) {
                const parts = lunchMatch[1].split(/[～-]/);
                lMin = parseBudget(parts[0]);
                lMax = parseBudget(parts[1] || parts[0]);
            }

            if (dMin || lMin) {
                console.log(`  => Found Budget! Dinner: ¥${dMin} / Lunch: ¥${lMin}`);
                
                // Safe Replacement
                const shopBlockRegex = new RegExp(`(\"id\":\\s*\"${shop.id}\"[\\s\\S]*?)(\"googleMapsUrl\":|\"comment\":)`);
                let replacement = `$1`;
                if (dMin) replacement += `"dinnerBudgetMin": ${dMin},\n    `;
                if (dMax) replacement += `"dinnerBudgetMax": ${dMax},\n    `;
                if (lMin) replacement += `"lunchBudgetMin": ${lMin},\n    `;
                if (lMax) replacement += `"lunchBudgetMax": ${lMax},\n    `;
                replacement += `$2`;
                
                content = content.replace(shopBlockRegex, replacement);
                savedCount++;
            } else {
                console.log(`  => Budget elements not found in HTML.`);
            }

        } catch (e) {
            console.error(`  => Fetch Error: ${e.message}`);
            if (e.message.includes('Status 403') || e.message.includes('Status 429')) {
                console.log(`[!] Tabelog WAF Blocked us! Saving progress and aborting...`);
                break;
            }
        }

        processedCount++;

        // Save progress every 10 shops
        if (savedCount > 0 && savedCount % 10 === 0) {
            fs.writeFileSync(mockDataPath, content, 'utf8');
            console.log(`\n[Checkpoint] Saved ${savedCount} updated shops to MockData.ts`);
        }
    }
    
    // Final save
    fs.writeFileSync(mockDataPath, content, 'utf8');
    console.log(`\nProcess completed! Successfully enriched ${savedCount} shops.`);
}

run();
