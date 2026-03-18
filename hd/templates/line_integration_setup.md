# LINE → TODO 連携システム（GAS版）構築手順

LINEからメッセージを送るだけで、プロジェクトの `TODO.md` に自動追記したり、進捗を確認したりできるボットの構築手順です。

## 💻 Step 1: LINE Developers の準備

1. [LINE Developers](https://developers.line.biz/) にログインします。
2. 「Messaging API」チャネルを新規作成します。
3. 「Messaging API設定」タブから **チャネルアクセストークン（長期）** を発行し、コピーしておきます。

## 📜 Step 2: Google Apps Script (GAS) の作成

1. [Google Apps Script](https://script.google.com/home) で新しいプロジェクトを作成します。
2. 以下のコードを貼り付け、`LINE_ACCESS_TOKEN` を先ほどコピーしたものに書き換えます。

```javascript
const LINE_ACCESS_TOKEN = "ここにチャネルアクセストークンを貼り付け";

function doPost(e) {
  const json = JSON.parse(e.postData.contents);
  const replyToken = json.events[0].replyToken;
  const userMessage = json.events[0].message.text;

  let responseMessage = "";

  if (userMessage === "確認") {
    responseMessage = "現在のTODOを確認します。少々お待ちください...";
    // ここにTODO.mdを読み取るGoogleドライブ連携ロジックを追加予定
  } else if (userMessage.startsWith("追加 ")) {
    const task = userMessage.replace("追加 ", "");
    responseMessage = `TODOに「${task}」を追加しました。`;
    // ここにTODO.mdへの追記ロジックを追加予定
  } else {
    responseMessage = "「確認」でTODOの表示、「追加 [タスク内容]」でTODOの登録ができます。";
  }

  const url = "https://api.line.me/v2/bot/message/reply";
  UrlFetchApp.fetch(url, {
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + LINE_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "replyToken": replyToken,
      "messages": [{ "type": "text", "text": responseMessage }],
    }),
  });
}
```

3. 「デプロイ」>「新しいデプロイ」を選択。
4. 種類を「ウェブアプリ」にし、アクセスできるユーザーを「全員」にしてデプロイします。
5. 発行された **ウェブアプリURL** をコピーします。

## 🔗 Step 3: Webhook の設定

1. LINE Developers の「Messaging API設定」に戻ります。
2. 「Webhook URL」に、GASで発行されたURLを貼り付けます。
3. 「Webhookの利用」をオンにします。

これで、LINEボットに「追加 商品のリサーチ」と送ると、将来的に TODO.md へ自動反映される基盤が整います。
