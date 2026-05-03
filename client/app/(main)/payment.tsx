import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCartStore } from '@/store/cartStore';

export default function PaymentScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [voucher, setVoucher] = useState('');
  const totalPrice = getTotalPrice();

  const handleConfirmPayment = () => {
    clearCart();
    alert('Payment successful!');
    router.replace('/home');
  };

  const carItem = items[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Payment</Text>
          <TouchableOpacity>
            <Text style={styles.messageIcon}>💬</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.addressHeader}>
            <View style={styles.pinIcon}>
              <Text>📍</Text>
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressTitle}>Delivery Address</Text>
              <Text style={styles.addressText}>
                123 Main Street, Suite 100{'\n'}New York, NY 10001, USA
              </Text>
            </View>
          </View>
        </View>

        {/* Car Summary */}
        {carItem && (
          <View style={styles.carSummary}>
            <View style={styles.carImage}>
              <Text style={styles.emoji}>{carItem.car.image}</Text>
              <TouchableOpacity style={styles.heartIcon}>
                <Text>❤️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.carSummaryInfo}>
              <View style={styles.ratingRow}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.rating}>{carItem.car.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.carName}>{carItem.car.name}</Text>
                <Text style={styles.price}>
                  ${(carItem.car.price / 1000).toFixed(0)}K
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Credit Card */}
        <View style={styles.creditCard}>
          <View style={styles.cardNumberRow}>
            <Text style={styles.cardNumberSmall}>1234****12</Text>
            <Text style={styles.cardExpiry}>08/2037</Text>
          </View>

          <Text style={styles.cardNumber}>1234  5555  6464  4444</Text>

          <View style={styles.cardBottomRow}>
            <Text style={styles.cardHolder}>Paul Walker</Text>
            <Text style={styles.cardIssuer}>AUSE</Text>
          </View>
        </View>

        {/* Voucher Input */}
        <View style={styles.voucherSection}>
          <View style={styles.voucherInput}>
            <Text style={styles.voucherIcon}>🎫</Text>
            <TextInput
              style={styles.voucherTextInput}
              placeholder="Apply your voucher"
              placeholderTextColor={colors.textSecondary}
              value={voucher}
              onChangeText={setVoucher}
            />
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <View style={styles.totalLabel}>
              <Text style={styles.totalIcon}>🏷️</Text>
              <Text style={styles.totalText}>Total Price</Text>
            </View>
            <Text style={styles.totalPrice}>
              ${(totalPrice / 1000).toFixed(0)}K
            </Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity
        onPress={handleConfirmPayment}
        style={styles.confirmButton}
      >
        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  messageIcon: {
    fontSize: 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  carSummary: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.mediumGray,
    borderRadius: theme.borderRadius.card,
    height: 120,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  carImage: {
    width: 120,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 50,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
  },
  carSummaryInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  carName: {
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  price: {
    fontSize: 13,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  creditCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.navy,
    borderRadius: theme.borderRadius.card,
    padding: 20,
  },
  cardNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardNumberSmall: {
    fontSize: 11,
    color: colors.white,
    fontWeight: theme.fontWeights.semibold,
  },
  cardExpiry: {
    fontSize: 11,
    color: colors.white,
    fontWeight: theme.fontWeights.semibold,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
    color: colors.white,
    letterSpacing: 4,
    marginBottom: 16,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHolder: {
    fontSize: 11,
    color: colors.white,
    fontWeight: theme.fontWeights.semibold,
  },
  cardIssuer: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: theme.fontWeights.bold,
  },
  voucherSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  voucherInput: {
    borderWidth: 1,
    borderColor: colors.lightBorder,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  voucherTextInput: {
    flex: 1,
    fontSize: 13,
    color: colors.dark,
  },
  totalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  totalText: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
    fontSize: 14,
  },
});
