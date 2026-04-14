import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
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
