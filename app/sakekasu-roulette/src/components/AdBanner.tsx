import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

// Web版広告（AdSense）とダミー枠のコンポーネント
export default function AdBanner() {
  const clientId = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID;
  const slotId = process.env.EXPO_PUBLIC_ADSENSE_SLOT_ID;

  useEffect(() => {
    // 本番用のIDがセットされている場合のみ、AdSenseの初期化処理を実行する
    if (clientId && slotId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [clientId, slotId]);

  return (
    <View style={{ width: '100%', height: 100, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
      {clientId && slotId ? (
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <ins class="adsbygoogle"
                   style="display:block"
                   data-ad-client="${clientId}"
                   data-ad-slot="${slotId}"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
            `,
          }}
          style={{ width: '100%' }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Text style={{ color: '#666', fontSize: 13, fontWeight: 'bold' }}>[ テスト用ダミー広告枠 ]</Text>
          <Text style={{ color: '#888', fontSize: 10, marginTop: 4 }}>※実際の広告は本番環境の公開URLでのみ表示されます</Text>
        </View>
      )}
      <Text style={{ fontSize: 10, color: '#999', position: 'absolute', bottom: 2 }}>Advertisement</Text>
    </View>
  );
}
