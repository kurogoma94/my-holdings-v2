const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Starting Puppeteer...');
    const browser = await puppeteer.launch({ headless: false }); // headless: false helps avoid some bot detection
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 800 });

    const url = 'https://maps.app.goo.gl/khPkcLq3mF1BuEa67';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Waiting for list to load...');
    // Wait for the main scrollable feed or list container.
    // In GMaps, lists often have role="feed".
    try {
        await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
    } catch (e) {
        console.log('Could not find role="feed", looking for generic scrollable container...');
    }

    console.log('Scrolling down to load all items...');
    
    // Updated selectors based on observation
    const scrollContainerSelector = 'div.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde.ussYcc';
    const itemSelector = 'button.SMP2wb.fHEb6e';
    
    let previousHeight = 0;
    let retries = 0;
    
    while (true) {
        const result = await page.evaluate((selector, itemSel) => {
            const container = document.querySelector(selector);
            if (!container) return { height: 0, items: 0 };
            
            container.scrollBy(0, 10000);
            
            const items = container.querySelectorAll(itemSel).length;
            
            return { height: container.scrollHeight, items };
        }, scrollContainerSelector, itemSelector);

        console.log(`Scrolled... current items found: ${result.items}, container height: ${result.height}`);
        
        await new Promise(r => setTimeout(r, 4000)); // wait longer
        
        if (result.height === previousHeight) {
            retries++;
            if (retries >= 15) { // much more retries
                console.log('Reached bottom of the list or slow load.');
                break;
            }
        } else {
            retries = 0;
        }
        previousHeight = result.height;
        
        if (result.items >= 745) {
            console.log('Reached target item count.');
            break;
        }
    }

    console.log('Extracting data...');
    const extractedData = await page.evaluate((sel, itemSel) => {
        const container = document.querySelector(sel);
        if (!container) return [];
        
        const items = Array.from(container.querySelectorAll(itemSel));
        const data = [];
        
        items.forEach(item => {
            // The name is usually the first div or aria-label
            const name = item.getAttribute('aria-label') || item.innerText.split('\n')[0] || '';
            
            // Try to find a link if it exists, otherwise construct search URL
            const linkEl = item.querySelector('a');
            let url = linkEl ? linkEl.href : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
            
            // Collect snippets for AI classification later
            const snippet = item.innerText.replace(/\n/g, ' ').substring(0, 150);
            
            if (name) {
                data.push({
                    name: name.trim(),
                    url: url,
                    snippet: snippet
                });
            }
        });
        
        return data;
    }, scrollContainerSelector, itemSelector);

    console.log(`Extracted ${extractedData.length} locations.`);
    
    fs.writeFileSync('extracted_restaurants.json', JSON.stringify(extractedData, null, 2));
    console.log('Data saved to extracted_restaurants.json');
    
    await browser.close();
})();
