// [目的] アプリ全体で使用する型定義

// エリアのマスターデータ
export const AREAS = [
  { code: 'umeda', label: '梅田・北新地' },
  { code: 'fukushima', label: '福島' },
  { code: 'shinsaibashi', label: '心斎橋・堀江' },
  { code: 'namba', label: '難波・道頓堀' },
  { code: 'tenma', label: '天満・天神橋筋' },
  { code: 'tsuruhashi', label: '鶴橋・桃谷' },
  { code: 'shinsekai', label: '新世界・西成' },
  { code: 'kyobashi', label: '京橋' },
  { code: 'abeno', label: '阿倍野・天王寺' },
  { code: 'kitahama', label: '北浜・淀屋橋' },
  { code: 'nishinakajima', label: '西中島・新大阪' },
  { code: 'other', label: 'その他' },
];

// ジャンルのマスターデータ
export const GENRES = [
  { code: 'tachinomi', label: '立ち飲み' },
  { code: 'yakitori', label: '焼き鳥' },
  { code: 'kushikatsu', label: '串カツ' },
  { code: 'izakaya', label: '大衆居酒屋' },
  { code: 'ramen', label: 'ラーメン・餃子' },
  { code: 'yakiniku', label: '焼肉・ホルモン' },
  { code: 'sushi', label: '寿司・海鮮' },
  { code: 'bar', label: 'バー・角打ち' },
  { code: 'other', label: 'その他' },
] as const;

export type AreaCode = typeof AREAS[number]['code'];
export type GenreCode = typeof GENRES[number]['code'];

// 店舗データの型
export interface Shop {
  id: string;
  name: string;
  area: AreaCode;
  genre: GenreCode;
  budgetMin: number;
  budgetMax?: number;
  comment: string;       // Takahiroの一言コメント
  rating: number;        // 1〜5（Takahiroのおすすめ度）
  photoUrl?: string;     // 店舗写真URL
  googleMapsUrl?: string;
  placeId?: string;      // Google Places API 用
  address?: string;
  phone?: string;
  openingHours?: string[];
  googleRating?: number;
  hasLunch: boolean;
  hasDinner: boolean;
  isActive: boolean;
  createdAt: string;
}

// ルーレットのフィルターモード
export type FilterMode = 'all' | 'area' | 'genre';

// ヘルパー関数: エリアコード → 日本語ラベル
export function getAreaLabel(code: AreaCode): string {
  return AREAS.find(a => a.code === code)?.label ?? code;
}

// ヘルパー関数: ジャンルコード → 日本語ラベル
export function getGenreLabel(code: GenreCode): string {
  return GENRES.find(g => g.code === code)?.label ?? code;
}

// ヘルパー関数: 予算表示用
export function formatBudget(min: number, max?: number): string {
  if (max) {
    return `¥${min.toLocaleString()}〜${max.toLocaleString()}`;
  }
  return `¥${min.toLocaleString()}〜`;
}
