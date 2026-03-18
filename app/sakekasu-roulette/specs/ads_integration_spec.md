# 酒カスルーレット：Google Ads (AdMob) 実装ガイド

ミレイ（テックリード）より、広告実装の具体的な技術選定とコード案を報告します。

## 🛠️ 技術選定
- **ライブラリ**: `react-native-google-mobile-ads`
- **広告形式**: **バナー広告 (Banner Ads)** を最優先で実装します。
- **実装可否**: 技術的に全く問題ありません。現在の Expo/React Native 構成で標準的に実装可能です。

## 📝 実装手順

### 1. ライブラリのインストール
```bash
npx expo install react-native-google-mobile-ads
```

### 2. app.json の設定
`expo` セクション内に以下を追記（テスト用IDを使用）:
```json
"androidAppId": "ca-app-pub-3940256099942544~3347511713",
"iosAppId": "ca-app-pub-3940256099942544~1458002511"
```

### 3. コードの修正 (app/(tabs)/index.tsx)
結果表示の下、またはスクロールビューの最下部にバナーを配置します。

```tsx
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// ... (RouletteScreen コンポーネント内、下部のViewスペーサーの前)

<View style={{ alignItems: 'center', marginVertical: 10 }}>
  <BannerAd
    unitId={TestIds.BANNER}
    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    requestOptions={{
      requestNonPersonalizedAdsOnly: true,
    }}
  />
</View>
```

## 💰 収益化（マネタイズ）の仕組み
今回の AdMob 実装により、以下の2軸で収益が発生します：

1.  **インプレッション収益 (CPM)**: 広告が表示されるだけで発生する収益です。ユーザーが増えるほど安定した収入になります。
2.  **クリック収益 (CPC)**: ユーザーが広告をタップした際に発生する収益です。1クリックあたりの単価が高いため、こちらが収益の柱となります。

### さらに収益を上げるためのステップ
- **インタースティシャル広告**: ルーレットの結果が出たタイミングで全画面広告を出すことで、クリック率を大幅に高めることが可能です。
- **リサーチ連動**: 会長の「エリソース」に関連する広告（食品・調味料系）が出るようターゲティング調整を行うことで、本業との相乗効果を狙います。
