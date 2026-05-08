/**
 * hasDinner フィールド一括追加スクリプト
 * - 全レコードに hasDinner を追加
 * - ジャンル・店名・コメントからヒューリスティックに判定
 * - デフォルトは true（飲食店はほぼディナー営業あり）
 * - カフェ・ベーカリー・弁当・和菓子等はfalseに
 */
const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '..', 'src', 'constants', 'MockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf-8');

// hasDinner が既に存在するか確認
if (content.includes('"hasDinner"')) {
  console.log('hasDinner already exists in some records. Aborting to avoid duplicates.');
  process.exit(1);
}

// ディナー営業なしと判定するキーワード（店名・コメントから）
const NO_DINNER_NAME_KEYWORDS = [
  '弁当', 'ベーカリー', 'Bakery', 'パン屋',
  '和菓子', 'THE ALLEY', 'タピオカ',
  'パティスリー', 'Patisserie',
];

const NO_DINNER_COMMENT_KEYWORDS = [
  'ベーカリー', 'パン屋', '和菓子屋', '弁当',
  'パティスリー', 'クレープ',
];

// 店舗ごとにhasDinnerを判定
// 行単位で処理してhasLunch行の後にhasDinnerを挿入
const lines = content.split('\n');
const newLines = [];
let currentShopName = '';
let currentShopComment = '';
let currentShopGenre = '';
let inShop = false;
let shopLines = [];

function shouldHaveDinner(name, comment, genre) {
  // デフォルトはtrue
  // 以下のパターンはfalseにする
  
  const nameLower = (name || '').toLowerCase();
  const commentLower = (comment || '').toLowerCase();
  
  // 弁当製造業者
  if (NO_DINNER_NAME_KEYWORDS.some(k => name.includes(k))) return false;
  if (NO_DINNER_COMMENT_KEYWORDS.some(k => comment.includes(k))) return false;
  
  // 総菜屋（テイクアウト専門）
  if (comment.includes('総菜屋') && !comment.includes('レストラン')) return false;
  
  // THE ALLEY等のドリンク専門店
  if (nameLower.includes('the alley')) return false;
  
  return true;
}

let shopCount = 0;
let dinnerTrueCount = 0;
let dinnerFalseCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // 店名を追跡
  const nameMatch = trimmed.match(/^"name":\s*"(.+)"[,]?$/);
  if (nameMatch) {
    currentShopName = nameMatch[1];
  }
  
  // コメントを追跡
  const commentMatch = trimmed.match(/^"comment":\s*"(.+)"[,]?$/);
  if (commentMatch) {
    currentShopComment = commentMatch[1];
  }
  
  // ジャンルを追跡
  const genreMatch = trimmed.match(/^"genre":\s*"(.+)"[,]?$/);
  if (genreMatch) {
    currentShopGenre = genreMatch[1];
  }
  
  // hasLunch行を検出 → その直後にhasDinnerを挿入
  const lunchMatch = trimmed.match(/^"hasLunch":\s*(true|false)$/);
  if (lunchMatch) {
    const hasDinner = shouldHaveDinner(currentShopName, currentShopComment, currentShopGenre);
    
    if (hasDinner) dinnerTrueCount++;
    else dinnerFalseCount++;
    shopCount++;
    
    // hasLunchの行末にカンマがなければ追加（hasDinnerが続くため）
    // 行のインデントを取得
    const indent = line.match(/^(\s*)/)[1];
    
    // hasLunch行にカンマを確保
    let fixedLine = line;
    if (!line.trimEnd().endsWith(',')) {
      // hasLunch行がオブジェクトの最後のフィールドだった場合
      // 現在の行末に , を追加
      fixedLine = line.replace(/("hasLunch":\s*(true|false))(\s*)$/, '$1,$3');
    }
    newLines.push(fixedLine);
    
    // hasDinner行を追加
    newLines.push(`${indent}"hasDinner": ${hasDinner}`);
    
    continue;
  }
  
  newLines.push(line);
}

// タイムスタンプを更新
const now = new Date().toISOString();
const updatedContent = newLines.join('\n').replace(
  /MOCK_DATA_UPDATED_AT = '[^']+'/,
  `MOCK_DATA_UPDATED_AT = '${now}'`
);

fs.writeFileSync(mockDataPath, updatedContent, 'utf-8');

console.log('=== hasDinner 一括追加完了 ===');
console.log(`Total shops processed: ${shopCount}`);
console.log(`hasDinner: true  = ${dinnerTrueCount}`);
console.log(`hasDinner: false = ${dinnerFalseCount}`);
console.log(`Timestamp updated to: ${now}`);

// 検証
const verify = fs.readFileSync(mockDataPath, 'utf-8');
const dinnerCount = (verify.match(/hasDinner/g) || []).length;
const lunchCount = (verify.match(/hasLunch/g) || []).length;
console.log(`\n=== 検証 ===`);
console.log(`hasLunch fields:  ${lunchCount}`);
console.log(`hasDinner fields: ${dinnerCount}`);
console.log(`Match: ${lunchCount === dinnerCount ? '✅ OK' : '❌ MISMATCH'}`);
