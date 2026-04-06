import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StarField from "../components/StarField";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ODF Fortune Portal | 自らの運命を論理的に再構築せよ",
  description: "MBTI、動物占い、算命学を融合した独自ロジックによる、高精度な運命解析ポータル。自律的AI組織があなたの成功を加速させます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <StarField />
        {children}
      </body>
    </html>
  );
}
