const puppeteer = require('puppeteer');

async function testScrape(shopName) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const query = encodeURIComponent(shopName + ' 食べログ');
    await page.goto(`https://www.google.com/search?q=${query}`, { waitUntil: 'domcontentloaded' });
    
    // Find the tabelog link snippet
    const text = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('div.VwiC3b, div[data-snf]'));
        return els.map(e => e.innerText).join('\n');
    });
    
    console.log(`Results for ${shopName}:\n${text}`);
    
    const nightMatch = text.match(/￥(\d{1,3}(?:,\d{3})*)～(?:￥(\d{1,3}(?:,\d{3})*))?/); // A basic regex, but Japanese text uses ￥
    if (text.includes('￥')) {
        console.log("Budget found!");
    }

    await browser.close();
}

testScrape('串かつ越源');
testScrape('すき焼き・しゃぶしゃぶ きよ助');
