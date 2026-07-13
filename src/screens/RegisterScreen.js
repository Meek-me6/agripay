import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { useFarmer } from '../context/FarmerContext';
import { ghanaRegions } from '../data/mockData';
import { PHONE_COUNTRY_CODE } from '../config/appConfig';

const MAIN_CROPS = [
  'Maize', 'Cocoa', 'Cassava', 'Yam', 'Rice', 'Tomato',
  'Groundnuts', 'Sorghum', 'Plantain', 'Onion', 'Soybean', 'Cowpea',
];

export default function RegisterScreen({ navigation }) {
  const { register } = useFarmer();
  const insets = useSafeAreaInsets();
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [region, setRegion]           = useState('');
  const [crop, setCrop]               = useState('');
  const [pin, setPin]                 = useState('');
  const [regionModal, setRegionModal] = useState(false);
  const [cropModal, setCropModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  const coopGroup = region && crop ? `${region} ${crop} Growers Cooperative` : '';

  const handleRegister = async () => {
    if (submitting) return;

    // Validate with helpful alerts instead of silent button disable
    if (!name.trim() || name.trim().length < 2) {
      return Alert.alert('Name required', 'Please enter your full name.');
    }
    if (!phone.trim() || phone.trim().length < 9) {
      return Alert.alert('Phone required', 'Enter a valid Ghanaian phone number.');
    }
    if (!region) {
      return Alert.alert('Region required', 'Please select your region.');
    }
    if (!crop) {
      return Alert.alert('Crop required', 'Please select your main crop.');
    }
    if (!pin || pin.length < 4) {
      return Alert.alert('PIN required', 'Create a PIN with at least 4 digits.');
    }

    setSubmitting(true);
    try {
      await register({ name: name.trim(), phone: phone.trim(), region, pin, coopGroup });
      // FarmerContext sets farmer state → App.js Root automatically navigates to MainTabs
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Registration failed. Try again.';
      Alert.alert('Registration failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, {
        paddingTop: insets.top + spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
      }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand */}
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}><Text style={{ fontSize: 28 }}>🌾</Text></View>
        <Text style={styles.logo}>AgriPay</Text>
      </View>
      <Text style={styles.tagline}>Prices · Credit · Subsidies · Savings</Text>
      <Text style={styles.sub}>Built for Ghanaian smallholder farmers</Text>

      <View style={[styles.form, shadow.md]}>
        <Text style={styles.formTitle}>Create your profile</Text>

        {/* Full name */}
        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={[styles.input, { marginBottom: spacing.md }]}
          placeholder="e.g. Kwame Asante"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* Phone */}
        <Text style={styles.label}>Phone number</Text>
        <View style={[styles.phoneRow, { marginBottom: spacing.md }]}>
          <View style={styles.dialCode}>
            <Text style={{ fontSize: 15, color: colors.text }}>🇬🇭 {PHONE_COUNTRY_CODE}</Text>
          </View>
          <TextInput
            style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }]}
            placeholder="024 XXX XXXX"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoCorrect={false}
          />
        </View>

        {/* Region picker */}
        <Text style={styles.label}>Region</Text>
        <TouchableOpacity
          style={[styles.picker, { marginBottom: spacing.md }]}
          onPress={() => setRegionModal(true)}
          activeOpacity={0.7}
        >
          <Text style={region ? styles.pickerText : styles.pickerPlaceholder}>
            {region || 'Select your region'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Crop picker */}
        <Text style={styles.label}>Main crop</Text>
        <TouchableOpacity
          style={[styles.picker, { marginBottom: spacing.md }]}
          onPress={() => setCropModal(true)}
          activeOpacity={0.7}
        >
          <Text style={crop ? styles.pickerText : styles.pickerPlaceholder}>
            {crop || 'Select your main crop'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Coop preview */}
        {coopGroup ? (
          <View style={[styles.coopPreview, { marginBottom: spacing.md }]}>
            <Ionicons name="people-outline" size={16} color={colors.primary} />
            <Text style={styles.coopPreviewText}>
              You'll join: <Text style={{ fontWeight: '700', color: colors.primary }}>{coopGroup}</Text>
            </Text>
          </View>
        ) : null}

        {/* PIN */}
        <Text style={styles.label}>Create PIN (4+ digits)</Text>
        <TextInput
          style={[styles.input, { marginBottom: spacing.lg }]}
          placeholder="••••"
          placeholderTextColor={colors.textLight}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.6 }]}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.buttonText}>Get started</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: spacing.xs }} />
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.6}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{'  '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Region Modal */}
      <Modal visible={regionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.modalHandle} />
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Select Region</Text>
            <FlatList
              data={ghanaRegions}
              keyExtractor={r => r}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listRow, item === region && styles.listRowSelected]}
                  onPress={() => { setRegion(item); setRegionModal(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.listText, item === region && { color: colors.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {item === region && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Crop Modal */}
      <Modal visible={cropModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.modalHandle} />
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Select Main Crop</Text>
            <FlatList
              data={MAIN_CROPS}
              keyExtractor={c => c}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listRow, item === crop && styles.listRowSelected]}
                  onPress={() => { setCrop(item); setCropModal(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.listText, item === crop && { color: colors.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {item === crop && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { paddingHorizontal: spacing.lg },
  brandRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  brandIcon:          { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  logo:               { fontSize: 32, fontWeight: '800', color: colors.primary },
  tagline:            { fontSize: 15, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  sub:                { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.xl },
  form:               { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  formTitle:          { ...typography.h4, marginBottom: spacing.lg },
  label:              { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:              { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: 15, color: colors.text, backgroundColor: colors.background },
  phoneRow:           { flexDirection: 'row' },
  dialCode:           { borderWidth: 1, borderColor: colors.border, borderRightWidth: 0, borderTopLeftRadius: radius.sm, borderBottomLeftRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, backgroundColor: colors.borderLight },
  picker:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, backgroundColor: colors.background },
  pickerText:         { fontSize: 15, color: colors.text },
  pickerPlaceholder:  { fontSize: 15, color: colors.textLight },
  coopPreview:        { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primaryMuted, borderRadius: radius.sm, padding: spacing.sm },
  coopPreviewText:    { fontSize: 13, color: colors.text, flex: 1 },
  button:             { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  buttonText:         { color: '#fff', fontWeight: '700', fontSize: 15 },
  loginLink:          { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.sm },
  loginLinkText:      { fontSize: 14, color: colors.textMuted },
  modalOverlay:       { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  modalSheet:         { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '80%' },
  modalHandle:        { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  listRow:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  listRowSelected:    { backgroundColor: colors.primaryMuted, marginHorizontal: -spacing.xs, paddingHorizontal: spacing.xs, borderRadius: radius.sm },
  listText:           { fontSize: 15, color: colors.text },
});
