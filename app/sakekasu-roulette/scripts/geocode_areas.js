/**
 * Step 2: Nominatim (OpenStreetMap) API を使った住所ベースエリア自動分類
 * - 店名で検索 → 住所取得 → 区/市からエリアコード判定
 * - レート制限: 1 req/sec (Nominatim利用規約準拠)
 * - 結果はJSONファイルに保存し、別スクリプトで適用
 * 
 * Usage: node geocode_areas.js [--start N] [--limit N]
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const START = parseInt(process.argv.find((_, i, a) => a[i-1] === '--start') || '0');
const LIMIT = parseInt(process.argv.find((_, i, a) => a[i-1] === '--limit') || '9999');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const outputPath = path.join(__dirname, 'geocode_results.json');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// 大阪の区名 → エリアコード マッピング
const WARD_TO_AREA = {
  // 梅田・北新地
  '北区': 'umeda',  // 大阪市北区（梅田・天満・天神橋含む）
  
  // 福島
  '福島区': 'fukushima',
  
  // 心斎橋・堀江
  // 中央区は南側（心斎橋・難波）と北側（北浜）に分かれるが、デフォルトはshinsaibashi
  
  // 難波・道頓堀 → 浪速区
  '浪速区': 'namba',
  
  // 新世界・西成
  '西成区': 'shinsekai',
  
  // 京橋 → 都島区/城東区の一部
  '都島区': 'kyobashi',
  
  // 阿倍野・天王寺
  '阿倍野区': 'abeno',
  '天王寺区': 'abeno',
  
  // 北浜・淀屋橋 → 中央区（北浜寄り）
  '中央区': 'shinsaibashi', // デフォルト。北浜はStep1で処理済み
  
  // 西中島・新大阪
  '淀川区': 'nishinakajima',
  
  // 鶴橋・桃谷
  '生野区': 'tsuruhashi',
  '東成区': 'tsuruhashi',
  
  // 西区（靭公園・京町堀等）
  '西区': 'osakacity-other',
  
  // 城東
  '城東区': 'osakacity-other',
  '鶴見区': 'osakacity-other',
  '旭区': 'osakacity-other',
  
  // 南部
  '住吉区': 'osakacity-other',
  '住之江区': 'osakacity-other',
  '東住吉区': 'osakacity-other',
  '平野区': 'osakacity-other',
  '大正区': 'osakacity-other',
  '港区': 'osakacity-other',
  '此花区': 'osakacity-other',
  
  // 北部
  '東淀川区': 'osakacity-other',
  '西淀川区': 'osakacity-other',
  
  // 北摂
  '茨木市': 'hokusetsu',
  '高槻市': 'hokusetsu',
  '吹田市': 'hokusetsu',
  '豊中市': 'hokusetsu',
  '箕面市': 'hokusetsu',
  '池田市': 'hokusetsu',
  '摂津市': 'hokusetsu',
  '島本町': 'hokusetsu',
  
  // 東大阪・京阪エリア
  '東大阪市': 'higashiosaka',
  '八尾市': 'higashiosaka',
  '枚方市': 'higashiosaka',
  '寝屋川市': 'higashiosaka',
  '守口市': 'higashiosaka',
  '門真市': 'higashiosaka',
  '大東市': 'higashiosaka',
  '四條畷市': 'higashiosaka',
  '交野市': 'higashiosaka',
  
  // 堺・泉州
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

// "other" かつアクティブな店舗を抽出
const targetShops = shops
  .filter(s => s.area === 'other' && s.isActive)
  .slice(START, START + LIMIT);

console.log(`=== Nominatim Geocoding ===`);
console.log(`対象: ${targetShops.length}件 (start: ${START})`);
console.log(`Rate: 1 req/sec (Nominatim policy)\n`);

// HTTP GET with promise
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { 
      headers: { 'User-Agent': 'SakekasuRoulette/1.0 (data-enrichment)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error(`JSON parse error: ${data.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// 住所からエリアコードを判定
function addressToArea(address) {
  if (!address) return null;
  
  // 大阪市の区をチェック
  for (const [ward, area] of Object.entries(WARD_TO_AREA)) {
    if (address.includes(ward)) return { area, ward };
  }
  
  // 大阪府外の場合は 'other' のまま
  return null;
}

// sleep
const sleep = ms => new Promise(r => setTimeout(r, ms));

// メイン処理
async function main() {
  // 既存の結果を読み込み（追記モード）
  let results = {};
  if (fs.existsSync(outputPath)) {
    try { results = JSON.parse(fs.readFileSync(outputPath, 'utf-8')); }
    catch(e) { results = {}; }
  }
  
  let processed = 0;
  let found = 0;
  let notFound = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const shop of targetShops) {
    // 既に処理済みならスキップ
    if (results[shop.id]) {
      skipped++;
      continue;
    }
    
    processed++;
    const query = encodeURIComponent(`${shop.name} 大阪`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1&countrycodes=jp`;
    
    try {
      const data = await httpGet(url);
      
      if (data.length > 0) {
        const result = data[0];
        const addr = result.address || {};
        const displayName = result.display_name || '';
        
        // 住所パーツを組み立て
        const fullAddr = [
          addr.province || addr.state || '',
          addr.city || addr.town || addr.village || '',
          addr.city_district || addr.suburb || addr.quarter || '',
        ].filter(Boolean).join(' ');
        
        const areaResult = addressToArea(displayName);
        
        results[shop.id] = {
          name: shop.name,
          address: fullAddr,
          displayName: displayName.substring(0, 100),
          lat: result.lat,
          lon: result.lon,
          suggestedArea: areaResult ? areaResult.area : null,
          matchedWard: areaResult ? areaResult.ward : null,
          confidence: result.importance || 0,
        };
        
        if (areaResult) {
          found++;
          process.stdout.write(`✅ ${processed}/${targetShops.length - skipped} ID:${shop.id.padStart(3)} → ${areaResult.area.padEnd(18)} ${shop.name.substring(0, 30)}\n`);
        } else {
          notFound++;
          process.stdout.write(`❌ ${processed}/${targetShops.length - skipped} ID:${shop.id.padStart(3)} → other(府外?)       ${shop.name.substring(0, 30)} [${fullAddr}]\n`);
        }
      } else {
        notFound++;
        results[shop.id] = {
          name: shop.name,
          address: null,
          suggestedArea: null,
          error: 'not_found',
        };
        process.stdout.write(`⚠️ ${processed}/${targetShops.length - skipped} ID:${shop.id.padStart(3)} → not found          ${shop.name.substring(0, 30)}\n`);
      }
    } catch (e) {
      errors++;
      results[shop.id] = {
        name: shop.name,
        address: null,
        suggestedArea: null,
        error: e.message,
      };
      process.stdout.write(`💥 ${processed}/${targetShops.length - skipped} ID:${shop.id.padStart(3)} → ERROR              ${e.message.substring(0, 40)}\n`);
    }
    
    // 中間保存（10件ごと）
    if (processed % 10 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    }
    
    // レート制限: 1.1秒待機
    await sleep(1100);
  }
  
  // 最終保存
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  // サマリー
  const allResults = Object.values(results);
  const withArea = allResults.filter(r => r.suggestedArea);
  
  console.log(`\n=== 完了 ===`);
  console.log(`処理: ${processed}件 / スキップ(処理済み): ${skipped}件`);
  console.log(`エリア判定成功: ${found}件`);
  console.log(`判定不能(府外等): ${notFound}件`);
  console.log(`エラー: ${errors}件`);
  console.log(`\n累計結果: ${allResults.length}件 (うちエリア判定: ${withArea.length}件)`);
  console.log(`保存先: ${outputPath}`);
  
  // エリア別集計
  const areaSummary = {};
  withArea.forEach(r => {
    areaSummary[r.suggestedArea] = (areaSummary[r.suggestedArea] || 0) + 1;
  });
  console.log('\nエリア別集計:');
  Object.entries(areaSummary).sort((a, b) => b[1] - a[1]).forEach(([area, count]) => {
    console.log(`  ${area.padEnd(20)} ${count}件`);
  });
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
