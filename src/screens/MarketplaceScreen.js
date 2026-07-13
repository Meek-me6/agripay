import React, { useState, useEffect, useCallback } from 'react';import {
  View, FlatList, Text, StyleSheet, TouchableOpacity,
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Badge from '../components/Badge';
import backendClient from '../api/backendClient';
import { useFarmer } from '../context/FarmerContext';
import { colors, spacing, radius, typography, shadow } from '../theme/colors';
import { CURRENCY, PHONE_COUNTRY_CODE } from '../config/appConfig';

const cropEmojis = { Maize: '🌽', Cocoa: '🍫', Tomato: '🍅', Yam: '🍠', Groundnuts: '🥜' };

function ListingCard({ item, onBuy }) {
  const emoji = cropEmojis[item.crop] || '🌾';
  const daysAgo = item.posted_at ? Math.floor((Date.now() - new Date(item.posted_at)) / 86400000) : 0;
  const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
  const inEscrow = !!item.in_escrow;

  return (
    <View style={[styles.card, shadow.sm]}>
      <View style={styles.cardHeader}>
        <View style={styles.emojiWrap}><Text style={{ fontSize: 24 }}>{emoji}</Text></View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.crop}>{item.crop}</Text>
            {inEscrow && <Badge label="In Escrow" variant="blue" />}
            {item.condition && <Badge label={item.condition} variant="primary" />}
          </View>
          <Text style={styles.meta}>{item.quantity} · {item.location}</Text>
          <Text style={styles.seller}><Ionicons name="person-outline" size={12} color={colors.textMuted} /> {item.seller}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.price}>{CURRENCY} {item.price}</Text>
          <Text style={styles.perUnit}>per {item.unit}</Text>
        </View>
        <View style={styles.cardActions}>
          <Text style={styles.postedTime}>{timeLabel}</Text>
          <TouchableOpacity style={styles.buyBtn} onPress={() => onBuy(item)} activeOpacity={0.85} disabled={inEscrow}>
            <Text style={styles.buyBtnText}>{inEscrow ? 'Sold' : 'Buy'}</Text>
            {!inEscrow && <Ionicons name="arrow-forward" size={14} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function PostModal({ visible, onClose, onPosted, insets, farmerName }) {
  const [crop, setCrop] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('100kg bag');
  const [location, setLocation] = useState('');
  const [posting, setPosting] = useState(false);
  const canPost = crop.trim() && qty.trim() && price.trim() && location.trim();

  const handlePost = async () => {
    setPosting(true);
    try {
      const client = await backendClient();
      await client.post('/listings', {
        crop: crop.trim(),
        quantity: qty.trim(),
        price: parseFloat(price),
        unit,
        location: location.trim(),
        condition: 'Grade A',
      });
      Alert.alert('✅ Listed!', `${crop} listing is now live on the marketplace.`);
      setCrop(''); setQty(''); setPrice(''); setLocation('');
      onPosted();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Could not post listing. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={typography.h3}>Post a listing</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>
            </View>

            {[['Crop name', crop, setCrop, 'e.g. Maize', 'default'],
              ['Quantity', qty, setQty, 'e.g. 10 bags', 'default'],
              ['Location', location, setLocation, 'e.g. Techiman', 'default'],
              ['Price per unit (' + CURRENCY + ')', price, setPrice, 'e.g. 220', 'numeric']].map(([lbl, val, set, ph, kb]) => (
              <View key={lbl} style={{ marginBottom: spacing.md }}>
                <Text style={styles.inputLabel}>{lbl}</Text>
                <TextInput
                  style={styles.input} placeholder={ph} placeholderTextColor={colors.textLight}
                  value={val} onChangeText={set} keyboardType={kb}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.postBtn, (!canPost || posting) && { opacity: 0.4 }]}
              disabled={!canPost || posting} onPress={handlePost}
            >
              {posting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.postBtnText}>Post listing</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function BuyModal({ listing, visible, onClose, onDone, insets }) {
  const { farmer } = useFarmer();
  const [phone, setPhone] = useState('');
  const [buying, setBuying] = useState(false);

  useEffect(() => { if (farmer?.phone) setPhone(farmer.phone); }, [farmer]);

  const handleBuy = async () => {
    if (!listing) return;
    setBuying(true);
    try {
      const client = await backendClient();
      await client.post(`/listings/${listing.id}/buy`, { phone });
      Alert.alert('✅ Purchase initiated', 'Payment prompt sent to your mobile money number. Funds held in escrow until delivery.');
      onDone();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Payment failed. Please try again.';
      Alert.alert('Payment failed', msg);
    } finally {
      setBuying(false);
    }
  };

  if (!listing) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={typography.h3}>Buy {listing.crop}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.textMuted} /></TouchableOpacity>
          </View>
          <Text style={[typography.body, { marginBottom: spacing.md }]}>
            {listing.quantity} from {listing.seller} at {CURRENCY} {listing.price}/{listing.unit}
          </Text>
          <Text style={styles.inputLabel}>Mobile money number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.dialCode}><Text style={{ fontSize: 14, color: colors.text }}>🇬🇭 {PHONE_COUNTRY_CODE}</Text></View>
            <TextInput
              style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }]}
              placeholder="024 XXX XXXX" placeholderTextColor={colors.textLight}
              keyboardType="phone-pad" value={phone} onChangeText={setPhone}
            />
          </View>
          <View style={[styles.escrowNote, { marginTop: spacing.md }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.blue} />
            <Text style={styles.escrowNoteText}>Payment via Moolre Payments API · Held in escrow until delivery</Text>
          </View>
          <TouchableOpacity
            style={[styles.postBtn, { marginTop: spacing.md }, (!phone || buying) && { opacity: 0.4 }]}
            disabled={!phone || buying} onPress={handleBuy}
          >
            {buying
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.postBtnText}>{`Pay ${CURRENCY} ${listing.price}`}</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const { farmer } = useFarmer();
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [postModal, setPostModal] = useState(false);
  const [buyItem, setBuyItem] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      const client = await backendClient();
      const { data } = await client.get('/listings');
      setListings(Array.isArray(data) ? data : []);
    } catch (e) {
      // Network error — show empty, user can pull-to-refresh
      setListings([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Marketplace" subtitle="Escrow-protected trading"
        rightAction={
          <TouchableOpacity onPress={() => setPostModal(true)} style={styles.fabInline}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={listings} keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} colors={[colors.primary]} />}
        renderItem={({ item }) => <ListingCard item={item} onBuy={setBuyItem} />}
        ListHeaderComponent={
          <View style={[styles.escrowBanner, shadow.sm]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} />
            <Text style={styles.escrowText}>All transactions use <Text style={{ fontWeight: '700' }}>escrow protection</Text>.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
            <Ionicons name="cart-outline" size={40} color={colors.border} />
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>No listings yet. Be the first to sell!</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, shadow.lg, { bottom: insets.bottom + spacing.md }]}
        onPress={() => setPostModal(true)}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
      <PostModal visible={postModal} onClose={() => setPostModal(false)} onPosted={fetchListings} insets={insets} farmerName={farmer?.name} />
      <BuyModal listing={buyItem} visible={!!buyItem} onClose={() => setBuyItem(null)} onDone={fetchListings} insets={insets} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  emojiWrap: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  crop: { ...typography.h4 },
  meta: { ...typography.caption, marginTop: 3 },
  seller: { ...typography.caption, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: 18, fontWeight: '800', color: colors.primary },
  perUnit: { ...typography.caption },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postedTime: { ...typography.caption },
  buyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.sm },
  buyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  escrowBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.blueMuted, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  escrowText: { flex: 1, fontSize: 13, color: colors.blue, lineHeight: 18 },
  fab: { position: 'absolute', right: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  fabInline: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  inputLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 15, color: colors.text },
  postBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center' },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  escrowNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.blueMuted, borderRadius: radius.xs, padding: spacing.sm },
  escrowNoteText: { flex: 1, fontSize: 12, color: colors.blue },
  phoneRow: { flexDirection: 'row' },
  dialCode: { borderWidth: 1, borderColor: colors.border, borderRightWidth: 0, borderTopLeftRadius: radius.sm, borderBottomLeftRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 13, backgroundColor: colors.borderLight },
});
