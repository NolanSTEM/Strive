import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants/theme';

type SectionProps = {
  title: string;
  children: React.ReactNode;
  seeAllAction?: () => void;
  seeAllText?: string;
  style?: any;
};

const Section: React.FC<SectionProps> = ({ title, children, seeAllAction, seeAllText = 'See all', style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {seeAllAction ? (
          <TouchableOpacity onPress={seeAllAction} activeOpacity={0.75}>
            <Text style={styles.seeAll}>{seeAllText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.section.fontSize,
    fontWeight: theme.typography.section.fontWeight as any,
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
});

export default Section;
