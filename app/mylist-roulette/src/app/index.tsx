import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useSyncEngine } from '../hooks/useSyncEngine';
import { RouletteWheel } from '../components/RouletteWheel';
import { WinnerOverlay } from '../components/WinnerOverlay';
import { getAllShops } from '../constants/DataStore';
import { Shop } from '../constants/Types';

export default function HomeScreen() {
  const colors = Colors.dark;
  const { isSyncing, syncResult, syncData } = useSyncEngine();
  
  // Roulette States
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Shop | null>(null);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(0);

  const shops = getAllShops();

  const handleSyncMock = () => {
    // ... (mock data sync logic remains)
    const mockGeoJSON = JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [135.5023, 34.6937] },
          properties: { name: "天満の酒場 A", location: "大阪市北区" }
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [135.5000, 34.6700] },
          properties: { name: "難波のバー B", location: "大阪市中央区" }
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [135.5050, 34.7000] },
          properties: { name: "梅田の割烹 C", location: "大阪市北区" }
        }
      ]
    });
    syncData(mockGeoJSON);
  };

  const startRoulette = () => {
    if (shops.length === 0) {
      alert('Please sync your lists first!');
      return;
    }
    const idx = Math.floor(Math.random() * shops.length);
    setWinnerIndex(idx);
    setWinner(shops[idx]);
    setIsSpinning(true);
  };

  const handleFinish = () => {
    setIsSpinning(false);
    setShowWinnerOverlay(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'My List Roulette',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }} 
      />
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Text style={[styles.welcomeText, { color: colors.secondary }]}>Welcome back,</Text>
          <Text style={[styles.title, { color: colors.text }]}>Explore <Text style={{ color: colors.primary }}>Your Taste</Text></Text>
        </View>

        {/* ルーレットホイール */}
        <RouletteWheel 
          isSpinning={isSpinning} 
          onFinish={handleFinish} 
          winnerIndex={winnerIndex}
          itemCount={shops.length || 10}
        />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.glassOverlay, { backgroundColor: colors.glass }]} />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isSpinning || shops.length === 0 ? colors.border : colors.primary }]}
            activeOpacity={0.8}
            disabled={isSpinning || shops.length === 0}
            onPress={startRoulette}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {isSpinning ? 'SPINNING...' : 'START ROULETTE'}
            </Text>
          </TouchableOpacity>

          {syncResult ? (
            <View style={styles.resultContainer}>
              <Text style={[styles.resultText, { color: colors.success }]}>
                ✓ Sync Complete: {syncResult.success} stores added.
              </Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleSyncMock} style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.secondary, fontSize: 13, textDecorationLine: 'underline' }}>
                {shops.length > 0 ? `Synced (${shops.length} stores). Tap to re-sync.` : 'No stores synced. Tap to import mock lists.'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <WinnerOverlay 
          visible={showWinnerOverlay} 
          winner={winner} 
          onClose={() => setShowWinnerOverlay(false)} 
          onSpinAgain={() => {
            setShowWinnerOverlay(false);
            setTimeout(startRoulette, 500);
          }}
        />

        <View style={styles.footerSection}>
           <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 KGM Corp. Powered by AI.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  heroSection: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  resultContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E3735E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  promotionSection: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});
