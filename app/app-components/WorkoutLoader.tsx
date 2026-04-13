import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export default function WorkoutLoader() {
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation loop
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowRadius = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 25],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.centerStack}>
        <View style={styles.ringWrap}>
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ scale: pulse }],
                shadowRadius: glowRadius,
              },
            ]}
          />

          <Animated.Image
            source={require('../../assets/images/Dumbell Animation pic.png')}
            style={[
              styles.dumbbell,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
        </View>

        <Text style={styles.text}>Loading Workouts...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 0, 87, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  centerStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringWrap: {
    position: 'relative',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: '#00BFFF',
    shadowColor: '#00BFFF',
  },

  dumbbell: {
    position: 'absolute',
    width: 80,
    height: 80,
    tintColor: '#00BFFF',
  },

  text: {
    marginTop: 25,
    color: '#00BFFF',
    fontSize: 16,
    letterSpacing: 1,
  },
});