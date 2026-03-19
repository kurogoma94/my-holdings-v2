// [目的] 当選時のお祝い画面（Terracotta Sunsetテーマ）
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../constants/Colors';
import { Shop } from '../constants/Types';

interface WinnerOverlayProps {
  visible: boolean;
  winner: Shop | null;
  onClose: () => void;
  onSpinAgain: () => void;
}

export function WinnerOverlay({ visible, winner, onClose, onSpinAgain }: WinnerOverlayProps) {
  const colors = Colors.dark;

  if (!winner) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={[styles.glassOverlay, { backgroundColor: colors.glass }]} />
          
          <Text style={[styles.congratsText, { color: colors.secondary }]}>CONGRATULATIONS!</Text>
          <Text style={[styles.winnerName, { color: colors.text }]}>{winner.name}</Text>
          
          <View style={styles.details}>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>📍 {winner.address || 'Unknown Area'}</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>⭐ {winner.rating} / 5.0</Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Visit on Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.outlineButton, { borderColor: colors.secondary }]}
            onPress={onSpinAgain}
          >
            <Text style={[styles.outlineButtonText, { color: colors.secondary }]}>Spin Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    padding: 30,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 10,
  },
  winnerName: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  details: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detailText: {
    fontSize: 16,
    marginVertical: 2,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  outlineButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
