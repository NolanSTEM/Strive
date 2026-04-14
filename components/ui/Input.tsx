import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { theme } from '../../constants/theme';

type InputProps = TextInputProps & {};

const Input: React.FC<InputProps> = (props) => {
  return <TextInput placeholderTextColor={theme.colors.textSecondary} style={styles.input} {...props} />;
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.textPrimary,
    borderRadius: theme.radii.r12,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
  },
});

export default Input;
