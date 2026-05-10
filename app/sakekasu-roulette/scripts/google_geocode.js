/**
 * Google Places API (Text Search) を使ったエリア自動分類
 * - 残りの "other" 店舗を住所ベースで分類
 * - APIキーはコマンドライン引数で渡す（コードに含めない）
 * 
 * Usage: node google_geocode.js --key YOUR_API_KEY [--limit N]
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.argv.find((_, i, a) => a[i-1] === '--key');
const LIMIT = parseInt(process.argv.find((_, i, a) => a[i-1] === '--limit') || '9999');
const DRY_RUN = process.argv.includes('--dry-run');

if (!API_KEY) {
  console.error('Usage: node google_geocode.js --key YOUR_API_KEY [--limit N]');
  process.exit(1);
}

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const outputPath = path.join(__dirname, 'google_geocode_results.json');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// 区/市 → エリアコード マッピング（Nominatimスクリプトと同じ）
const WARD_TO_AREA = {
  '北区': 'umeda',
  '福島区': 'fukushima',
  '浪速区': 'namba',
  '西成区': 'shinsekai',
  '都島区': 'kyobashi',
  '阿倍野区': 'abeno',
  '天王寺区': 'abeno',
  '中央区': 'shinsaibashi',
  '淀川区': 'nishinakajima',
  '生野区': 'tsuruhashi',
  '東成区': 'tsuruhashi',
  '西区': 'osakacity-other',
  '城東区': 'osakacity-other',
  '鶴見区': 'osakacity-other',
  '旭区': 'osakacity-other',
  '住吉区': 'osakacity-other',
  '住之江区': 'osakacity-other',
  '東住吉区': 'osakacity-other',
  '平野区': 'osakacity-other',
  '大正区': 'osakacity-other',
  '港区': 'osakacity-other',
  '此花区': 'osakacity-other',
  '東淀川区': 'osakacity-other',
  '西淀川区': 'osakacity-other',
  '茨木市': 'hokusetsu',
  '高槻市': 'hokusetsu',
  '吹田市': 'hokusetsu',
  '豊中市': 'hokusetsu',
  '箕面市': 'hokusetsu',
  '池田市': 'hokusetsu',
  '摂津市': 'hokusetsu',
  '東大阪市': 'higashiosaka',
  '八尾市': 'higashiosaka',
  '枚方市': 'higashiosaka',
  '寝屋川市': 'higashiosaka',
  '守口市': 'higashiosaka',
  '門真市': 'higashiosaka',
  '大東市': 'higashiosaka',
  '四條畷市': 'higashiosaka',
  '交野市': 'higashiosaka',
  '堺市': 'senshu',
  '岸和田市': 'senshu',
  '和泉市': 'senshu',
  '泉大津市': 'senshu',
  '泉佐野市': 'senshu',
  '貝塚市': 'senshu',
  '河内長野市': 'senshu',
  '富田林市': 'senshu',
  '松原市': 'senshu',
  '藤井寺市': 'senshu',
  '羽曳野市': 'senshu',
  '大阪狭山市': 'senshu',
};

// Parse shops
const shops = [];
let currentShop = {};
let inShop = false;
for (const line of content.split('\n')) {
  const trimmed = line.trim();
  if (trimmed === '{') { inShop = true; currentShop = {}; continue; }
  if (trimmed === '},' || trimmed === '}') {
    if (inShop && currentShop.id) shops.push({ ...currentShop });
    inShop = false; continue;
  }
  if (!inShop) continue;
  const strMatch = trimmed.match(/^"(\w+)":\s*"([^"]*)"[,]?$/);
  if (strMatch) currentShop[strMatch[1]] = strMatch[2];
  const boolMatch = trimmed.match(/^"(\w+)":\s*(true|false)[,]?$/);
  if (boolMatch) currentShop[boolMatch[1]] = boolMatch[2] === 'true';
}

const targetShops = shops
  .filter(s => s.area === 'other' && s.isActive)
  .slice(0, LIMIT);

console.log(`=== Google Places API Geocoding ===`);
console.log(`対象: ${targetShops.length}件`);
console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log('');

// HTTP GET
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error(`JSON parse: ${data.substring(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

// 住所からエリア判定
function addressToArea(address) {
  if (!address) return null;
  for (const [ward, area] of Object.entries(WARD_TO_AREA)) {
    if (address.includes(ward)) return { area, ward };
  }
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  // 既存結果を読み込み
  let results = {};
  if (fs.existsSync(outputPath)) {
    try { results = JSON.parse(fs.readFileSync(outputPath, 'utf-8')); } catch(e) {}
  }

  let processed = 0, found = 0, notFound = 0, errors = 0, skipped = 0;

  for (const shop of targetShops) {
    if (results[shop.id] && results[shop.id].suggestedArea) {
      skipped++;
      continue;
    }

    processed++;
    const query = encodeURIComponent(`${shop.name} 大阪`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=ja&region=jp&key=${API_KEY}`;

    try {
      const data = await httpGet(url);

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const place = data.results[0];
        const address = place.formatted_address || '';
        const areaResult = addressToArea(address);

        results[shop.id] = {
          name: shop.name,
          address: address,
          placeName: place.name,
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
          suggestedArea: areaResult ? areaResult.area : null,
          matchedWard: areaResult ? areaResult.ward : null,
        };

        if (areaResult) {
          found++;
          process.stdout.write(`✅ ${processed} ID:${shop.id.padStart(3)} → ${areaResult.area.padEnd(18)} ${shop.name.substring(0, 30)}\n`);
        } else {
          notFound++;
          process.stdout.write(`❌ ${processed} ID:${shop.id.padStart(3)} → other(府外)        ${shop.name.substring(0, 25)} [${address.substring(0, 30)}]\n`);
        }
      } else if (data.status === 'REQUEST_DENIED') {
        console.error(`\n🚫 API ERROR: ${data.error_message}`);
        console.error('APIキーが無効か、Places APIが有効化されていない可能性があります。');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        process.exit(1);
      } else {
        notFound++;
        results[shop.id] = { name: shop.name, address: null, suggestedArea: null, error: data.status };
        process.stdout.write(`⚠️ ${processed} ID:${shop.id.padStart(3)} → ${data.status.padEnd(18)} ${shop.name.substring(0, 30)}\n`);
      }
    } catch (e) {
      errors++;
      results[shop.id] = { name: shop.name, address: null, suggestedArea: null, error: e.message };
      process.stdout.write(`💥 ${processed} ID:${shop.id.padStart(3)} → ERROR              ${e.message.substring(0, 40)}\n`);
    }

    // 中間保存
    if (processed % 20 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    }

    // レート制限（Places APIは10 QPS許容だが安全に）
    await sleep(200);
  }

  // 最終保存
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // サマリー
  const allResults = Object.values(results);
  const withArea = allResults.filter(r => r.suggestedArea);

  console.log(`\n=== 完了 ===`);
  console.log(`処理: ${processed}件 / スキップ: ${skipped}件`);
  console.log(`エリア判定成功: ${found}件`);
  console.log(`判定不能(府外等): ${notFound}件`);
  console.log(`エラー: ${errors}件`);
  console.log(`累計: ${allResults.length}件 (エリア判定: ${withArea.length}件)`);
  console.log(`保存先: ${outputPath}`);

  const areaSummary = {};
  withArea.forEach(r => { areaSummary[r.suggestedArea] = (areaSummary[r.suggestedArea] || 0) + 1; });
  console.log('\nエリア別:');
  Object.entries(areaSummary).sort((a, b) => b[1] - a[1]).forEach(([area, count]) => {
    console.log(`  ${area.padEnd(20)} ${count}件`);
  });
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
