# 📋 マイリスト・ルーレット（仮）技術仕様書

## 1. プロジェクト概要
- **目的**: ユーザー（会長）自身のGoogleマップ「保存済みリスト」を読み込み、リッチな演出で店舗を抽選する。
- **ターゲット**: リスト管理を自動化しつつ、外食の意思決定を楽しみたいビジネス層・グルメ層。
- **収益化**: Google AdMob（バナー/インタースティシャル）、および将来的なプレミアム版サブスクリプション。

## 2. システム構成
- **フロントエンド**: React Native (Expo) - `sakekasu-roulette` のエンジンを高度化して流用。
- **外部API**: Google Places API (詳細情報の取得・自動分類用)。

## 3. 主要機能
### A. ワンタップ同期エンジン
- **入力**: Google Takeout からの GeoJSON / CSV ファイル。
- **処理**: 
    - 前回同期分との重複チェック（IDまたは店名＋住所で判定）。
    - 新規店舗のみを抽出。
### B. AI自動分類 (Auto-Tagging)
Google Places APIの以下のフィールドを取得し、インデックス化します：
- `formatted_address`: 正規化された住所から「エリア」を抽出（例：大阪市北区 → 梅田エリア）。
- `types`: ジャンルの特定に使用。`restaurant`, `bar`, `night_club` 等の配列を独自の和名テーブルにマッピング。
- `price_level`: 0（無料）〜4（高価）の値を、￥、￥￥、￥￥￥、￥￥￥￥ に変換。
- `rating` & `user_ratings_total`: 店の「信頼度」として表示。
- `opening_hours`: 「今空いている店」フィルタリングに使用。
### C. プレミアム・ルーレット UI
- **コンセプト**: 「大人の遊び心」。ダークモードを基調とし、ネオンやゴールドをあしらったリッチなビジュアル。
- **広告配置**: ルーレット停止の邪魔にならない位置にアダプティブバナーを配置。
- **演出**: 抽選開始時に「Search in My Memories...」といった情緒的なアニメーション。

## 4. データ構造 (Schema)
```json
{
  "id": "string (Google Place ID)",
  "name": "string",
  "category": "string (Auto-assigned)",
  "area": "string (Auto-assigned)",
  "budget": "string (Auto-assigned)",
  "source_list": "string (どのリストから来たか)",
  "added_at": "timestamp"
}
```

## 5. 開発ステップ
1.  **Phase 1**: ベースエンジンの構築（今週中）
2.  **Phase 2**: Google Places API 連携の実装（来週前半）
3.  **Phase 3**: UIのプレミアム化と広告・収益化実装（来週後半）
