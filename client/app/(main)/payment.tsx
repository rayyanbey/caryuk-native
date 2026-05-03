/* eslint-disable import/no-unresolved */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CardField,
  CardFieldInput,
  StripeProvider,
  useStripe,
} from '@stripe/stripe-react-native';
import { colors, theme } from '@/constants/colors';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/service/api';

// Valid voucher codes and their discount percentages
const VOUCHERS: { [key: string]: number } = {
  'CARYUK20': 0.20,   // 20% off
  'WELCOME10': 0.10,  // 10% off
  'RAYYAN': 0.50,     // 50% off (Special)
};

function PaymentScreenContent() {
  const router = useRouter();
  const { confirmPayment } = useStripe();
  const { items, getTotalPrice, clearCart, removeFromCart } = useCartStore();
  const { user, updateUser } = useAuthStore();
  const [voucher, setVoucher] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  
  const subtotal = getTotalPrice();
  const currentAddress = user?.address || '123 Main Street, Suite 100, New York, NY 10001, USA';

  const discountAmount = useMemo(() => {
    return subtotal * appliedDiscount;
  }, [subtotal, appliedDiscount]);

  const taxAmount = useMemo(() => {
    return (subtotal - discountAmount) * 0.05;
  }, [subtotal, discountAmount]);

  const finalTotal = subtotal - discountAmount + taxAmount;

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const maybeAxios = error as {
      response?: {
        data?: {
          error?: string | { message?: string };
          message?: string;
          details?: {
            orderAmount?: number;
            stripeAmount?: number;
            maxAllowed?: number;
            configuredMultiplier?: number;
            amountMultiplierUsed?: number;
          };
        };
      };
      message?: string;
    };

    const data = maybeAxios?.response?.data;
    const details = data?.details;

    const withDetails = (base: string) => {
      if (!details || details.stripeAmount === undefined || details.maxAllowed === undefined) {
        return base;
      }

      return `${base} (order: ${details.orderAmount}, stripe: ${details.stripeAmount}, max: ${details.maxAllowed}, multiplier: ${details.amountMultiplierUsed ?? details.configuredMultiplier ?? 'n/a'})`;
    };

    if (typeof data?.error === 'string' && data.error) return withDetails(data.error);
    if (typeof data?.error === 'object' && data.error?.message) return withDetails(data.error.message);
    if (data?.message) return withDetails(data.message);
    if (maybeAxios?.message) return maybeAxios.message;
    return fallback;
  };

  const handleApplyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (VOUCHERS[code]) {
      setAppliedDiscount(VOUCHERS[code]);
      Alert.alert('Success', `Voucher applied! You got ${(VOUCHERS[code] * 100).toFixed(0)}% off.`);
    } else {
      setAppliedDiscount(0);
      Alert.alert('Invalid Code', 'The voucher code you entered is not valid.');
    }
  };

  const handleEditAddress = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Edit Address',
        'Enter your delivery address:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: (text) => text && updateUser({ address: text }) }
        ],
        'plain-text',
        currentAddress
      );
    } else {
      Alert.alert(
        'Edit Address',
        'Address editing feature is coming soon to Android! (Using mock update for now)',
        [{ text: 'Mock Update', onPress: () => updateUser({ address: '456 New Street, London, UK' }) }]
      );
    }
  };

  const handleConfirmPayment = async () => {
    if (items.length === 0 || isPaying) return;
    if (!cardDetails?.complete) {
      Alert.alert('Card Required', 'Please enter complete card details to continue.');
      return;
    }

    setIsPaying(true);
    try {
      for (const [index, item] of items.entries()) {
        const carId = item.car.id || item.car._id;
        if (!carId) {
          throw new Error('Missing car identifier in cart item.');
        }

        let orderResponse;
        try {
          orderResponse = await apiService.createOrder({
            carId,
            voucherCode: appliedDiscount > 0 && index === 0 ? voucher.trim().toUpperCase() : undefined,
          });
        } catch (orderError) {
          const orderMessage = getApiErrorMessage(orderError, 'Failed to create order.');

          // Frontend has demo voucher codes that may not exist in backend DB.
          if (appliedDiscount > 0 && /voucher/i.test(orderMessage)) {
            orderResponse = await apiService.createOrder({ carId });
            setAppliedDiscount(0);
            setVoucher('');
            Alert.alert('Voucher Ignored', 'This voucher is not available on server. Payment will continue without voucher.');
          } else {
            throw new Error(orderMessage);
          }
        }

        const orderId = orderResponse.data?.data?._id || orderResponse.data?.data?.id;

        if (!orderId) {
          throw new Error('Failed to create order for payment.');
        }

        const intentResponse = await apiService.createPaymentIntent(orderId);
        const clientSecret = intentResponse.data?.data?.clientSecret;
        const paymentIntentId = intentResponse.data?.data?.paymentIntentId;

        if (!clientSecret) {
          throw new Error('Payment intent was created without a client secret.');
        }

        const { error, paymentIntent } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails: {
              name: user?.name || 'Caryuk Buyer',
              email: user?.email,
              phone: user?.phone,
              address: {
                line1: currentAddress,
              },
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Stripe payment failed.');
        }

        const confirmedPaymentIntentId = paymentIntent?.id || paymentIntentId;
        if (!confirmedPaymentIntentId) {
          throw new Error('Missing confirmed payment intent id.');
        }

        try {
          await apiService.confirmStripePayment(orderId, confirmedPaymentIntentId);
        } catch (confirmError) {
          throw new Error(getApiErrorMessage(confirmError, 'Failed to confirm payment on server.'));
        }

        try {
          await apiService.finalizePurchase(carId);
        } catch (finalizeError) {
          throw new Error(getApiErrorMessage(finalizeError, 'Payment succeeded, but purchase finalization failed.'));
        }
      }

      await clearCart();
      Alert.alert(
        'Payment Successful',
        'Your order has been placed successfully!',
        [{ text: 'OK', onPress: () => router.replace('/home') }]
      );
    } catch (error) {
      console.error('Payment confirmation error:', error);
      const message = getApiErrorMessage(error, 'Failed to process payment. Please try again.');
      Alert.alert('Payment Failed', message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleRemoveItem = (carId: string) => {
    Alert.alert(
      'Remove Car',
      'Are you sure you want to remove this car from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => removeFromCart(carId) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Image 
              source={require('../../assets/images/arrow_back.png')} 
              style={styles.headerIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.title}>Payment</Text>
          <TouchableOpacity onPress={() => Alert.alert('Chat', 'Connecting you with support...')}>
            <Image 
              source={require('../../assets/images/chat_icon.png')} 
              style={styles.headerIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Delivery Address */}
          <View style={styles.section}>
            <View style={styles.addressCard}>
              <View style={styles.pinIconContainer}>
                <Image 
                  source={require('../../assets/images/home_icon.png')} 
                  style={styles.pinIcon} 
                  resizeMode="contain" 
                />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressTitle}>Delivery Address</Text>
                  <TouchableOpacity onPress={handleEditAddress}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.addressText}>
                  {currentAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Car Summary List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Selected Cars</Text>
            {items.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <TouchableOpacity onPress={() => router.replace('/home')}>
                  <Text style={styles.shopNow}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              items.map((item, index) => (
                <TouchableOpacity 
                  key={item.car.id || item.car._id || index} 
                  style={styles.summaryCard}
                  onPress={() => router.push(`/car-detail?id=${item.car.id || item.car._id}`)}
                >
                  <View style={styles.carImageContainer}>
                    {item.car.image?.startsWith('http') ? (
                      <Image 
                        source={{ uri: item.car.image }} 
                        style={styles.carImage} 
                        resizeMode="cover" 
                      />
                    ) : (
                      <Text style={styles.emojiPlaceholder}>{item.car.image || '🚗'}</Text>
                    )}
                  </View>

                  <View style={styles.summaryInfo}>
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.carCategory}>{item.car.category}</Text>
                        <Text style={styles.carName}>{item.car.name}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveItem(item.car.id || item.car._id || '')}
                        style={styles.removeButton}
                      >
                        <Image 
                          source={require('../../assets/images/trash_icon.png')} 
                          style={styles.trashIcon} 
                          resizeMode="contain" 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>⭐</Text>
                      <Text style={styles.rating}>{(item.car.rating || 0).toFixed(1)}</Text>
                      <Text style={styles.reviews}>({item.car.reviews || 0} reviews)</Text>
                    </View>
                    
                    <View style={styles.priceRow}>
                      <View />
                      <Text style={styles.price}>
                        ${(item.car.price / 1000).toFixed(0)}K
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Payment Card */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.stripeCardContainer}>
              <Text style={styles.cardHint}>Enter your card details</Text>
              <CardField
                postalCodeEnabled
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: colors.white,
                  textColor: colors.dark,
                  placeholderColor: colors.textSecondary,
                  borderRadius: 12,
                }}
                style={styles.cardField}
                onCardChange={setCardDetails}
              />
            </View>
          </View>

          {/* Voucher Input */}
          <View style={styles.voucherSection}>
            <Text style={styles.sectionTitle}>Voucher Code</Text>
            <View style={styles.voucherInputContainer}>
              <Image 
                source={require('../../assets/images/voucher_icon.png')} 
                style={styles.voucherIcon} 
                resizeMode="contain" 
              />
              <TextInput
                style={styles.voucherTextInput}
                placeholder="Enter voucher code"
                placeholderTextColor={colors.textSecondary}
                value={voucher}
                onChangeText={setVoucher}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.applyButton, !voucher && { opacity: 0.5 }]} 
                onPress={handleApplyVoucher}
                disabled={!voucher}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${(subtotal / 1000).toFixed(0)}K</Text>
            </View>
            
            {appliedDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.primary }]}>Discount ({(appliedDiscount * 100).toFixed(0)}%)</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>-${(discountAmount / 1000).toFixed(1)}K</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>${(taxAmount / 1000).toFixed(1)}K</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabelText}>Total Amount</Text>
              <Text style={styles.totalPriceText}>
                ${(finalTotal / 1000).toFixed(1)}K
              </Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleConfirmPayment}
            style={[
              styles.confirmButton,
              (items.length === 0 || !cardDetails?.complete || isPaying) && { opacity: 0.5 },
            ]}
            disabled={items.length === 0 || !cardDetails?.complete || isPaying}
          >
            <Text style={styles.confirmButtonText}>{isPaying ? 'Processing...' : 'Confirm Payment'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function PaymentScreen() {
  const [publishableKey, setPublishableKey] = useState('');
  const [isStripeReady, setIsStripeReady] = useState(false);

  const loadStripeKey = useCallback(async () => {
    setIsStripeReady(false);
    try {
      const response = await apiService.getStripePublicKey();
      const key = response.data?.data?.publicKey;
      if (!key) {
        throw new Error('Stripe public key is missing.');
      }

      setPublishableKey(key);
    } catch (error) {
      console.error('Failed to load Stripe key:', error);
      setPublishableKey('');
      Alert.alert('Stripe Error', 'Unable to initialize Stripe. Please try again.');
    } finally {
      setIsStripeReady(true);
    }
  }, []);

  useEffect(() => {
    loadStripeKey();
  }, [loadStripeKey]);

  if (!isStripeReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text style={styles.loadingText}>Loading secure payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!publishableKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text style={styles.loadingText}>Stripe is unavailable right now.</Text>
          <TouchableOpacity onPress={loadStripeKey} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <PaymentScreenContent />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: colors.dark,
  },
  title: {
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.card,
    alignItems: 'center',
  },
  pinIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pinIcon: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  editText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  carImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  emojiPlaceholder: {
    fontSize: 40,
  },
  summaryInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carCategory: {
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  carName: {
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashIcon: {
    width: 16,
    height: 16,
    tintColor: '#FF4444',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  star: {
    fontSize: 10,
    marginRight: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginRight: 4,
  },
  reviews: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  price: {
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderStyle: 'dashed',
  },
  emptyCartText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  shopNow: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: theme.fontWeights.bold,
  },
  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stripeCardContainer: {
    borderRadius: theme.borderRadius.card,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  cardHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  cardField: {
    width: '100%',
    height: 52,
  },
  voucherSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  voucherInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  voucherIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
    marginRight: 12,
  },
  voucherTextInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
    height: 40,
  },
  applyButton: {
    backgroundColor: colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  orderSummary: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    paddingTop: 16,
    marginTop: 4,
  },
  totalLabelText: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  totalPriceText: {
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 54 : 44,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
  },
});
