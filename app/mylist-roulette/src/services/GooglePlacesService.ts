// [目的] Google Places API を使用して店舗詳細情報を取得するサービス
import { getGoogleApiKey } from '../constants/DataStore';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export interface PlaceDetails {
  placeId: string;
  rating?: number;
  types: string[];
  formatted_address: string;
  opening_hours?: {
    weekday_text: string[];
  };
}

export async function searchPlaceId(name: string, location: string): Promise<string | null> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/findplacefromtext/json?input=${encodeURIComponent(
        name + ' ' + location
      )}&inputtype=textquery&fields=place_id&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }
    return null;
  } catch (error) {
    console.error('Search Place ID failed:', error);
    return null;
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const apiKey = getGoogleApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/details/json?place_id=${placeId}&fields=place_id,rating,type,formatted_address,opening_hours&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      return data.result as PlaceDetails;
    }
    return null;
  } catch (error) {
    console.error('Get Place Details failed:', error);
    return null;
  }
}
