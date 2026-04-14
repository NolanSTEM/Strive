import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glass';
};

const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  if (variant === 'glass') {
    return (
      <View style={[styles.glassWrapper, style]}>
        <View style={styles.glassInner}>{children}</View>
      </View>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.r16,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  glassWrapper: {
    borderRadius: theme.radii.r16,
    overflow: 'hidden',
  },
  glassInner: {
    backgroundColor: theme.colors.cardGlass,
    borderRadius: theme.radii.r16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primaryButtonGlow2 || '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default Card;
