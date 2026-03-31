const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    
    const query = encodeURIComponent('Chop Hits Barbecue 大阪 住所');
    console.log(`Searching for: ${query}`);
    await page.goto(`https://www.google.com/search?q=${query}`, { waitUntil: 'domcontentloaded' });
    
    await new Promise(r => setTimeout(r, 3000));
    
    const html = await page.content();
    fs.writeFileSync('search_result_test.html', html);
    
    // Check if address is there
    const selectors = ['.Lrzca', '[data-item-id="address"]', '.s069db', '.zVqyZc', '.x0qU4b', '.Wy7P2', '.Wlzf9b', '.rllt__details'];
    const findings = await page.evaluate((sels) => {
        const results = {};
        sels.forEach(sel => {
            const el = document.querySelector(sel);
            results[sel] = el ? el.innerText.trim() : 'NOT FOUND';
        });
        return results;
    }, selectors);
    
    console.log('Selectors check:', findings);
    
    await browser.close();
}

run();
