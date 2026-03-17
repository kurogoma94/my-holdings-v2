# Gmail連携（未読メール抽出システム）の構築手順

Googleカレンダーと同様に、GAS（Google Apps Script）を使用して、Gmailの未読メールから「返信が必要そうなもの」を自動でピックアップし、Googleドライブに書き出す仕組みを構築します。

---

## 📜 Step 1: Gmail抽出用のGAS設定

1. [Google Apps Script](https://script.google.com/home) にアクセスします。
2. 先ほど作成したカレンダー連携のプロジェクトを開くか、新しくプロジェクトを作成します。
3. （新しいプロジェクトの場合）エディタに以下のコードをコピーして貼り付けてください。カレンダーのプロジェクトに追記する場合は、最後に追加してください。

```javascript
// Googleドライブ内の「AI_Schedule」フォルダのIDを指定します。
// （カレンダー連携と同じIDでOKです）
const GMAIL_FOLDER_ID = "ここにフォルダのIDを貼り付けます";

function exportUnreadEmails() {
  // 直近24時間の未読メールを取得
  const threads = GmailApp.search('is:unread older_than:0d newer_than:1d');
  let emailText = "# 未読メール確認リスト (要返信チェック)\n\nAIが返信の必要がありそうなメールを抽出しました。\n\n";

  if (threads.length === 0) {
    emailText += "新しい未読メールはありません。\n";
  } else {
    threads.forEach(function(thread) {
      const lastMessage = thread.getMessages().pop();
      const subject = lastMessage.getSubject();
      const sender = lastMessage.getFrom();
      const date = lastMessage.getDate();
      const snippet = lastMessage.getPlainBody().substring(0, 150); // 冒頭150文字
      
      // 簡単なキーワードフィルタ（必要に応じて調整可能）
      const priorityKeywords = ["検討", "依頼", "相談", "確認", "見積", "至急", "お世話"];
      let isPriority = priorityKeywords.some(keyword => subject.includes(keyword) || snippet.includes(keyword));

      if (isPriority) {
        emailText += `### 【要確認】 ${subject}\n`;
      } else {
        emailText += `### ${subject}\n`;
      }
      emailText += `- **差出人**: ${sender}\n`;
      emailText += `- **日時**: ${Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm")}\n`;
      emailText += `- **概要**: ${snippet}...\n\n`;
      emailText += "---\n\n";
    });
  }

  // Google ドライブに gmail_unread.md ファイルを作成（または上書き）
  const folder = DriveApp.getFolderById(GMAIL_FOLDER_ID);
  const files = folder.getFilesByName("gmail_unread.md");
  while (files.hasNext()) {
     files.next().setTrashed(true);
  }
  folder.createFile("gmail_unread.md", emailText, MimeType.PLAIN_TEXT);
}
```

---

## ⏱️ Step 2: トリガーの設定

カレンダー連携と同じように、この関数も定期的に自動実行されるようにします。

1. 左メニューの「トリガー（時計アイコン）」をクリック。
2. 「トリガーを追加」をクリック。
3. 以下のように設定します：
   - 実行する関数: `exportUnreadEmails`
   - イベントのソース: `時間主導型`
   - トリガーのタイプ: `時間ベースのタイマー`
   - 間隔: `1時間おき`（またはお好みのタイミング）

---

## ✅ 準備完了！

これで、**1時間おき**にGmailの未読メールがチェックされ、Googleドライブの `AI_Schedule` フォルダ内に `gmail_unread.md` というファイルが届くようになります。

私がこのファイルを読み取って、「会長、返信が必要そうなメールが〇件届いています！」と報告させていただきますね。
