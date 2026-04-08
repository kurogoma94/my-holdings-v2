const puppeteer = require('puppeteer');
const fs = require('fs');

async function debug() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const shopName = "骨付鳥 一鶴 西梅田店";
    const area = "umeda";
    const query = `${shopName} ${area} 食べログ 予算`;
    
    console.log(`Searching for: ${query}`);
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    
    await new Promise(r => setTimeout(r, 5000));

    const debugData = await page.evaluate(() => {
        const selectors = ['.VwiC3b', '.MU0D0b', 'div.g', 'h3', 'a'];
        const results = [];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => results.push({ sel, text: el.innerText }));
        });
        return {
            title: document.title,
            fullBody: document.body.innerText.substring(0, 5000),
            results: results
        };
    });

    console.log(`PAGE TITLE: ${debugData.title}`);
    if (debugData.fullBody.includes('ロボットではない')) {
        console.log("!!! BLOCKED BY CAPTCHA !!!");
    }
    debugData.results.forEach(r => {
        console.log(`[${r.sel}] ${r.text.substring(0, 100)}...`);
    });
    
    console.log("\n--- SNIPPET CHECK ---");
    const combinedText = debugData.results.map(r => r.text).join(" ");
    const pricePattern = /[￥¥]([\d,]+)(?:\s*[～-]\s*[￥¥]([\d,]+))?/g;
    let match;
    while ((match = pricePattern.exec(combinedText)) !== null) {
        console.log(`Match found: Full=${match[0]}, Min=${match[1]}, Max=${match[2]}`);
    }

    await browser.close();
}

debug();
