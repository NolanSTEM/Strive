import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function StriveIntro({ onFinish }: { onFinish: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const [flicker, setFlicker] = useState(true);

  // Particle burst
  const particles = useRef(
    Array.from({ length: 12 }).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Fade to black first
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {

      // Start flicker effect
      setTimeout(() => {
  let flickerCount = 0;

  const flickerInterval = setInterval(() => {
    setFlicker(prev => !prev);
    flickerCount++;

    if (flickerCount > 6) {
      clearInterval(flickerInterval);
      setFlicker(true);
    }
  }, 80);
}, 1700); // ⏱ delay BEFORE flicker starts

      // Text animation
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => {

        // Hold longer before exit
        setTimeout(() => {
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            onFinish();
          });
        }, 1500); // ⏱ longer duration
      });
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      
      {/* Glow burst particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
              ],
            },
          ]}
        />
      ))}

      {/* Motion blur layers (fake trail effect) */}
      <Animated.Text
        style={[
          styles.text,
          styles.blurText,
          {
            opacity: textOpacity,
            transform: [{ scale }],
          },
        ]}
      >
        STRIVE
      </Animated.Text>

      {/* Main text */}
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: flicker ? textOpacity : 0.2,
            transform: [{ scale }],
            textShadowRadius: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [5, 25],
            }),
          },
        ]}
      >
        STRIVE
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 80, // 🔥 bigger text
    fontWeight: 'bold',
    color: '#00BFFF',
    letterSpacing: 6,
    textShadowColor: '#00BFFF',
    textShadowOffset: { width: 0, height: 0 },
  },
  blurText: {
    position: 'absolute',
    opacity: 0.2,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00BFFF',
  },
});