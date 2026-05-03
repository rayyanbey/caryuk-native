/* eslint-disable import/no-unresolved */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCarStore } from '@/store/carStore';
import { useCartStore } from '@/store/cartStore';

export default function CarDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const carIdParam = params.id as string | string[] | undefined;
  const carId = Array.isArray(carIdParam) ? carIdParam[0] : (carIdParam || '');
  const { cars, isFavorite, toggleFavorite } = useCarStore();
  const { addToCart } = useCartStore();

  const car = cars.find((c) => c.id === carId);
  const [selectedTab, setSelectedTab] = useState('description');
  const favorited = car ? isFavorite(car.id) : false;

  if (!car) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Car not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const specItems = [
    { icon: '📏', label: car.mileage },
    { icon: '🪑', label: `${car.seats} Seat` },
    { icon: '⛽', label: car.fuelType },
    { icon: '⚙️', label: car.transmission },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Car Detail</Text>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
        </View>

        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <View style={styles.carousel}>
            <Text style={styles.carouselEmoji}>{car.image}</Text>
            <TouchableOpacity style={styles.shareIcon}>
              <Text>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heartIcon}>
              <Text>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Car Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.category}>{car.category}</Text>

          <View style={styles.headerRow}>
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.price}>${(car.price / 1000).toFixed(0)}K</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{car.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({car.reviews} Reviews)</Text>
          </View>

          {/* Spec Icons */}
          <View style={styles.specRow}>
            {specItems.map((item, index) => (
              <View key={index} style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Text style={styles.specIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.specLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabSelector}>
            {['description', 'features', 'vehicle-info'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    selectedTab === tab && styles.tabButtonTextActive,
                  ]}
                >
                  {tab === 'vehicle-info' ? 'Vehicle Info' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          {selectedTab === 'description' && (
            <View style={styles.tabContent}>
              <Text style={styles.descriptionText}>{car.description}</Text>
              <TouchableOpacity>
                <Text style={styles.readMore}>Read More...</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Owner Card */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerAvatarText}>{car.owner.avatar}</Text>
              </View>
              <View>
                <Text style={styles.ownerName}>{car.owner.name}</Text>
                <Text style={styles.ownerRole}>{car.owner.role}</Text>
              </View>
            </View>

            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.actionIcon}>
                <Text>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}>
                <Text>☎️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={() => toggleFavorite(car.id)}
          style={[
            styles.actionButton,
            favorited && styles.actionButtonActive,
          ]}
        >
          <Text style={styles.actionButtonIcon}>❤️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonIcon}>🛒</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            addToCart(car);
            router.push('/payment');
          }}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.pill,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
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
  menuIcon: {
    fontSize: 20,
  },
  carouselContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  carousel: {
    backgroundColor: colors.mediumGray,
    borderRadius: theme.borderRadius.card,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  carouselEmoji: {
    fontSize: 80,
  },
  shareIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 20,
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 50,
    fontSize: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.placeholder,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    color: colors.primary,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carName: {
    fontSize: 22,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  price: {
    fontSize: 18,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginRight: 4,
  },
  reviews: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  specItem: {
    alignItems: 'center',
    flex: 1,
  },
  specIcon: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.icon,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  specIconText: {
    fontSize: 20,
  },
  specLabel: {
    fontSize: 10,
    color: colors.dark,
    textAlign: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    color: colors.dark,
    fontWeight: theme.fontWeights.semibold,
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  tabContent: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: theme.fontWeights.bold,
  },
  ownerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.card,
    padding: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerAvatarText: {
    fontSize: 16,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  ownerRole: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    gap: 12,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.card,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#FFE0E0',
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkoutButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
    fontSize: 14,
  },
});
