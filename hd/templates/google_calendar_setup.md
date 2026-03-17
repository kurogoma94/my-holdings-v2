# Googleカレンダー連携（毎朝自動取得システム）の構築手順

私のシステムから直接会長のGoogleアカウントにログインすることはセキュリティ上不可能なため、「**会長のGoogleカレンダー側から、毎朝自動で私の指定フォルダに予定を書き出させる（GASを使用）**」というアプローチで構築します。

この作業は少し専門的になりますが、以下の手順を順番に実行するだけで完了します。

---

## 💻 Step 1: データの保存先（Google ドライブ）の準備
Googleカレンダーのデータを受け取るためには、PC内のローカルフォルダ（`my-holdings`）と、Googleドライブを連携させる必要があります。

1. [Google ドライブ パソコン版](https://workspace.google.co.jp/intl/ja/products/drive/) をインストールし、Googleアカウントでログインします。
2. Googleドライブ（Gドライブなど）がPC上にマウント（表示）されます。
3. マウントされたドライブ内に、`AI_Schedule` という名前のフォルダを作成します。
4. （このフォルダが、後ほどローカルの `hd/schedule.md` と同期されるか、AIが直接読みに行く場所になります。）

---

## 📜 Step 2: Google Apps Script (GAS) の設定
Googleカレンダーの予定を毎晩深夜に自動取得し、テキストファイルとして出力するプログラム（スクリプト）を設定します。

1. [Google Apps Script](https://script.google.com/home) にアクセスします。
2. 左上の「新しいプロジェクト」をクリックします。
3. エディタ画面（`function myFunction() { ...`と書いてある場所）に、以下のコードをすべてコピーして貼り付け、既存のコードと置き換えます。

```javascript
// Googleドライブ内の「AI_Schedule」フォルダのIDを指定します。
// ※Step 3でIDを取得して、ここの文字と差し替えてください。
const FOLDER_ID = "ここにフォルダのIDを貼り付けます";

function exportWeeklySchedule() {
  const calendar = CalendarApp.getDefaultCalendar();
  const today = new Date();
  
  // 今日から1週間分の予定を取得
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  
  const events = calendar.getEvents(startDate, endDate);
  let scheduleText = "# 今週のスケジュール帳\n\nAI朝会レポート用データです。手書きで追記してもOKです。\n\n";

  if (events.length === 0) {
    scheduleText += "予定は登録されていません。\n";
  } else {
    // 日付ごとにイベントをまとめるための処理
    let dateMap = {};
    
    events.forEach(function(event) {
      let eventDate = event.getStartTime();
      let dateString = Utilities.formatDate(eventDate, Session.getScriptTimeZone(), "yyyy/MM/dd (E)");
      let timeString = event.isAllDayEvent() ? "終日" : Utilities.formatDate(eventDate, Session.getScriptTimeZone(), "HH:mm");
      let title = event.getTitle();
      
      if (!dateMap[dateString]) {
        dateMap[dateString] = [];
      }
      dateMap[dateString].push(`- ${timeString} ${title}`);
    });

    // テキストデータの構築
    for (let current = new Date(startDate); current < endDate; current.setDate(current.getDate() + 1)) {
        let dateKey = Utilities.formatDate(current, Session.getScriptTimeZone(), "yyyy/MM/dd (E)");
        scheduleText += `## ${dateKey}\n`;
        
        if (dateMap[dateKey]) {
            scheduleText += dateMap[dateKey].join("\n") + "\n\n";
        } else {
            scheduleText += "- 特になし\n\n";
        }
    }
  }

  // Google ドライブに schedule.md ファイルを作成（または上書き）
  const folder = DriveApp.getFolderById(FOLDER_ID);
  
  // 既存の schedule.md があれば削除（常に最新にするため）
  const files = folder.getFilesByName("schedule.md");
  while (files.hasNext()) {
    files.next().setTrashed(true);
  }
  
  // 新しいファイルを作成
  folder.createFile("schedule.md", scheduleText, MimeType.PLAIN_TEXT);
}
```

---

## 🔍 Step 3: フォルダIDの取得と反映
先ほど作成した GAS のコード（3行目）に、保存先フォルダのIDを教える必要があります。

1. Googleドライブをブラウザで開き、Step 1で作った `AI_Schedule` フォルダを開きます。
2. ブラウザ上部のURL（アドレスバー）を確認します。
   （例）`https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
3. このURLの最後にある無作為な文字列（上記の例だと `1aBcDeFgHiJkLmNoPqRsTuVwXyZ` の部分）が **フォルダID** です。これをコピーします。
4. Step 2のGASのエディタに戻り、3行目の `"ここにフォルダのIDを貼り付けます"` の部分を、コピーしたIDに書き換えます。
   （例：`const FOLDER_ID = "1aBcDeFgHiJkLmNoPqRsTuVwXyZ";`）
5. 上部の「保存（フロッピーディスクのアイコン）」をクリックします。

---

## ⏱️ Step 4: 毎晩深夜に自動実行させる設定（トリガー）
最後に、このスクリプトが人間が操作しなくても勝手に動くようにタイマーを設定します。

1. GASのエディタ左側にあるメニューから「トリガー（時計のアイコン）」をクリックします。
2. 右下の「トリガーを追加」ボタンをクリックします。
3. 以下の条件で設定して「保存」を押します。
   - 実行する関数を選択: `exportWeeklySchedule`
   - デプロイ時に実行: `Head`
   - イベントのソースを選択: `時間主導型`
   - 時間ベースのトリガーのタイプを選択: `日付ベースのタイマー`
   - 時刻を選択: `午前0時〜1時` （※ここでセットした時間に毎日自動で動きます）
4. 保存を押すと「承認が必要です」という警告が出ます。ご自身のGoogleアカウントを選択し、「詳細」→「（安全ではないページ）に移動」→「許可」をクリックして進めます。

---

## ✅ 準備完了！
これで設定はすべて完了です！

今後は、**毎日深夜0時〜1時の間**に、Googleカレンダーの今日から1週間分の予定が読み取られ、Googleドライブの `AI_Schedule` フォルダ内の `schedule.md` というファイルに自動で書き出されます。

※もし、この `schedule.md` が保存される場所（Googleドライブのフォルダパス）が確定したら、私にそのパス（例：`G:\マイドライブ\AI_Schedule\schedule.md`）を教えてください。明日の朝から私のシステムがそれを読みに行きます！
