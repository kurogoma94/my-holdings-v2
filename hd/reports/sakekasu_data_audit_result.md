# 🏮 酒カスルーレット店舗データ 監査レポート

**監査実施日**: 2026/4/7 18:21:27

## 🌏 1. エリア外店舗の検出 (Total: 1)
大阪エリア外（主に京都など）の店舗が検出されました。これらは削除または「番外編」として分離することを推奨します。

- [ID: 27] **あぶり餅 本家 根元 かざりや** (〒603-8243 京都府京都市北区紫野今宮町９６)

## 🍱 2. 系統的フラグエラーの疑い (Lunch Flags)
`hasLunch: false` が不自然に連続している箇所（10件以上）を抽出しました。一括取込時のバグの可能性があります。

- [ID: 1 から] **537件連続** で `hasLunch: false` になっています。

## ⚠️ 3. 情報欠落エントリ
- [ID: unknown] **unknown**: Address missing or too short
- [ID: 142] **Blue Entrance Kitchen 大阪心斎橋店**: Address missing or too short
- [ID: 188] **4坪牡蠣小屋 キヨリト大阪福島店**: Address missing or too short
- [ID: 237] **ニカイノオアシスＫＩＴＴＥ大阪店**: Address missing or too short
- [ID: 298] **無鉄砲 大阪店**: Address missing or too short
- [ID: 314] **らーめん チョンマゲ 大阪梅田店**: Address missing or too short
- [ID: 342] **地酒蔵大阪 なんば本店**: Address missing or too short
- [ID: 352] **大阪まんぷく堂**: Address missing or too short
- [ID: 354] **新宿焼肉 牛たんの檸檬 大阪本店**: Address missing or too short
- [ID: 372] **こだわり食材市場 大阪府中央卸売市場加工食品卸売商業協同組合**: Address missing or too short
- [ID: 404] **居酒屋十月二日 福島区**: Address missing or too short
- [ID: 430] **大阪大衆居酒屋 飯と酒と音 almalio**: Address missing or too short
- [ID: 451] **ラーメン チョンマゲ 大阪天六店**: Address missing or too short
- [ID: 511] **焼売のジョー大阪駅前第三ビル店**: Address missing or too short
- [ID: 559] **ステーキファイブと寿司六 大阪駅前第2ビル店**: Address missing or too short
- [ID: 578] **大正五年創業 串かつ ぎふや本家 大阪新世界店**: Address missing or too short
- [ID: 580] **〒556-0002 大阪府大阪市浪速区恵美須東２丁目３−９**: Address missing or too short
- [ID: 584] **大阪天満宮 鮨とよなが**: Address missing or too short
- [ID: 602] **麺屋 帆のる大阪なんば店**: Address missing or too short
- [ID: 626] **和牛タン次郎 大阪天満店**: Address missing or too short
- [ID: 630] **鮨仙酢 本店 大阪駅前**: Address missing or too short
- [ID: 677] **大阪うどん いなの路**: Address missing or too short
- [ID: 709] **サロン卵と私 ルクア大阪店**: Address missing or too short
- [ID: 719] **ホルモン千葉 大阪梅田店**: Address missing or too short
- [ID: 126] **ダテダチ**: Address missing or too short
- [ID: 128] **裏ヒロヤ**: Address missing or too short
- [ID: 129] **Ristorante e Pizzeria SANTA LUCIA**: Address missing or too short
- [ID: 130] **Bar Asumo バーアスモ お初天神店**: Address missing or too short
- [ID: 133] **ヤマダモンゴル**: Address missing or too short
- [ID: 134] **おばんざい鈴**: Address missing or too short
- [ID: 136] **リゴレット**: Address missing or too short
- [ID: 137] **しんぱち食堂JR京橋駅前店**: Address missing or too short
- [ID: 139] **鮨MANABU**: Address missing or too short
- [ID: 140] **やっこ**: Address missing or too short
- [ID: 141] **牡蠣乃家 岸和田店**: Address missing or too short
- [ID: 144] **グリル マルヨシ**: Address missing or too short
- [ID: 147] **元祖ぶっち切り寿司 魚心 本店**: Address missing or too short
- [ID: 148] **三国そば**: Address missing or too short
- [ID: 149] **ののじ**: Address missing or too short
- [ID: 150] **PISOLA 守口大日店**: Address missing or too short
- [ID: 151] **御影郷ふくじゅ**: Address missing or too short
- [ID: 156] **トッサ・ジ・クラッサン**: Address missing or too short
- [ID: 157] **ミックステイスト**: Address missing or too short
- [ID: 158] **３ちゃん屋**: Address missing or too short
- [ID: 169] **せせり蒲焼スタンド八とり2号店**: Address missing or too short
- [ID: 170] **文世食堂**: Address missing or too short
- [ID: 171] **ぎょうざ処だいきち**: Address missing or too short
- [ID: 172] **中国酒家 菜都**: Address missing or too short
- [ID: 173] **Petit Luxe**: Address missing or too short
- [ID: 174] **天王寺 豆ふ屋 やすまる ～豆富と鮨と日本料理～/Tennoji Tofuya Yasumaru\**: Address missing or too short
- [ID: 175] **いし井Jr.**: Address missing or too short
- [ID: 176] **吾一 肥後橋店**: Address missing or too short
- [ID: 177] **きち蔵**: Address missing or too short
- [ID: 178] **総大醤**: Address missing or too short
- [ID: 180] **鳥悟**: Address missing or too short
- [ID: 181] **燻製イタリア酒場 京橋 ORA（オーラ）**: Address missing or too short
- [ID: 182] **立ち飲みクラフトビール酒場 ビアスタンド モルト!! 阪急梅田店**: Address missing or too short
- [ID: 183] **串かつ 鳥の巣**: Address missing or too short
- [ID: 184] **福島金魚**: Address missing or too short
- [ID: 185] **大衆ビストロ うらきんぎょ 福島**: Address missing or too short
- [ID: 186] **麦と林檎のイタリア酒場 福島事変**: Address missing or too short
- [ID: 187] **鈍◯酒場 福島店**: Address missing or too short
- [ID: 190] **みつわや酒店**: Address missing or too short
- [ID: 193] **屋台おでん**: Address missing or too short
- [ID: 194] **昭和町 串揚げ はなおか**: Address missing or too short
- [ID: 196] **甘党 お好み焼 かく庄**: Address missing or too short
- [ID: 197] **わかば**: Address missing or too short
- [ID: 198] **福太郎 本店**: Address missing or too short
- [ID: 199] **祐星 ウラなんば店**: Address missing or too short
- [ID: 200] **大興寿司 本店**: Address missing or too short
- [ID: 201] **かじゅあるかっぽーTSUKUSI**: Address missing or too short
- [ID: 202] **堺筋本町給油所 一号店**: Address missing or too short
- [ID: 203] **岡室酒店**: Address missing or too short
- [ID: 204] **餃子 立山 梅田店（飲食専門店）**: Address missing or too short
- [ID: 205] **香港飲茶 星街**: Address missing or too short
- [ID: 206] **大衆串カツ酒場なかむら布施**: Address missing or too short
- [ID: 207] **餃子の店 もも**: Address missing or too short
- [ID: 208] **やまのや**: Address missing or too short
- [ID: 209] **ハモネリア ベジョータ ギョクロ**: Address missing or too short
- [ID: 210] **金龍ラーメン 戎橋筋店**: Address missing or too short
- [ID: 213] **魚太寿司**: Address missing or too short
- [ID: 214] **麺と肉 だいつる**: Address missing or too short
- [ID: 215] **和風もつ料理あらた**: Address missing or too short
