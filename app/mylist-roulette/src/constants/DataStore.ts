// [目的] マイリスト・ルーレットの店舗データ永続化（localStorage使用）
import { Platform } from 'react-native';
import { Shop } from './Types';

const STORAGE_KEY = 'mylist_roulette_shops';
const API_KEY_STORAGE = 'mylist_roulette_gapi_key';

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

export function getGoogleApiKey(): string {
  if (!isStorageAvailable()) return '';
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setGoogleApiKey(key: string): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function getAllShops(): Shop[] {
  if (!isStorageAvailable()) return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as Shop[];
  } catch {
    return [];
  }
}

export function saveShops(shops: Shop[]): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shops));
}

export function addShop(shop: Omit<Shop, 'id' | 'createdAt'>): Shop {
  const shops = getAllShops();
  const newShop: Shop = {
    ...shop,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString().split('T')[0],
  };
  shops.push(newShop);
  saveShops(shops);
  return newShop;
}

export function addShops(newShops: Omit<Shop, 'id' | 'createdAt'>[]): void {
  const shops = getAllShops();
  const now = new Date().toISOString().split('T')[0];
  
  const shopsToAdd = newShops.map((shop) => ({
    ...shop,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    createdAt: now,
  }));
  
  shops.push(...shopsToAdd);
  saveShops(shops);
}

export function clearAllShops(): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}
