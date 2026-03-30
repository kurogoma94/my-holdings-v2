import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

// Native（アプリ）版広告（AdMob）のコンポーネント
export default function AdBanner() {
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <BannerAd
        unitId="ca-app-pub-8899707832109693/7429386387"
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
