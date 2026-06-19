import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius } from '../theme/colors';
import { keysConfigured } from '../api/moolreClient';

export default function ProfileScreen() {
  const { farmer, updateFarmer } = useFarmer();

  const handleSignOut = () => {
    Alert.alert('Reset demo profile?', 'This clears the locally stored farmer profile.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => updateFarmer({ registered: false }) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Profile" />
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={56} color={colors.primary} />
        <Text style={styles.name}>{farmer.name}</Text>
        <Text style={styles.detail}>{farmer.phone}</Text>
        <Text style={styles.detail}>{farmer.region}</Text>
      </View>

      <View style={styles.statusCard}>
        <Ionicons
          name={keysConfigured() ? 'checkmark-circle' : 'alert-circle-outline'}
          size={18}
          color={keysConfigured() ? colors.success : colors.accent}
        />
        <Text style={styles.statusText}>
          {keysConfigured()
            ? 'Moolre API keys detected'
            : 'Moolre API keys not yet added — see src/api/moolreClient.js'}
        </Text>
      </View>

      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Reset demo profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  detail: { fontSize: 13.5, color: colors.textMuted, marginTop: 2 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: { fontSize: 12.5, color: colors.textMuted, marginLeft: spacing.sm, flex: 1 },
  signOut: { marginHorizontal: spacing.md, marginTop: spacing.lg, alignItems: 'center', padding: spacing.md },
  signOutText: { color: colors.danger, fontWeight: '600', fontSize: 13.5 },
});
