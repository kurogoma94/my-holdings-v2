const puppeteer = require('puppeteer');
const fs = require('fs');

async function debug() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const shop = "闘鶏 難波店";
    const query = `${shop} 食べログ 予算`;
    
    console.log(`Searching for: ${query}`);
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    await new Promise(r => setTimeout(r, 5000));
    
    const body = await page.evaluate(() => document.body.innerText);
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    
    fs.writeFileSync('debug_search.html', html);
    console.log(`Saved HTML to debug_search.html (Length: ${html.length})`);
    console.log(`Body text contains Captcha: ${body.includes('ロボットではない')}`);
    
    await browser.close();
}
debug();
