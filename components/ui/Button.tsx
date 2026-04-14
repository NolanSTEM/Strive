import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', onPress, children, style, textStyle, disabled }) => {
  const isPrimary = variant === 'primary';

  const content = <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary, textStyle]}>{children}</Text>;

  if (isPrimary) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.buttonGradientWrapper, disabled && styles.disabled, style]}>
        <LinearGradient
          colors={[theme.colors.primaryButtonGradientStart, theme.colors.primaryButtonGradientEnd]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.gradientBackground}
        >
          <View style={styles.gradientContent}>{content}</View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.button, styles.secondary, disabled && styles.disabled, style]}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radii.r16,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  text: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
  },
  textPrimary: {
    color: theme.colors.textPrimary,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonGradientWrapper: {
    borderRadius: theme.radii.r16,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientContent: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryFallback: {
    backgroundColor: theme.colors.primaryButtonGradientStart || theme.colors.primary,
  },
});

export default Button;
