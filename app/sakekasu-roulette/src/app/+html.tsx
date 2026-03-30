import { ScrollViewStyleReset } from 'expo-router/html';

// [目的] Web版のHTMLテンプレート - OGP（SNSシェア用）とレスポンシブ対応
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <title>大阪ディープ居酒屋ルーレット | 今日の一軒をルーレットで決めよう</title>
        <meta name="description" content="大阪の厳選居酒屋をルーレットでランダムに紹介！天満・難波・新世界など、実際に足を運んだディープなお店だけを収録。一人飲みの新しいお店探しに。" />
        <meta property="og:title" content="大阪ディープ居酒屋ルーレット 🏮" />
        <meta property="og:description" content="今日の一軒をルーレットで決めよう！大阪のディープな居酒屋を厳選収録。" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/ogp.png" />
        <meta property="og:locale" content="ja_JP" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="大阪ディープ居酒屋ルーレット 🏮" />
        <meta name="twitter:description" content="今日の一軒をルーレットで決めよう！" />
        <meta name="theme-color" content="#1A1A2E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Google AdSense - Web広告用（環境変数が存在する場合のみ読み込み） */}
        {/* ※審査（所有権確認）を通すため、所有権確認用metaタグのみ必ず出力する */}
        <meta name="google-adsense-account" content="ca-pub-8899707832109693" />
        {process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyles = `
/* ベース背景色（ダークモードのちらつき防止） */
body {
  background-color: #F8F7F4;
  font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom);
  -webkit-font-smoothing: antialiased;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1A1A2E;
  }
}

/* レスポンシブ - PCの横幅を制限してスマホ風に中央寄せ */
#root {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  box-shadow: 0 0 40px rgba(0,0,0,0.08);
}
@media (prefers-color-scheme: dark) {
  #root {
    box-shadow: 0 0 40px rgba(0,0,0,0.3);
  }
}

/* PC閲覧時の背景 */
@media (min-width: 481px) {
  body {
    background-color: #EEEAE5;
  }
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #0F0F1A;
    }
  }
}

/* スクロールバーの非表示（モバイルっぽく） */
::-webkit-scrollbar {
  display: none;
}
* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;
