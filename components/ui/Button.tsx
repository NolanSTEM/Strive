import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import theme from '../../constants/theme';

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
  const [LinearGradient, setLinearGradient] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('expo-linear-gradient');
        const LG = mod?.LinearGradient ?? mod?.default ?? null;
        if (mounted) setLinearGradient(LG);
      } catch {
        // expo-linear-gradient not installed — fallback will be used
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const content = <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary, textStyle]}>{children}</Text>;

  if (isPrimary) {
    if (LinearGradient) {
      return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.buttonGradientWrapper, style]}>
          {/* @ts-ignore */}
          <LinearGradient
            colors={[theme.colors.primaryButtonGradientStart, theme.colors.primaryButtonGradientEnd]}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.gradientFill}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[styles.button, styles.primaryFallback, disabled && styles.disabled, style]}>
        {content}
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
  },
  gradientFill: {
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
