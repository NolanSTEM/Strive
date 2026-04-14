import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type HeaderProps = {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: any;
  titleStyle?: any;
};

const Header: React.FC<HeaderProps> = ({ title, leftAction, rightAction, style, titleStyle }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>{leftAction}</View>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={styles.side}>{rightAction}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  side: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.typography.title.fontWeight as any,
  },
});

export default Header;
