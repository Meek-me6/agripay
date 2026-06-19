import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius } from '../theme/colors';
// import { collectPayment } from '../api/paymentsApi';

export default function CooperativeScreen() {
  const { farmer, updateFarmer } = useFarmer();
  const [amount, setAmount] = useState('');

  const handleContribute = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    // Real flow: collectPayment({ phone: farmer.phone, amount: value, reference }) -> mobile money prompt
    updateFarmer({ coopSavings: (farmer.coopSavings || 0) + value });
    setAmount('');
    Alert.alert('Contribution recorded', `GHS ${value} added to ${farmer.coopGroup}.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Cooperative Savings" subtitle={farmer.coopGroup} />
      <View style={styles.card}>
        <Text style={styles.label}>Group savings balance</Text>
        <Text style={styles.amount}>GHS {(farmer.coopSavings || 0).toFixed(2)}</Text>
      </View>

      <View style={styles.contributeCard}>
        <Text style={styles.label}>Add a contribution</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Amount (GHS)"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity style={styles.button} onPress={handleContribute}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.note}>
          Triggers Moolre's Payments API to collect via mobile money straight into the group's pooled account.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: { fontSize: 12.5, color: colors.textMuted },
  amount: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 4 },
  contributeCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', marginTop: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginRight: spacing.sm,
    color: colors.text,
  },
  button: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  note: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md, lineHeight: 17 },
});
