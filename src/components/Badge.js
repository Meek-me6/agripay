import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

const presets = {
  success: { bg: colors.successMuted, text: colors.success },
  danger: { bg: colors.dangerMuted, text: colors.danger },
  warning: { bg: colors.warningMuted, text: colors.warning },
  accent: { bg: colors.accentMuted, text: colors.accent },
  primary: { bg: colors.primaryMuted, text: colors.primary },
  blue: { bg: colors.blueMuted, text: colors.blue },
  purple: { bg: colors.purpleMuted, text: colors.purple },
  muted: { bg: colors.borderLight, text: colors.textMuted },
};

export default function Badge({ label, variant = 'primary', style }) {
  const p = presets[variant] || presets.muted;
  return (
    <View style={[styles.pill, { backgroundColor: p.bg }, style]}>
      <Text style={[styles.text, { color: p.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
