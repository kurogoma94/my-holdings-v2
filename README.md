# 🏮 Black Sesame HD - Global Portal

> **"Passion to Reality, Reality to Impact."**
> 会長 Takahiroのビジョンを具現化する、Black Sesame HDの統合経営ポータルです。

---

## 🚀 Live Services & Quick Links

| 名前 | カテゴリ | リンク / 場所 |
| :--- | :--- | :--- |
| **大阪酒カスルーレット** | プロダクト | [Live Site](https://osaka-sakekasu-roulette.vercel.app/) / [管理画面](/app/sakekasu-roulette/src/app/admin.tsx) |
| **NOTE 発信基地** | メディア | [執筆中フォルダ](/note/drafts/) / [プロフ案](/note/drafts/note_profile_draft.md) |
| **EC 事業戦略** | 収益基盤 | [新商品案](/ec/product_drafts/eli_sauce_trial_set_plan.md) / [分析報告](/ec/reports/) |
| **全社 KPI マスタ** | 経営管理 | [KPI Master](/data/kpi_master.csv) |

---

## 👥 Organization & Persona Teams

各フォルダを開く（または担当者に話しかける）ことで、専門的なサポートを受けられます。

### 🏢 HD本社 (Management & Administration)

- **担当**: マナ (筆頭秘書) / ナオ (事務局長)
- **場所**: [`/hd`](/hd) | [`/rules/hd_rules.md`](/rules/hd_rules.md)
- **役割**: 全社統括、スケジュール管理、モーニングレポート作成。

### 💻 アプリ開発事業部 (Product & Tech)

- **担当**: ミレイ (PM/エンジニア)
- **場所**: [`/app`](/app) | [`/rules/app_rules.md`](/rules/app_rules.md)
- **マルチアプリ構造**:
  - [`/app/sakekasu-roulette`](/app/sakekasu-roulette) (今回のアプリ)
  - `/app/next-super-app` (将来のアプリ用)
- **成果**: [CSVインポート機能](/app/sakekasu-roulette/src/constants/DataStore.ts) / [自動デプロイ](/.github/workflows/deploy.yml)

### 🛒 EC事業部 & 📱 SNS事業部 (Commerce & Marketing)

- **担当**: リサ (仕入れ) / エミ (販促・分析)
- **場所**: [`/ec`](/ec) | [`/sns`](/sns) | [`/rules/ec_rules.md`](/rules/ec_rules.md)
- **成果**: [エリソースお試しセット案](/ec/product_drafts/eli_sauce_trial_set_plan.md)

### 📝 NOTE事業部 (Media & Branding)

- **担当**: コトハ (ライター)
- **場所**: [`/note`](/note) | [`/rules/note_rules.md`](/rules/note_rules.md)
- **成果**: [記事下書き](/note/drafts/)

---

## 📊 Business Intelligence (Reports)

| 種別 | 最新の報告書 | 内容 |
| :--- | :--- | :--- |
| **日次** | [今日の日報](/hd/reports/daily_20260317.md) | 本日の予定と優先タスク |
| **SNS分析** | [3月度 Instagram分析](/hd/reports/sns_monthly_analysis_202603.md) | トレンドと改善案 |
| **商品戦略** | [エリソース認知度向上の提案](/ec/reports/eli_sauce_awareness_report_emi.md) | 販促のアクションプラン |

---

## 🛠️ Infrastructure & Setup

- **自動化ツール**: [Vercel Deployment Guide](/app/sakekasu-roulette/specs/deploy_guide.md)
- **データ管理**: [店舗CSVテンプレート](/app/sakekasu-roulette/src/assets/templates/shop_template.csv)
- **ルールブック**: [`/rules`](/rules) フォルダに全事業部の思考回路が格納されています。

---

## 📂 Directory Structure (Snapshot)

```text
my-holdings-v2/
├── .github/     ← CI/CD（GitHub Actions）の司令塔
├── 🤖 rules/    ← AIの思考回路（hd, ec, sns, app, note）
├── 🏢 hd/       ← 本社機能（レポート、スケジュール、契約）
├── 🛒 ec/       ← 物販（商品企画、仕入れ、販売データ）
├── 📱 sns/      ← 発信（投稿台本、トレンド分析）
├── 📝 note/     ← 資産（コラム、ストーリー、自己紹介）
├── 💻 app/      ← 武器（アプリごとの独立管理）
│   └── sakekasu-roulette/  ← 酒カスルーレット専用ルーム
└── 📊 data/     ← 全社共通データベース
```

---
**Status**: 🚀 All Systems Operational | **Current Focus**: Content Filling & CSV Import
