// [目的] 店舗データの永続化ストア（localStorage使用、MockDataフォールバック）
// [注意] 将来的にFirestoreに移行する際は、このファイルのAPI関数だけ書き換えればOK
import { Platform } from 'react-native';
import { Shop } from './Types';
import { MOCK_SHOPS } from './MockData';

const STORAGE_KEY = 'izakaya_roulette_shops';
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

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // 初回起動時: MockDataをストレージに保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SHOPS));
    return MOCK_SHOPS;
  }

  try {
    return JSON.parse(stored) as Shop[];
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
}
