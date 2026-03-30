// [目的] メイン画面 - ルーレット機能
// [概要] フィルタータブ（すべて/エリア/ジャンル）→ ルーレット回転 → 結果表示
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getActiveShops } from '@/constants/DataStore';
import {
  Shop,
  FilterMode,
  AREAS,
  GENRES,
  AreaCode,
  GenreCode,
  getAreaLabel,
  getGenreLabel,
  formatBudget,
} from '@/constants/Types';
import AdBanner from '@/components/AdBanner';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RouletteScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  // 店舗データ
  const [allShops, setAllShops] = useState(getActiveShops());

  // 画面フォーカス時にデータを再読み込み（管理ページで追加した分を反映）
  useEffect(() => {
    const interval = setInterval(() => {
      setAllShops(getActiveShops());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ルーレットの状態管理
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedArea, setSelectedArea] = useState<AreaCode | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<GenreCode | null>(null);
  const [result, setResult] = useState<Shop | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // アニメーション
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  // フィルター済みの店舗リストを取得
  const getFilteredShops = useCallback((): Shop[] => {
    let shops = [...allShops];

    if (filterMode === 'area' && selectedArea) {
      shops = shops.filter(s => s.area === selectedArea);
    } else if (filterMode === 'genre' && selectedGenre) {
      shops = shops.filter(s => s.genre === selectedGenre);
    }

    return shops;
  }, [filterMode, selectedArea, selectedGenre]);

  // ルーレットを回す
  const spinRoulette = useCallback(() => {
    const shops = getFilteredShops();
    if (shops.length === 0) return;

    setIsSpinning(true);
    setResult(null);
    resultOpacity.setValue(0);

    // ボタンの押下アニメーション
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // ルーレット回転アニメーション
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      // ランダムに1件選出
      const randomIndex = Math.floor(Math.random() * shops.length);
      const selected = shops[randomIndex];
      setResult(selected);
      setIsSpinning(false);

      // 結果のフェードイン
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  }, [getFilteredShops, spinAnim, scaleAnim, resultOpacity]);

  // 回転の補間
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'],
  });

  // 星評価の表示
  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Google Mapを開く
  const openGoogleMaps = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const filteredCount = getFilteredShops().length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
          Welcome, Sakekasu!!
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.appTitle, { color: Colors.primary }]}>🏮</Text>
          <Text style={[styles.appTitle, { color: colors.text }]}>
            大阪ディープ居酒屋
          </Text>
        </View>
        <Text style={[styles.appSubtitle, { color: Colors.accent }]}>
          ルーレット
        </Text>
      </View>

      {/* フィルタータブ */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        {(['all', 'area', 'genre'] as FilterMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.filterTab,
              filterMode === mode && styles.filterTabActive,
              filterMode === mode && { backgroundColor: Colors.primary },
            ]}
            onPress={() => {
              setFilterMode(mode);
              setResult(null);
              resultOpacity.setValue(0);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filterMode === mode ? '#fff' : colors.textSecondary },
              ]}
            >
              {mode === 'all' ? 'すべて' : mode === 'area' ? 'エリア' : 'ジャンル'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* エリア選択（エリアモード時のみ）*/}
      {filterMode === 'area' && (
        <View style={styles.selectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {AREAS.map((area) => (
              <TouchableOpacity
                key={area.code}
                style={[
                  styles.selectionChip,
                  { borderColor: colors.border },
                  selectedArea === area.code && {
                    backgroundColor: Colors.accent,
                    borderColor: Colors.accent,
                  },
                ]}
                onPress={() => {
                  setSelectedArea(area.code);
                  setResult(null);
                  resultOpacity.setValue(0);
                }}
              >
                <Text
                  style={[
                    styles.selectionChipText,
                    {
                      color:
                        selectedArea === area.code
                          ? '#fff'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ジャンル選択（ジャンルモード時のみ）*/}
      {filterMode === 'genre' && (
        <View style={styles.selectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre.code}
                style={[
                  styles.selectionChip,
                  { borderColor: colors.border },
                  selectedGenre === genre.code && {
                    backgroundColor: Colors.accent,
                    borderColor: Colors.accent,
                  },
                ]}
                onPress={() => {
                  setSelectedGenre(genre.code);
                  setResult(null);
                  resultOpacity.setValue(0);
                }}
              >
                <Text
                  style={[
                    styles.selectionChipText,
                    {
                      color:
                        selectedGenre === genre.code
                          ? '#fff'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {genre.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 対象件数 */}
      <Text style={[styles.shopCount, { color: colors.textSecondary }]}>
        対象: {filteredCount}件
      </Text>

      {/* ルーレットホイール */}
      <View style={styles.rouletteContainer}>
        <Animated.View
          style={[
            styles.rouletteWheel,
            {
              backgroundColor: colors.card,
              borderColor: Colors.primary,
              transform: [{ rotate: isSpinning ? spin : '0deg' }],
            },
          ]}
        >
          <Text style={styles.rouletteEmoji}>🍺</Text>
          <Text style={[styles.rouletteText, { color: colors.text }]}>
            {isSpinning ? '回転中...' : 'タップして回す！'}
          </Text>
        </Animated.View>
      </View>

      {/* 回すボタン */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.spinButton,
            {
              backgroundColor: Colors.primary,
              opacity: filteredCount === 0 || isSpinning ? 0.5 : 1,
            },
          ]}
          onPress={spinRoulette}
          disabled={filteredCount === 0 || isSpinning}
          activeOpacity={0.8}
        >
          <Text style={styles.spinButtonText}>
            {isSpinning ? '🎰 回転中...' : '🎲 回す！'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 結果表示 */}
      {result && (
        <Animated.View
          style={[
            styles.resultContainer,
            {
              backgroundColor: colors.card,
              borderColor: Colors.accent,
              opacity: resultOpacity,
            },
          ]}
        >
          <Text style={[styles.resultTitle, { color: Colors.accent }]}>
            🎉 今日のお店はここ！
          </Text>

          {/* 店舗写真プレースホルダー */}
          <View style={[styles.photoPlaceholder, { backgroundColor: colors.surface }]}>
            <Text style={styles.photoEmoji}>🏮</Text>
          </View>

          <Text style={[styles.shopName, { color: colors.text }]}>
            {result.name}
          </Text>

          <View style={styles.shopDetails}>
            <Text style={[styles.shopDetailText, { color: colors.textSecondary }]}>
              📍 {getAreaLabel(result.area)}
            </Text>
            <Text style={[styles.shopDetailText, { color: colors.textSecondary }]}>
              🍶 {getGenreLabel(result.genre)}
            </Text>
            <Text style={[styles.shopDetailText, { color: colors.textSecondary }]}>
              💰 {formatBudget(result.budgetMin, result.budgetMax)}
            </Text>
            <Text style={[styles.shopStars, { color: Colors.accent }]}>
              {renderStars(result.rating)}
            </Text>
          </View>

          <Text style={[styles.shopComment, { color: colors.text }]}>
            「{result.comment}」
          </Text>

          {/* アクションボタン */}
          <View style={styles.actionButtons}>
            {result.googleMapsUrl && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4285F4' }]}
                onPress={() => openGoogleMaps(result.googleMapsUrl)}
              >
                <Text style={styles.actionButtonText}>📍 Google Mapで見る</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primaryDark }]}
              onPress={spinRoulette}
            >
              <Text style={styles.actionButtonText}>🔄 もう一回回す</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* 広告エリア */}
      <AdBanner />

      {/* 下部スペース（iPhoneツールバー被り対策 + safe-area-inset-bottom補完） */}
      <View style={{ height: 140 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectionContainer: {
    marginBottom: 12,
  },
  selectionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  selectionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  shopCount: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 16,
  },
  rouletteContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rouletteWheel: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rouletteEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  rouletteText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spinButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  resultContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  photoPlaceholder: {
    height: 160,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photoEmoji: {
    fontSize: 64,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  shopDetails: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  shopDetailText: {
    fontSize: 15,
  },
  shopStars: {
    fontSize: 18,
    marginTop: 4,
  },
  shopComment: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
