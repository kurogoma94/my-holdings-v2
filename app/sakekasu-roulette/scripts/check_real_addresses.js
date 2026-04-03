const puppeteer = require('puppeteer');
async function search(q) {
  const b = await puppeteer.launch();
  const p = await b.newPage();
  await p.goto('https://search.yahoo.co.jp/search?p=' + encodeURIComponent(q));
  const t = await p.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log(`--- ${q} ---`);
  console.log(t);
  await b.close();
}
async function run() {
  await search('高槻大衆ネオン居酒屋 スタンドＢ 住所');
  await search('焼肉はぐれ雲なんば 住所');
}
run();
