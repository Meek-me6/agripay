import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import Header from '../components/Header';
import ModuleCard from '../components/ModuleCard';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { farmer } = useFarmer();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={`Hello, ${farmer.name?.split(' ')[0] || 'Farmer'} 👋`} subtitle={farmer.region} />

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet balance</Text>
        <Text style={styles.balanceAmount}>GHS {farmer.walletBalance?.toFixed(2) ?? '0.00'}</Text>
        <Text style={styles.balanceSub}>Credit score: {farmer.creditScore || '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modules</Text>

        <ModuleCard
          icon="trending-up-outline"
          title="Price Board"
          subtitle="Today's crop prices across markets"
          accent={colors.primary}
          onPress={() => navigation.navigate('Prices')}
        />
        <ModuleCard
          icon="cart-outline"
          title="Marketplace"
          subtitle="Sell to buyers with escrow protection"
          accent={colors.primaryLight}
          onPress={() => navigation.navigate('Marketplace')}
        />
        <ModuleCard
          icon="cash-outline"
          title="Subsidy Tracker"
          subtitle="Check disbursement status"
          accent={colors.accent}
          onPress={() => navigation.navigate('Subsidy')}
        />
        <ModuleCard
          icon="people-outline"
          title="Cooperative Savings"
          subtitle={farmer.coopGroup}
          accent="#5B8C5A"
          onPress={() => navigation.navigate('Cooperative')}
        />
        <ModuleCard
          icon="card-outline"
          title="Credit"
          subtitle="Apply for credit using your transaction history"
          accent="#8C6A5B"
          onPress={() => navigation.navigate('Credit')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceLabel: { color: '#D9EAD9', fontSize: 13 },
  balanceAmount: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  balanceSub: { color: '#D9EAD9', fontSize: 12.5, marginTop: 6 },
  section: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
});
