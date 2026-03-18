// [目的] 店舗リスト画面 - 全店舗の一覧表示・検索・絞り込み
import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getActiveShops } from '@/constants/DataStore';
import {
  Shop,
  AREAS,
  GENRES,
  AreaCode,
  GenreCode,
  getAreaLabel,
  getGenreLabel,
  formatBudget,
} from '@/constants/Types';

export default function ShopsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState<AreaCode | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<GenreCode | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // 店舗データ（管理ページで追加した分も反映）
  const [allShops, setAllShops] = useState(getActiveShops());
  useEffect(() => {
    const interval = setInterval(() => {
      setAllShops(getActiveShops());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // フィルター適用
  const filteredShops = useMemo(() => {
    let shops = [...allShops];

    if (searchText) {
      const q = searchText.toLowerCase();
      shops = shops.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.comment.toLowerCase().includes(q)
      );
    }

    if (selectedArea) {
      shops = shops.filter(s => s.area === selectedArea);
    }

    if (selectedGenre) {
      shops = shops.filter(s => s.genre === selectedGenre);
    }

    return shops;
  }, [searchText, selectedArea, selectedGenre]);

  // 星評価の表示
  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // 店舗カード
  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={[styles.shopCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => setSelectedShop(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardPhoto, { backgroundColor: colors.surface }]}>
        <Text style={styles.cardPhotoEmoji}>🏮</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
          📍 {getAreaLabel(item.area)}　🍶 {getGenreLabel(item.genre)}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={[styles.cardBudget, { color: colors.text }]}>
            💰 {formatBudget(item.budgetMin, item.budgetMax)}
          </Text>
          <Text style={[styles.cardStars, { color: Colors.accent }]}>
            {renderStars(item.rating)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ヘッダー */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📋 店舗リスト</Text>

        {/* 検索バー */}
        <TextInput
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="店名・キーワードで検索..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* フィルター: エリア */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              !selectedArea && {
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
              },
            ]}
            onPress={() => setSelectedArea(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: !selectedArea ? '#fff' : colors.textSecondary },
              ]}
            >
              全エリア
            </Text>
          </TouchableOpacity>
          {AREAS.map((area) => (
            <TouchableOpacity
              key={area.code}
              style={[
                styles.filterChip,
                { borderColor: colors.border },
                selectedArea === area.code && {
                  backgroundColor: Colors.accent,
                  borderColor: Colors.accent,
                },
              ]}
              onPress={() =>
                setSelectedArea(selectedArea === area.code ? null : area.code)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
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

        {/* フィルター: ジャンル */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              !selectedGenre && {
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
              },
            ]}
            onPress={() => setSelectedGenre(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: !selectedGenre ? '#fff' : colors.textSecondary },
              ]}
            >
              全ジャンル
            </Text>
          </TouchableOpacity>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre.code}
              style={[
                styles.filterChip,
                { borderColor: colors.border },
                selectedGenre === genre.code && {
                  backgroundColor: Colors.accent,
                  borderColor: Colors.accent,
                },
              ]}
              onPress={() =>
                setSelectedGenre(selectedGenre === genre.code ? null : genre.code)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
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

        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filteredShops.length}件
        </Text>
      </View>

      {/* 店舗リスト */}
      <FlatList
        data={filteredShops}
        keyExtractor={(item) => item.id}
        renderItem={renderShopCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍶</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              条件に合うお店がありません
            </Text>
          </View>
        }
      />

      {/* 店舗詳細モーダル */}
      <Modal
        visible={!!selectedShop}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedShop(null)}
      >
        {selectedShop && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 閉じるボタン */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedShop(null)}
                >
                  <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>
                    ✕ 閉じる
                  </Text>
                </TouchableOpacity>

                {/* 写真プレースホルダー */}
                <View style={[styles.detailPhoto, { backgroundColor: colors.surface }]}>
                  <Text style={styles.detailPhotoEmoji}>🏮</Text>
                </View>

                {/* 店舗名 */}
                <Text style={[styles.detailName, { color: colors.text }]}>
                  {selectedShop.name}
                </Text>

                {/* 詳細情報 */}
                <View style={[styles.detailInfoBox, { backgroundColor: colors.surface }]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      📍 エリア
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {getAreaLabel(selectedShop.area)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      🍶 ジャンル
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {getGenreLabel(selectedShop.genre)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      💰 予算
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatBudget(selectedShop.budgetMin, selectedShop.budgetMax)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      ⭐ おすすめ度
                    </Text>
                    <Text style={[styles.detailStars, { color: Colors.accent }]}>
                      {renderStars(selectedShop.rating)}
                    </Text>
                  </View>
                </View>

                {/* コメント */}
                <View style={[styles.commentBox, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.commentLabel, { color: Colors.accent }]}>
                    📝 Takahiroのコメント
                  </Text>
                  <Text style={[styles.commentText, { color: colors.text }]}>
                    「{selectedShop.comment}」
                  </Text>
                </View>

                {/* アクションボタン */}
                {selectedShop.googleMapsUrl && (
                  <TouchableOpacity
                    style={[styles.mapButton, { backgroundColor: '#4285F4' }]}
                    onPress={() => {
                      if (selectedShop.googleMapsUrl) {
                        Linking.openURL(selectedShop.googleMapsUrl);
                      }
                    }}
                  >
                    <Text style={styles.mapButtonText}>📍 Google Mapで開く</Text>
                  </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  searchBar: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 140,
  },
  shopCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPhoto: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPhotoEmoji: {
    fontSize: 36,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    marginBottom: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBudget: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardStars: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  // モーダル
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailPhoto: {
    height: 200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailPhotoEmoji: {
    fontSize: 80,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailInfoBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailStars: {
    fontSize: 16,
  },
  commentBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  mapButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
