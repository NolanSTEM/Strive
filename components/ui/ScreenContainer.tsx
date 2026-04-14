import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  const [LinearGradient, setLinearGradient] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('expo-linear-gradient');
        // Resolve the actual LinearGradient component from several possible shapes
        let LG: any = null;
        if (mod?.LinearGradient) LG = mod.LinearGradient;
        else if (mod?.default?.LinearGradient) LG = mod.default.LinearGradient;
        else if (mod?.default) LG = mod.default;
        else LG = mod;
        if (mounted) setLinearGradient(LG ?? null);
      } catch {
        // expo-linear-gradient not installed; fallback to solid background
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (LinearGradient) {
    // @ts-ignore
    return (
      <LinearGradient
        colors={[
          theme.colors.backgroundGradientStart || theme.colors.background,
          theme.colors.backgroundGradientMid || theme.colors.background,
          theme.colors.backgroundGradientEnd || theme.colors.background,
        ]}
        style={[styles.safeArea, style as any]}
      >
        <SafeAreaView style={styles.safeAreaInner}>
          <View style={styles.container}>{children}</View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style as any]}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});

export default ScreenContainer;
