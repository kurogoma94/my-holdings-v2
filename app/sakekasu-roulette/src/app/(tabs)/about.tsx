import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import AdBanner from '@/components/AdBanner';

export default function AboutScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  // Helper for rendering section titles
  const SectionTitle = ({ title, emoji }: { title: string; emoji: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <Text style={[styles.sectionTitle, { color: Colors.primary }]}>{title}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>酒カスルーレットについて</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>About & Terms</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionTitle title="酒カスルーレットとは？" emoji="🍻" />
        <Text style={[styles.paragraph, { color: colors.text }]}>
          「酒カスルーレット」は、大阪が誇るディープで魅力的な居酒屋や名店を、楽しく直感的に見つけるためのランダム抽選Webサービスです。
          毎日の飲み歩きや、ふらっと立ち寄る2軒目選び、はたまたランチでの新しい開拓まで、お店選びに迷ったときの強い味方になります。
          当サイトのデータベースには、実際に足を運びたくなるような立ち飲み屋から、予約必須の高級ビストロ、路地裏に佇む隠れた名店まで、幅広いジャンルの店舗が500件以上収録されています。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionTitle title="対象エリアの魅力" emoji="📍" />
        <Text style={[styles.paragraph, { color: colors.text }]}>
          本サービスで収録している主なエリアは、大阪を代表するディープな飲み屋街です。
          {'\n\n'}
          ・梅田・北新地・中崎町：洗練されたバルや、地下に広がる安くて美味い大衆酒場が混在する中心地。{'\n'}
          ・天満・天神橋筋：ハシゴ酒の聖地。ビニールシートに囲まれた安ウマな立ち飲み屋が軒を連ねます。{'\n'}
          ・難波・道頓堀・千日前：粉もんカルチャーから老舗の食堂まで、大阪のソウルフードが集結するエリア。{'\n'}
          ・京橋：労働者の憩いの場であり、朝から飲めるディープすぎる名店が密集する街。{'\n'}
          ・福島：近年グルメ激戦区として知られ、予約困難な名店やおしゃれなイタリアンが点在しています。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionTitle title="基本の使い方" emoji="📱" />
        <Text style={[styles.paragraph, { color: colors.text }]}>
          使い方は非常にシンプルです。{'\n\n'}
          1. 「ルーレット」タブを開きます。{'\n'}
          2. エリアやジャンル、さらに時間帯（ランチ・ディナー）などのフィルターから、今の気分に合わせた条件を指定します。{'\n'}
          3. 「回す！」ボタンをタップすると、ルーレットが回転し、今日行くべき運命のお店が一つだけ選ばれます！{'\n'}
          4. 結果画面には、予算感や独自の「おすすめ度」、さらにGoogle Mapsへのリンクが用意されているため、そのままお店へ向かうことができます。{'\n'}
          {'\n'}
          また、「店舗リスト」タブを活用すれば、収録されている店舗をフリーワード検索やリスト形式で眺めることも可能です。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionTitle title="プライバシーポリシー" emoji="📜" />
        <Text style={[styles.paragraph, { color: colors.text }]}>
          【広告の配信について】{'\n'}
          当サイトは第三者配信の広告サービス（Google AdSense）を利用しています。
          広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。
          Cookieを利用することで、過去のアクセス情報に基づいた適切な広告（パーソナライズ広告）を配信することが可能となります。
          {'\n\n'}
          ユーザーは、Googleアカウントの広告設定ページでパーソナライズ広告を無効にすることができます。
          また、www.aboutads.infoのページにアクセスしていただき、パーソナライズ広告に使われる第三者配信事業者のCookieを無効にすることも可能です。
          {'\n\n'}
          【アクセス解析ツールについて】{'\n'}
          当サイトでは、サイトの利用状況を把握するためにGoogle Analytics等のアクセス解析ツールを利用する場合があります。
          これらはトラフィックデータの収集のためにCookieを使用していますが、データは匿名で収集されており、個人を特定するものではありません。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionTitle title="免責事項・利用規約" emoji="⚖️" />
        <Text style={[styles.paragraph, { color: colors.text }]}>
          当サイトで提供している店舗情報（営業時間、住所、メニュー内容、予算等）は、データ収集時点のインターネット上の情報および独自の調査に基づき掲載されています。
          そのため、最新の正確性を常に保証するものではありません。店舗へ足を運ばれる際は、必ず公式のSNSや公式サイト、予約サイト等で最新情報をご確認ください。
          {'\n\n'}
          当サイトの利用により生じたいかなるトラブルや損失、損害に関しましても、運営チームは一切の責任を負いかねますので、あらかじめご了承ください。
          また、本サービスの内容は予告なしに変更・停止される場合があります。
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionTitle title="運営者情報について" emoji="✉️" />
        <Text style={[styles.paragraph, { color: colors.text }]}>
          運営者：酒カスルーレット運営チーム{'\n'}
          当サイトに関するお問い合わせ、掲載情報の修正依頼、削除のご要望等がございましたら、公式SNSアカウント（@〜）へのダイレクトメッセージ、またはサイト内のお問い合わせフォーム（準備中）よりご連絡ください。
        </Text>
      </View>

      {/* 広告エリア（記事読み終わりに設置するとクリック/インプレッション効果が高いため） */}
      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <AdBanner />
      </View>
      
      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        © 2026 酒カスルーレット. All rights reserved.
      </Text>
      
      {/* ツールバー被り対策 */}
      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerTitleContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 26,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
});
