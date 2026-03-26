# 🚀 Git自動同期の設定ガイド

「保存を忘れても勝手にGitHubに上がる」状態を作るための設定手順です。

## 方案1：Windows タスクスケジューラによる定期実行（推奨）

1時間おき、またはPC起動時に自動で `git push` を行う設定です。

### 1. 実行スクリプトの作成
以下の内容を `git_sync.ps1` という名前で保存します。

```powershell
$workspaces = @(
    "C:\Users\kurog\OneDrive\My AI Campany\Black Sesame HD",
    "C:\Users\kurog\OneDrive\My AI Campany\KGM Corp"
)

foreach ($path in $workspaces) {
    if (Test-Path $path) {
        Set-Location $path
        git add .
        git commit -m "auto: $(Get-Date -Format 'yyyy-MM-dd HH:mm') 自動同期"
        git push
    }
}
```

### 2. タスクスケジューラへの登録
1. 「タスクスケジューラ」を起動。
2. 「基本タスクの作成」をクリック。
3. 名前を「AI_Project_Sync」に設定。
4. トリガーを「毎日」→「1時間ごと」に設定。
5. 操作を「プログラムの開始」に設定。
6. プログラム/スクリプトに `powershell.exe` 、引数に `-ExecutionPolicy Bypass -File "C:\パス\to\git_sync.ps1"` を指定。

---

## 方案2：Git Hook による自動プッシュ

ファイルにコミットした瞬間に自動でプッシュを走らせる設定です。

### 設定方法
各リポジトリの `.git/hooks/post-commit` というファイル（拡張子なし）に以下を記述します。

```bash
#!/bin/sh
git push origin main
```

---

## マナからの提案
会長のお手間を最小限にするため、**方案1（タスクスケジューラ）**の設定を私がお手伝いしましょうか？ 
スクリプトの作成までは私がここで行い、最後の「タスクスケジューラへの登録」だけ会長の画面でポチッと設定していただくのが確実です。
