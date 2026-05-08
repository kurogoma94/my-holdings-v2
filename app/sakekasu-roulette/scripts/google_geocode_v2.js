/**
 * Google Places API (New) - Text Search を使ったエリア自動分類
 * - Places API (New) のエンドポイントを使用
 * - APIキーはコマンドライン引数で渡す
 * 
 * Usage: node google_geocode_v2.js --key YOUR_API_KEY [--limit N]
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.argv.find((_, i, a) => a[i-1] === '--key');
const LIMIT = parseInt(process.argv.find((_, i, a) => a[i-1] === '--limit') || '9999');

if (!API_KEY) {
  console.error('Usage: node google_geocode_v2.js --key YOUR_API_KEY [--limit N]');
  process.exit(1);
}

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const outputPath = path.join(__dirname, 'google_geocode_results.json');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// 区/市 → エリアコード
const WARD_TO_AREA = {
  '北区': 'umeda', '福島区': 'fukushima', '浪速区': 'namba',
  '西成区': 'shinsekai', '都島区': 'kyobashi', '阿倍野区': 'abeno',
  '天王寺区': 'abeno', '中央区': 'shinsaibashi', '淀川区': 'nishinakajima',
  '生野区': 'tsuruhashi', '東成区': 'tsuruhashi',
  '西区': 'osakacity-other', '城東区': 'osakacity-other', '鶴見区': 'osakacity-other',
  '旭区': 'osakacity-other', '住吉区': 'osakacity-other', '住之江区': 'osakacity-other',
  '東住吉区': 'osakacity-other', '平野区': 'osakacity-other', '大正区': 'osakacity-other',
  '港区': 'osakacity-other', '此花区': 'osakacity-other',
  '東淀川区': 'osakacity-other', '西淀川区': 'osakacity-other',
  '茨木市': 'hokusetsu', '高槻市': 'hokusetsu', '吹田市': 'hokusetsu',
  '豊中市': 'hokusetsu', '箕面市': 'hokusetsu', '池田市': 'hokusetsu', '摂津市': 'hokusetsu',
  '東大阪市': 'higashiosaka', '八尾市': 'higashiosaka', '枚方市': 'higashiosaka',
  '寝屋川市': 'higashiosaka', '守口市': 'higashiosaka', '門真市': 'higashiosaka',
  '大東市': 'higashiosaka', '四條畷市': 'higashiosaka', '交野市': 'higashiosaka',
  '堺市': 'senshu', '岸和田市': 'senshu', '和泉市': 'senshu',
  '泉大津市': 'senshu', '泉佐野市': 'senshu', '貝塚市': 'senshu',
  '河内長野市': 'senshu', '富田林市': 'senshu', '松原市': 'senshu',
  '藤井寺市': 'senshu', '羽曳野市': 'senshu', '大阪狭山市': 'senshu',
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

const targetShops = shops.filter(s => s.area === 'other' && s.isActive).slice(0, LIMIT);

console.log(`=== Google Places API (New) Geocoding ===`);
console.log(`対象: ${targetShops.length}件\n`);

// HTTPS POST request
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let result = '';
      res.on('data', chunk => result += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(result)); }
        catch(e) { reject(new Error(`JSON parse: ${result.substring(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
}

function addressToArea(address) {
  if (!address) return null;
  for (const [ward, area] of Object.entries(WARD_TO_AREA)) {
    if (address.includes(ward)) return { area, ward };
  }
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  let results = {};
  if (fs.existsSync(outputPath)) {
    try { results = JSON.parse(fs.readFileSync(outputPath, 'utf-8')); } catch(e) {}
  }

  let processed = 0, found = 0, notFound = 0, errors = 0, skipped = 0;

  for (const shop of targetShops) {
    if (results[shop.id] && results[shop.id].address) {
      skipped++;
      continue;
    }

    processed++;

    try {
      const data = await httpsPost(
        'places.googleapis.com',
        '/v1/places:searchText',
        {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
        },
        {
          textQuery: `${shop.name} 大阪`,
          languageCode: 'ja',
          locationBias: {
            circle: {
              center: { latitude: 34.6937, longitude: 135.5023 }, // 大阪駅付近
              radius: 50000.0, // 50km
            }
          },
          maxResultCount: 1,
        }
      );

      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        const address = place.formattedAddress || '';
        const areaResult = addressToArea(address);

        results[shop.id] = {
          name: shop.name,
          address: address,
          placeName: place.displayName?.text || '',
          lat: place.location?.latitude,
          lng: place.location?.longitude,
          suggestedArea: areaResult ? areaResult.area : null,
          matchedWard: areaResult ? areaResult.ward : null,
        };

        if (areaResult) {
          found++;
          process.stdout.write(`✅ ${processed} ID:${shop.id.padStart(3)} → ${areaResult.area.padEnd(18)} ${shop.name.substring(0, 30)}\n`);
        } else {
          notFound++;
          process.stdout.write(`❌ ${processed} ID:${shop.id.padStart(3)} → other(府外)        ${shop.name.substring(0, 22)} [${address.substring(0, 25)}]\n`);
        }
      } else if (data.error) {
        console.error(`\n🚫 API ERROR: ${JSON.stringify(data.error)}`);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        process.exit(1);
      } else {
        notFound++;
        results[shop.id] = { name: shop.name, address: null, suggestedArea: null, error: 'no_results' };
        process.stdout.write(`⚠️ ${processed} ID:${shop.id.padStart(3)} → no results         ${shop.name.substring(0, 30)}\n`);
      }
    } catch (e) {
      errors++;
      results[shop.id] = { name: shop.name, address: null, suggestedArea: null, error: e.message };
      process.stdout.write(`💥 ${processed} ID:${shop.id.padStart(3)} → ERROR              ${e.message.substring(0, 40)}\n`);
    }

    if (processed % 20 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      process.stdout.write(`--- saved (${processed} processed) ---\n`);
    }

    await sleep(200);
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  const allResults = Object.values(results);
  const withArea = allResults.filter(r => r.suggestedArea);

  console.log(`\n=== 完了 ===`);
  console.log(`処理: ${processed}件 / スキップ: ${skipped}件`);
  console.log(`エリア判定成功: ${found}件 / 判定不能: ${notFound}件 / エラー: ${errors}件`);
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
