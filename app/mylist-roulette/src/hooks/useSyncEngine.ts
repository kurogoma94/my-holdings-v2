// [目的] Google Takeoutデータのインポートと状態管理を行うフック
import { useState } from 'react';
import { parseGoogleTakeout, enhanceShopWithPlaceDetails } from '../constants/DataParser';
import { addShop, getGoogleApiKey } from '../constants/DataStore';
import { searchPlaceId, getPlaceDetails } from '../services/GooglePlacesService';

export function useSyncEngine() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; total: number } | null>(null);

  const syncData = async (jsonText: string) => {
    setIsSyncing(true);
    setSyncResult(null);

    const apiKey = getGoogleApiKey();

    try {
      const parsedShops = parseGoogleTakeout(jsonText);
      let successCount = 0;

      for (const rawShop of parsedShops) {
        let finalShop = rawShop;

        // APIキーがある場合のみ、詳細情報を取得
        if (apiKey && rawShop.name) {
          const placeId = await searchPlaceId(rawShop.name, rawShop.address || '');
          if (placeId) {
            const details = await getPlaceDetails(placeId);
            if (details) {
              finalShop = enhanceShopWithPlaceDetails(rawShop, details);
            }
          }
          // API制限に配慮して少し待機
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (finalShop.name) {
          addShop({
            name: finalShop.name,
            area: finalShop.area || 'other',
            genre: finalShop.genre || 'other',
            budgetMin: finalShop.budgetMin || 0,
            comment: finalShop.comment || '',
            rating: finalShop.rating || 3,
            isActive: true,
            address: finalShop.address,
            googleMapsUrl: finalShop.googleMapsUrl,
            placeId: finalShop.placeId,
          });
          successCount++;
        }
      }
      
      setSyncResult({
        success: successCount,
        total: parsedShops.length,
      });
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncResult,
    syncData,
  };
}
