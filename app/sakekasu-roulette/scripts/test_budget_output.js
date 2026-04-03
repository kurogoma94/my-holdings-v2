const puppeteer = require('puppeteer');

async function test() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(`https://search.yahoo.co.jp/search?p=${encodeURIComponent('うどん屋 きすけ 食べログ 大阪 予算')}`, { waitUntil: 'domcontentloaded' });
    
    // Wait for reasonable time
    await new Promise(r => setTimeout(r, 2000));

    const text = await page.evaluate(() => {
        let t = document.body.innerText;
        return t;
    });

    console.log(text.substring(0, 1000));
    
    // Test regex
    const dMatches = text.match(/(夜|夕|ディナー).*?[￥¥](\d{1,3}(?:,\d{3})*)(?:(?:～|-)[￥¥]?(\d{1,3}(?:,\d{3})*))?/);
    const lMatches = text.match(/(昼|昼間|ランチ|昼の予算).*?[￥¥](\d{1,3}(?:,\d{3})*)(?:(?:～|-)[￥¥]?(\d{1,3}(?:,\d{3})*))?/);
    console.log('\nNight:', dMatches);
    console.log('Day:', lMatches);

    await browser.close();
}

test();
