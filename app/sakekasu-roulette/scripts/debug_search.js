const puppeteer = require('puppeteer');
const fs = require('fs');

async function debug() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const query = "うどん屋 きすけ 予算 食べログ";
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    const html = await page.content();
    fs.writeFileSync('search_debug.html', html);
    await browser.close();
    console.log('Saved to search_debug.html');
}
debug();
