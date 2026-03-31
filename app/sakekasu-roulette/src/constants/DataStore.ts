// [目的] 店舗データの永続化ストア（localStorage使用、MockDataフォールバック）
// [注意] 将来的にFirestoreに移行する際は、このファイルのAPI関数だけ書き換えればOK
import { Platform } from 'react-native';
import { Shop } from './Types';
import { MOCK_SHOPS, MOCK_DATA_UPDATED_AT } from './MockData';

const STORAGE_KEY = 'izakaya_roulette_shops';
const STORAGE_VERSION_KEY = 'izakaya_roulette_data_version';
const ADMIN_PASSWORD_KEY = 'izakaya_roulette_admin_pw';
const API_KEY_STORAGE = 'izakaya_roulette_gapi_key';

// デフォルトの管理パスワード（初回のみ。設定画面で変更可能）
const DEFAULT_ADMIN_PASSWORD = 'osaka2026';

// ストレージが使えるかチェック（Web環境のみ）
function isStorageAvailable(): boolean {
  if (Platform.OS !== 'web') return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// 全店舗を取得
export function getAllShops(): Shop[] {
  if (!isStorageAvailable()) return MOCK_SHOPS;

  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  const storedShops = localStorage.getItem(STORAGE_KEY);

  // 初回起動時、またはデータが更新されている場合
  if (!storedShops || storedVersion !== MOCK_DATA_UPDATED_AT) {
    console.log('Synchronizing with new MockData version:', MOCK_DATA_UPDATED_AT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SHOPS));
    localStorage.setItem(STORAGE_VERSION_KEY, MOCK_DATA_UPDATED_AT);
    return MOCK_SHOPS;
  }

  try {
    return JSON.parse(storedShops) as Shop[];
  } catch {
    return MOCK_SHOPS;
  }
}

// アクティブな店舗のみ取得
export function getActiveShops(): Shop[] {
  return getAllShops().filter(s => s.isActive);
}

// 店舗を追加
export function addShop(shop: Omit<Shop, 'id' | 'createdAt'>): Shop {
  const shops = getAllShops();
  const newShop: Shop = {
    ...shop,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0],
  };
  shops.push(newShop);
  saveShops(shops);
  return newShop;
}

// 店舗を更新
export function updateShop(id: string, updates: Partial<Shop>): Shop | null {
  const shops = getAllShops();
  const index = shops.findIndex(s => s.id === id);
  if (index === -1) return null;

  shops[index] = { ...shops[index], ...updates };
  saveShops(shops);
  return shops[index];
}

// 店舗を削除（論理削除）
export function deleteShop(id: string): boolean {
  const shops = getAllShops();
  const index = shops.findIndex(s => s.id === id);
  if (index === -1) return false;

  shops[index].isActive = false;
  saveShops(shops);
  return true;
}

// 店舗を完全削除
export function permanentDeleteShop(id: string): boolean {
  const shops = getAllShops();
  const filtered = shops.filter(s => s.id !== id);
  if (filtered.length === shops.length) return false;
  saveShops(filtered);
  return true;
}

// ストレージに保存
function saveShops(shops: Shop[]): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
}

// 管理パスワードの検証
export function verifyAdminPassword(password: string): boolean {
  if (!isStorageAvailable()) return password === DEFAULT_ADMIN_PASSWORD;

  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
  const correctPassword = stored || DEFAULT_ADMIN_PASSWORD;
  return password === correctPassword;
}

// 管理パスワードの変更
export function changeAdminPassword(newPassword: string): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
}

// Google API キーの取得
export function getGoogleApiKey(): string {
  if (!isStorageAvailable()) return '';
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

// Google API キーの保存
export function setGoogleApiKey(key: string): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(API_KEY_STORAGE, key);
}

// データをリセット（MockDataに戻す）
export function resetToMockData(): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SHOPS));
  localStorage.setItem(STORAGE_VERSION_KEY, MOCK_DATA_UPDATED_AT);
}

// CSVインポート
import { AREAS, GENRES, AreaCode, GenreCode } from './Types';

export function importShops(csvText: string): { success: number; failed: number; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) return { success: 0, failed: 0, errors: ['データが空か、ヘッダーのみです'] };

  // ヘッダーをスキップ
  const dataLines = lines.slice(1);
  const shops = getAllShops();
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  dataLines.forEach((line, index) => {
    // 簡易的なCSVパース（カンマ区切り、引用符は考慮しない簡易版）
    const parts = line.split(',').map(p => p.trim());
    
    // 基本的なバリデーション
    if (parts.length < 3) {
      errorCount++;
      errors.push(`行 ${index + 2}: 項目が足りません`);
      return;
    }

    const [name, areaLabel, genreLabel, budgetMinStr, budgetMaxStr, comment, ratingStr, mapsUrl] = parts;

    // エリア・ジャンルの変換
    const area = AREAS.find(a => a.label.includes(areaLabel))?.code;
    const genre = GENRES.find(g => g.label.includes(genreLabel))?.code;

    if (!area || !genre) {
      errorCount++;
      errors.push(`行 ${index + 2}: エリアまたはジャンルが正しくありません (${areaLabel}, ${genreLabel})`);
      return;
    }

    const budgetMin = parseInt(budgetMinStr, 10) || 0;
    const budgetMax = budgetMaxStr ? parseInt(budgetMaxStr, 10) : undefined;
    const rating = Math.min(5, Math.max(1, parseInt(ratingStr, 10) || 3));

    const shopData: Omit<Shop, 'id' | 'createdAt'> = {
      name,
      area: area as AreaCode,
      genre: genre as GenreCode,
      budgetMin,
      budgetMax,
      comment: comment || '',
      rating,
      googleMapsUrl: mapsUrl || '',
      isActive: true,
    };

    // 重複チェック（店名）
    const existingIndex = shops.findIndex(s => s.name === name);
    if (existingIndex !== -1) {
      shops[existingIndex] = {
        ...shops[existingIndex],
        ...shopData,
      };
    } else {
      shops.push({
        ...shopData,
        id: (Date.now() + index).toString(),
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    successCount++;
  });

  if (successCount > 0) {
    saveShops(shops);
  }

  return { success: successCount, failed: errorCount, errors };
}
