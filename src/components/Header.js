import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadow } from '../theme/colors';

export default function Header({ title, subtitle, onBack, rightAction }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }, shadow.sm]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={styles.backBtn}>
          {rightAction ?? null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, alignItems: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3, textAlign: 'center' },
  subtitle: { ...typography.caption, marginTop: 2, textAlign: 'center' },
});
