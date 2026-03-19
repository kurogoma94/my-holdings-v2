import { Shop, AreaCode, GenreCode, AREAS, GENRES } from './Types';
import { PlaceDetails } from '../services/GooglePlacesService';

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    name: string;
    location: string;
    comment?: string;
    categories?: string[];
  };
}

export function mapGoogleTypeToGenre(types: string[]): GenreCode {
  if (types.includes('bar') || types.includes('night_club') || types.includes('liquor_store')) return 'bar';
  if (types.includes('restaurant')) {
    if (types.includes('sushi_restaurant')) return 'sushi';
    if (types.includes('ramen_restaurant')) return 'ramen';
    return 'izakaya';
  }
  return 'other';
}

export function mapAddressToArea(address: string): AreaCode {
  if (!address) return 'other';
  if (address.includes('天満') || address.includes('天神橋')) return 'tenma';
  if (address.includes('難波') || address.includes('道頓堀') || address.includes('千日前')) return 'namba';
  if (address.includes('鶴橋')) return 'tsuruhashi';
  if (address.includes('梅田') || address.includes('北新地')) return 'umeda';
  if (address.includes('新世界') || address.includes('西成')) return 'shinsekai';
  if (address.includes('京橋')) return 'kyobashi';
  if (address.includes('阿倍野') || address.includes('天王寺')) return 'abeno';
  if (address.includes('北浜') || address.includes('淀屋橋')) return 'kitahama';
  return 'other';
}

export function enhanceShopWithPlaceDetails(shop: Partial<Shop>, details: PlaceDetails): Partial<Shop> {
  return {
    ...shop,
    placeId: details.placeId,
    rating: details.rating || shop.rating,
    address: details.formatted_address || shop.address,
    genre: mapGoogleTypeToGenre(details.types),
    area: mapAddressToArea(details.formatted_address || ''),
  };
}

export function parseGoogleTakeout(jsonText: string): Partial<Shop>[] {
  try {
    const data = JSON.parse(jsonText);
    const features: GeoJSONFeature[] = data.features || [];

    return features.map((feature) => {
      const { name, location, comment } = feature.properties;
      const [lng, lat] = feature.geometry.coordinates;

      return {
        name,
        address: location,
        comment: comment || '',
        area: 'other' as AreaCode,
        genre: 'other' as GenreCode,
        isActive: true,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      };
    });
  } catch (error) {
    console.error('Failed to parse GeoJSON:', error);
    return [];
  }
}
