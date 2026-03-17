// [目的] アプリ全体のカラーパレット定義
// [コンセプト] 居酒屋の暖かい雰囲気 × ディープな大阪感

// メインカラー: 赤提灯をイメージした暖色系
const primary = '#E84855';       // 赤提灯レッド
const primaryDark = '#C73240';
const primaryLight = '#FF6B6B';

// アクセント: 日本酒のゴールド
const accent = '#F2A541';
const accentDark = '#D4922F';
const accentLight = '#FFD166';

// 背景: ダークモードベースで居酒屋の薄暗さを表現
const darkBg = '#1A1A2E';
const darkSurface = '#232342';
const darkCard = '#2D2D4A';

export default {
  primary,
  primaryDark,
  primaryLight,
  accent,
  accentDark,
  accentLight,
  light: {
    text: '#1A1A2E',
    textSecondary: '#6B6B8D',
    background: '#F8F7F4',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    tint: primary,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primary,
    border: '#E5E5E5',
  },
  dark: {
    text: '#F8F7F4',
    textSecondary: '#A0A0B8',
    background: darkBg,
    surface: darkSurface,
    card: darkCard,
    tint: primaryLight,
    tabIconDefault: '#6B6B8D',
    tabIconSelected: primaryLight,
    border: '#3D3D5C',
  },
};
