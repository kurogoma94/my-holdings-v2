// [目的] 管理ページ - 店舗の追加・編集・削除 + Google Maps API連携
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/constants/Colors';
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
import {
  getAllShops,
  addShop,
  updateShop,
  permanentDeleteShop,
  verifyAdminPassword,
  getGoogleApiKey,
  setGoogleApiKey,
  importShops,
} from '@/constants/DataStore';
import { searchPlace, PlaceSearchResult } from '@/constants/PlacesService';

// Web用のalert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const showConfirm = (title: string, message: string, onOk: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onOk();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'キャンセル', style: 'cancel' },
      { text: 'OK', onPress: onOk },
    ]);
  }
};

export default function AdminScreen() {
  const colors = Colors.light; // 管理画面はライトモード固定

  // 認証状態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // 画面モード
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'settings'>('list');
  const [shops, setShops] = useState<Shop[]>([]);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  // フォーム状態
  const [formName, setFormName] = useState('');
  const [formArea, setFormArea] = useState<AreaCode>('tenma');
  const [formGenre, setFormGenre] = useState<GenreCode>('izakaya');
  const [formBudgetMin, setFormBudgetMin] = useState('');
  const [formBudgetMax, setFormBudgetMax] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formRating, setFormRating] = useState(4);
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formGoogleMapsUrl, setFormGoogleMapsUrl] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPlaceId, setFormPlaceId] = useState('');
  const [formGoogleRating, setFormGoogleRating] = useState('');

  // API検索
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 設定
  const [apiKey, setApiKeyState] = useState('');

  // データ読み込み
  const loadShops = useCallback(() => {
    setShops(getAllShops());
  }, []);

  useEffect(() => {
    loadShops();
    setApiKeyState(getGoogleApiKey());
  }, [loadShops]);

  // パスワード認証
  const handleLogin = () => {
    if (verifyAdminPassword(password)) {
      setIsAuthenticated(true);
    } else {
      showAlert('認証エラー', 'パスワードが正しくありません');
    }
  };

  // フォームリセット
  const resetForm = () => {
    setFormName('');
    setFormArea('tenma');
    setFormGenre('izakaya');
    setFormBudgetMin('');
    setFormBudgetMax('');
    setFormComment('');
    setFormRating(4);
    setFormPhotoUrl('');
    setFormGoogleMapsUrl('');
    setFormAddress('');
    setFormPhone('');
    setFormPlaceId('');
    setFormGoogleRating('');
    setSearchResults([]);
    setEditingShop(null);
  };

  // 編集モードに入る
  const startEdit = (shop: Shop) => {
    setEditingShop(shop);
    setFormName(shop.name);
    setFormArea(shop.area);
    setFormGenre(shop.genre);
    setFormBudgetMin(shop.budgetMin.toString());
    setFormBudgetMax(shop.budgetMax?.toString() || '');
    setFormComment(shop.comment);
    setFormRating(shop.rating);
    setFormPhotoUrl(shop.photoUrl || '');
    setFormGoogleMapsUrl(shop.googleMapsUrl || '');
    setFormAddress(shop.address || '');
    setFormPhone(shop.phone || '');
    setFormPlaceId(shop.placeId || '');
    setFormGoogleRating(shop.googleRating?.toString() || '');
    setMode('edit');
  };

  // Google Places API で検索
  const handleGoogleSearch = async () => {
    if (!formName) {
      showAlert('入力エラー', '店名を入力してください');
      return;
    }

    const key = getGoogleApiKey();
    if (!key) {
      showAlert('APIキー未設定', '設定画面からGoogle APIキーを入力してください');
      return;
    }

    setIsSearching(true);
    try {
      const areaLabel = AREAS.find(a => a.code === formArea)?.label || '';
      const results = await searchPlace(formName, areaLabel);
      setSearchResults(results);
      if (results.length === 0) {
        showAlert('検索結果', '該当する店舗が見つかりませんでした');
      }
    } catch (error: any) {
      showAlert('検索エラー', error.message || 'APIの呼び出しに失敗しました');
    }
    setIsSearching(false);
  };

  // 検索結果を選択してフォームに反映
  const selectSearchResult = (result: PlaceSearchResult) => {
    setFormGoogleMapsUrl(result.googleMapsUrl);
    setFormAddress(result.address);
    setFormPhone(result.phone || '');
    setFormPlaceId(result.placeId);
    setFormGoogleRating(result.rating?.toString() || '');
    if (result.photoUrl) setFormPhotoUrl(result.photoUrl);
    setSearchResults([]);
    showAlert('反映完了 ✅', `「${result.name}」の情報をフォームに反映しました！`);
  };

  // 店舗を保存
  const handleSave = () => {
    if (!formName || !formBudgetMin || !formComment) {
      showAlert('入力エラー', '店名・予算（下限）・コメントは必須です');
      return;
    }

    const shopData = {
      name: formName,
      area: formArea,
      genre: formGenre,
      budgetMin: parseInt(formBudgetMin),
      budgetMax: formBudgetMax ? parseInt(formBudgetMax) : undefined,
      comment: formComment,
      rating: formRating,
      photoUrl: formPhotoUrl || undefined,
      googleMapsUrl: formGoogleMapsUrl || undefined,
      address: formAddress || undefined,
      phone: formPhone || undefined,
      placeId: formPlaceId || undefined,
      googleRating: formGoogleRating ? parseFloat(formGoogleRating) : undefined,
      isActive: true,
    };

    if (mode === 'edit' && editingShop) {
      updateShop(editingShop.id, shopData);
      showAlert('更新完了 ✅', `「${formName}」を更新しました`);
    } else {
      addShop(shopData);
      showAlert('追加完了 ✅', `「${formName}」を追加しました`);
    }

    resetForm();
    loadShops();
    setMode('list');
  };

  // 店舗を削除
  const handleDelete = (shop: Shop) => {
    showConfirm('削除確認', `「${shop.name}」を削除しますか？`, () => {
      permanentDeleteShop(shop.id);
      loadShops();
      showAlert('削除完了', `「${shop.name}」を削除しました`);
    });
  };

  // APIキー保存
  const handleSaveApiKey = () => {
    setMode('list');
  };

  // CSVインポート処理
  const handleCSVImport = () => {
    if (Platform.OS !== 'web') {
      showAlert('エラー', 'CSVインポートはWebブラウザ環境のみ対応しています');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const text = event.target.result;
        const result = importShops(text);
        
        loadShops(); // 一覧を再読み込み

        let message = `${result.success}件のインポートに成功しました！`;
        if (result.failed > 0) {
          message += `\n\n⚠️ ${result.failed}件が失敗しました。以下のエラーを確認してください：\n` + result.errors.join('\n');
        }
        showAlert('インポート結果', message);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // =============== ログイン画面 ===============
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={styles.loginIcon}>🔐</Text>
        <Text style={[styles.loginTitle, { color: colors.text }]}>管理ページ</Text>
        <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>
          パスワードを入力してください
        </Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="パスワード"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />
        <Text style={[styles.loginHint, { color: colors.textSecondary }]}>
          初期パスワード: osaka2026
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
          onPress={handleLogin}
        >
          <Text style={styles.primaryButtonText}>ログイン</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =============== 設定画面 ===============
  if (mode === 'settings') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => setMode('list')}>
            <Text style={[styles.backButton, { color: Colors.primary }]}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>⚙️ 設定</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Google Maps APIキー</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            店名で検索して自動で情報を取得するのに必要です。{'\n'}
            Google Cloud Console → APIとサービス → 認証情報 から取得できます。
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="AIzaSy..."
            placeholderTextColor={colors.textSecondary}
            value={apiKey}
            onChangeText={setApiKeyState}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.primary }]}
            onPress={handleSaveApiKey}
          >
            <Text style={styles.primaryButtonText}>💾 保存</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // =============== 追加・編集フォーム ===============
  if (mode === 'add' || mode === 'edit') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => { resetForm(); setMode('list'); }}>
            <Text style={[styles.backButton, { color: Colors.primary }]}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            {mode === 'add' ? '🏮 お店を追加' : '✏️ お店を編集'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* 店名 */}
          <Text style={[styles.label, { color: colors.text }]}>店名 *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="例: あずき色のマーカス"
            placeholderTextColor={colors.textSecondary}
            value={formName}
            onChangeText={setFormName}
          />

          {/* エリア */}
          <Text style={[styles.label, { color: colors.text }]}>エリア *</Text>
          <View style={styles.chipContainer}>
            {AREAS.map(area => (
              <TouchableOpacity
                key={area.code}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  formArea === area.code && { backgroundColor: Colors.accent, borderColor: Colors.accent },
                ]}
                onPress={() => setFormArea(area.code)}
              >
                <Text style={[
                  styles.chipText,
                  { color: formArea === area.code ? '#fff' : colors.textSecondary },
                ]}>
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Google検索ボタン */}
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: '#4285F4' }]}
            onPress={handleGoogleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>🔍 Google Mapから情報を取得</Text>
            )}
          </TouchableOpacity>

          {/* 検索結果 */}
          {searchResults.length > 0 && (
            <View style={[styles.searchResults, { borderColor: colors.border }]}>
              <Text style={[styles.searchResultsTitle, { color: Colors.primary }]}>
                検索結果（タップして選択）
              </Text>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.searchResultItem, { borderColor: colors.border }]}
                  onPress={() => selectSearchResult(result)}
                >
                  <Text style={[styles.searchResultName, { color: colors.text }]}>
                    📍 {result.name}
                  </Text>
                  <Text style={[styles.searchResultAddress, { color: colors.textSecondary }]}>
                    {result.address}
                  </Text>
                  {result.rating && (
                    <Text style={[styles.searchResultRating, { color: Colors.accent }]}>
                      Google評価: ★{result.rating}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ジャンル */}
          <Text style={[styles.label, { color: colors.text }]}>ジャンル *</Text>
          <View style={styles.chipContainer}>
            {GENRES.map(genre => (
              <TouchableOpacity
                key={genre.code}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  formGenre === genre.code && { backgroundColor: Colors.accent, borderColor: Colors.accent },
                ]}
                onPress={() => setFormGenre(genre.code)}
              >
                <Text style={[
                  styles.chipText,
                  { color: formGenre === genre.code ? '#fff' : colors.textSecondary },
                ]}>
                  {genre.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 予算 */}
          <Text style={[styles.label, { color: colors.text }]}>予算 *</Text>
          <View style={styles.budgetRow}>
            <TextInput
              style={[styles.input, styles.budgetInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="下限 (例: 2000)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={formBudgetMin}
              onChangeText={setFormBudgetMin}
            />
            <Text style={[styles.budgetSeparator, { color: colors.textSecondary }]}>〜</Text>
            <TextInput
              style={[styles.input, styles.budgetInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="上限 (例: 3000)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={formBudgetMax}
              onChangeText={setFormBudgetMax}
            />
          </View>

          {/* おすすめ度 */}
          <Text style={[styles.label, { color: colors.text }]}>おすすめ度 *</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setFormRating(star)}>
                <Text style={[styles.ratingStar, { color: star <= formRating ? Colors.accent : colors.border }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* コメント */}
          <Text style={[styles.label, { color: colors.text }]}>一言コメント *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="例: 天満で迷ったらここ！"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            value={formComment}
            onChangeText={setFormComment}
          />

          {/* 自動取得された情報（表示のみ） */}
          {(formAddress || formPhone || formGoogleRating) ? (
            <View style={[styles.autoFetchedInfo, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.autoFetchedTitle, { color: '#2E7D32' }]}>
                ✅ Google Mapから取得済み
              </Text>
              {formAddress ? <Text style={styles.autoFetchedText}>📍 {formAddress}</Text> : null}
              {formPhone ? <Text style={styles.autoFetchedText}>📞 {formPhone}</Text> : null}
              {formGoogleRating ? <Text style={styles.autoFetchedText}>⭐ Google評価: {formGoogleRating}</Text> : null}
              {formGoogleMapsUrl ? <Text style={styles.autoFetchedText}>🗺️ Mapリンク設定済み</Text> : null}
            </View>
          ) : null}

          {/* 保存ボタン */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.primary, marginTop: 20 }]}
            onPress={handleSave}
          >
            <Text style={styles.primaryButtonText}>
              {mode === 'add' ? '🏮 追加する' : '💾 更新する'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // =============== 店舗リスト（メイン画面）===============
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerBar}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>🏮 店舗管理</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: Colors.primary }]}
            onPress={handleCSVImport}
          >
            <Text style={styles.smallButtonText}>📥 CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: '#666' }]}
            onPress={() => setMode('settings')}
          >
            <Text style={styles.smallButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 追加ボタン */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: Colors.primary }]}
        onPress={() => { resetForm(); setMode('add'); }}
      >
        <Text style={styles.addButtonText}>＋ お店を追加する</Text>
      </TouchableOpacity>

      {/* 店舗数 */}
      <Text style={[styles.shopCountText, { color: colors.textSecondary }]}>
        {`登録店舗: ${shops.filter(s => s.isActive).length}件`}
        {shops.filter(s => !s.isActive).length > 0 ? ` (非表示: ${shops.filter(s => !s.isActive).length}件)` : ''}
      </Text>

      {/* 店舗一覧 */}
      {shops.map(shop => (
        <View
          key={shop.id}
          style={[
            styles.adminShopCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            !shop.isActive && { opacity: 0.5 },
          ]}
        >
          <View style={styles.adminShopInfo}>
            <Text style={[styles.adminShopName, { color: colors.text }]}>
              {shop.name}
            </Text>
            <Text style={[styles.adminShopMeta, { color: colors.textSecondary }]}>
              📍 {getAreaLabel(shop.area)} / 🍶 {getGenreLabel(shop.genre)} / 💰 {formatBudget(shop.budgetMin, shop.budgetMax)}
            </Text>
            <Text style={[styles.adminShopComment, { color: colors.textSecondary }]} numberOfLines={1}>
              「{shop.comment}」
            </Text>
          </View>
          <View style={styles.adminShopActions}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: Colors.accent }]}
              onPress={() => startEdit(shop)}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: '#FF4444' }]}
              onPress={() => handleDelete(shop)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 60 },
  centerContent: { alignItems: 'center', justifyContent: 'center' },

  // ログイン
  loginIcon: { fontSize: 48, marginBottom: 16 },
  loginTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  loginSubtitle: { fontSize: 14, marginBottom: 20 },
  loginHint: { fontSize: 12, marginTop: 8, marginBottom: 16 },

  // ヘッダー
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: 8 },
  backButton: { fontSize: 16, fontWeight: '600' },

  // ボタン
  primaryButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  addButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  smallButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  smallButtonText: { fontSize: 18 },
  searchButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginVertical: 12 },
  searchButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // フォーム
  label: { fontSize: 15, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetInput: { flex: 1 },
  budgetSeparator: { fontSize: 18 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingStar: { fontSize: 32 },

  // カード
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardDescription: { fontSize: 13, lineHeight: 20, marginBottom: 12 },

  // 検索結果
  searchResults: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 4 },
  searchResultsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  searchResultItem: { borderBottomWidth: 1, paddingVertical: 10 },
  searchResultName: { fontSize: 15, fontWeight: '600' },
  searchResultAddress: { fontSize: 13, marginTop: 2 },
  searchResultRating: { fontSize: 13, marginTop: 2, fontWeight: '600' },

  // 自動取得情報
  autoFetchedInfo: { borderRadius: 10, padding: 12, marginTop: 16 },
  autoFetchedTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  autoFetchedText: { fontSize: 13, marginBottom: 2 },

  // 管理カード
  adminShopCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8, alignItems: 'center' },
  adminShopInfo: { flex: 1 },
  adminShopName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  adminShopMeta: { fontSize: 12, marginBottom: 2 },
  adminShopComment: { fontSize: 12, fontStyle: 'italic' },
  adminShopActions: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  editButton: { borderRadius: 8, padding: 8 },
  editButtonText: { fontSize: 18 },
  deleteButton: { borderRadius: 8, padding: 8 },
  deleteButtonText: { fontSize: 18 },

  shopCountText: { fontSize: 13, marginBottom: 12 },
});
