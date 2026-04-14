import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../../constants/theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  style?: any;
};

const hexToRgba = (hex: string, alpha = 1) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ListItem: React.FC<ListItemProps> = ({ title, subtitle, onPress, rightElement, style }) => {
  return (
    <>
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.row, style]}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </TouchableOpacity>
      <View style={[styles.divider, { backgroundColor: hexToRgba(theme.colors.textSecondary, 0.12) }]} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section.fontSize,
    fontWeight: theme.typography.section.fontWeight as any,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.xs,
  },
  right: {
    marginLeft: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: theme.spacing.lg,
    marginRight: theme.spacing.lg,
  },
});

export default ListItem;
