import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const NUM_DUMBBELLS = 50; // ✅ reduced to 8

export default function DumbbellFallingAni() {
  const dumbbells = useRef(
    Array.from({ length: NUM_DUMBBELLS }).map(() => ({
      x: Math.random() * width,
      y: new Animated.Value(Math.random() * height), // ✅ start anywhere on screen
      speed: 3000 + Math.random() * 3000,
      rotation: new Animated.Value(Math.random() * 360),
    }))
  ).current;

  useEffect(() => {
    dumbbells.forEach(({ y, speed, rotation }) => {
      const animate = () => {
        // ✅ after first run, reset to slightly above screen
        y.setValue(-100);
        rotation.setValue(Math.random() * 360);

        Animated.timing(y, {
          toValue: height + 100,
          duration: speed,
          useNativeDriver: true,
        }).start(() => animate());
      };

      // ✅ delay each dumbbell so they don't sync
      setTimeout(() => {
        animate();
      }, Math.random() * 2000);
    });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {dumbbells.map(({ x, y, rotation }, index) => (
        <Animated.Image
          key={index}
          source={require('../../assets/images/Dumbell Animation pic.png')}
          style={[
            styles.dumbbell,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                {
                  rotate: rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#02006c',
  },
  dumbbell: {
    width: 125,
    height: 125,
    position: 'absolute',
    opacity: 0.8,
  },
});