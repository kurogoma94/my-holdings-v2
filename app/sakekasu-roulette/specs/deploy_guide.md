# 🚀 Web公開ガイド - 大阪酒カスルーレット

## 公開方法（Vercel を使う場合・無料）

### 事前準備
1. **GitHubアカウント** を作成する（持っていなければ）→ https://github.com
2. **Vercel** にサインアップする → https://vercel.com （GitHubアカウントでログイン可）

### 手順

#### Step 1: GitHubにリポジトリを作成
1. GitHubにログイン
2. 「New Repository」をクリック
3. リポジトリ名を `izakaya-roulette` にする
4. 「Private」にチェック（公開したくない場合）
5. 「Create repository」をクリック

#### Step 2: コードをアップロード
以下のコマンドをターミナルで実行（`app/src/` フォルダ内で）:
```bash
git init
git add .
git commit -m "初回コミット: 居酒屋ルーレット v1.0"
git remote add origin https://github.com/あなたのユーザー名/izakaya-roulette.git
git push -u origin main
```

#### Step 3: Vercelにデプロイ
1. https://vercel.com にログイン
2. 「Add New → Project」をクリック
3. GitHubから `izakaya-roulette` リポジトリを選択
4. 設定画面で以下を入力:
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
5. 「Deploy」をクリック！

→ **数分でURLが発行され、世界中からアクセスできるように！**

#### Step 4: InstagramのプロフィールにURLを貼る
1. Instagramアプリ → プロフィール編集
2. 「ウェブサイト」欄にVercelのURLを貼り付け
3. 保存！

---

## 独自ドメインの設定（任意）
Vercelの管理画面 → Settings → Domains から、
`izakaya-roulette.com` のような独自ドメインを設定できます（ドメイン購入が別途必要・年間約1,500円〜）。

---

## 更新方法
コードを変更したら:
```bash
git add .
git commit -m "変更内容の説明"
git push
```
→ Vercelが自動で再ビルド＆再デプロイしてくれる！
