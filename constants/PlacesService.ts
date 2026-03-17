// [目的] Google Places API との連携サービス
// [概要] 店名+エリアから店舗情報を自動取得する
import { getGoogleApiKey } from './DataStore';

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  openingHours?: string[];
  photoUrl?: string;
  googleMapsUrl: string;
  lat?: number;
  lng?: number;
}

// Google Places API で店舗を検索
export async function searchPlace(
  shopName: string,
  area: string
): Promise<PlaceSearchResult[]> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    throw new Error('Google API キーが設定されていません。設定画面からAPIキーを入力してください。');
  }

  const query = `${shopName} ${area} 大阪`;

  try {
    // Text Search API を使用
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ja&region=jp&key=${apiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.length) {
      return [];
    }

    // 上位3件を返す
    const results: PlaceSearchResult[] = data.results.slice(0, 3).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || '',
      rating: place.rating,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      photoUrl: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : undefined,
    }));

    return results;
  } catch (error) {
    console.error('Places API エラー:', error);
    throw new Error('Google Places API の呼び出しに失敗しました。APIキーを確認してください。');
  }
}

// Place Details API で詳細情報を取得
export async function getPlaceDetails(placeId: string): Promise<Partial<PlaceSearchResult>> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) return {};

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,rating,opening_hours,photos,url&language=ja&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) return {};

    const place = data.result;
    return {
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      rating: place.rating,
      openingHours: place.opening_hours?.weekday_text,
      googleMapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      photoUrl: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
        : undefined,
    };
  } catch (error) {
    console.error('Place Details エラー:', error);
    return {};
  }
}
