// [目的] プレミアムな回転アニメーションを持つルーレットホイール
import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing, Text, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = SCREEN_WIDTH * 0.7;

interface RouletteWheelProps {
  isSpinning: boolean;
  onFinish: () => void;
  winnerIndex?: number;
  itemCount: number;
}

export function RouletteWheel({ isSpinning, onFinish, winnerIndex, itemCount }: RouletteWheelProps) {
  const colors = Colors.dark;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSpinning) {
      startSpin();
    }
  }, [isSpinning]);

  const startSpin = () => {
    rotation.setValue(0);
    
    // 重厚な慣性を表現するため、複数の回転とイージングを組み合わせる
    const totalRotation = 5 + (winnerIndex ? (winnerIndex / itemCount) : Math.random());
    
    Animated.timing(rotation, {
      toValue: totalRotation,
      duration: 4000,
      easing: Easing.bezier(0.15, 0, 0, 1), // 最初は速く、最後は極めてゆっくり
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* ポインター（インジケーター） */}
      <View style={[styles.pointer, { borderBottomColor: colors.primary }]} />
      
      <Animated.View 
        style={[
          styles.wheel, 
          { 
            borderColor: colors.primary, 
            transform: [{ rotate: spin }],
            backgroundColor: colors.surface,
          }
        ]}
      >
        <View style={[styles.glassOverlay, { backgroundColor: colors.glass }]} />
        
        {/* 中心点 */}
        <View style={[styles.centerDot, { backgroundColor: colors.accent }]} />
        
        {/* セグメント（簡易版: 数に応じてドットや線を表示） */}
        {[...Array(itemCount)].map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.segmentLine, 
              { 
                backgroundColor: colors.border,
                transform: [{ rotate: `${(360 / itemCount) * i}deg` }] 
              }
            ]} 
          />
        ))}
        
        <Text style={[styles.centerText, { color: colors.secondary }]}>
          {isSpinning ? 'SPINNING' : 'ROULETTE'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: -15,
    zIndex: 10,
    transform: [{ rotate: '180deg' }],
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 5,
  },
  centerText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.8,
  },
  segmentLine: {
    position: 'absolute',
    width: 2,
    height: WHEEL_SIZE / 2,
    top: 0,
    opacity: 0.3,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
});
