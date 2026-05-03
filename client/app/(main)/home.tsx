/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCarStore } from '@/store/carStore';
import { useCartStore } from '@/store/cartStore';
import { CarCard, CARD_WIDTH, CARD_SPACING } from '@/components/CarCard';
import { TabBar } from '@/components/TabBar';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40;
const BANNER_SPACING = 12;

const PROMO_BANNERS = [
  {
    id: '1',
    text: 'Use Code: RAYYAN for 50% off first purchase',
  },
  {
    id: '2',
    text: 'Flash Sale. Use Code CARYUK20 for 20% off till June 1st!',
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { cars, filteredCars, filterByBudget, searchCars, selectedBudget, fetchCars, isLoading } = useCarStore();
  const { getItemCount } = useCartStore();
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'home'
  );
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList>(null);


  const itemCount = getItemCount();

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (user && (!user.location || user.location === 'Location')) {
      fetchLocation();
    }
  }, [user]);

  const fetchLocation = async () => {
    try {
      const response = await axios.get('http://ip-api.com/json');
      if (response.data && response.data.status === 'success') {
        const locationString = `${response.data.city}, ${response.data.country}`;
        updateUser({ location: locationString });
      } else {
        const res2 = await axios.get('https://ipapi.co/json/');
        if (res2.data && res2.data.city) {
          const locationString = `${res2.data.city}, ${res2.data.country_name}`;
          updateUser({ location: locationString });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch live location:', error);
    }
  };

  const handleTabPress = (tab: 'home' | 'search' | 'favorites' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'search') {
      router.push('/search');
    } else if (tab === 'favorites') {
      router.push('/favorites');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  };

  const onBannerScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveBannerIndex(Math.round(index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => Alert.alert('Notifications', 'Coming Soon')} style={styles.headerIconButton}>
              <Image 
                source={require('../../assets/images/bell_icon_home.png')} 
                style={styles.headerIcon} 
                resizeMode="contain" 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/payment')} style={styles.headerIconButton}>
              <Image 
                source={require('../../assets/images/cart_home_icon.png')} 
                style={styles.headerIcon} 
                resizeMode="contain" 
              />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userLocation}>📍 {user?.location || 'Detecting...'}</Text>
            </View>
            <View style={styles.avatar}>
              {user?.avatarUrl ? (
                <Image 
                  source={{ uri: user.avatarUrl }} 
                  style={styles.avatarImage} 
                  resizeMode="cover" 
                />
              ) : (
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
              )}
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Budget Category */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Category</Text>
            </View>

            <View style={styles.budgetContainer}>
              {['Under $30k', 'From $40k-90k'].map((budget) => (
                <TouchableOpacity
                  key={budget}
                  onPress={() => filterByBudget(budget)}
                  style={[
                    styles.budgetPill,
                    selectedBudget === budget && styles.budgetPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.budgetPillText,
                      selectedBudget === budget && styles.budgetPillTextActive,
                    ]}
                  >
                    {budget}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended For You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>

            {!isLoading && filteredCars.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No cars found</Text>
              </View>
            ) : isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <FlatList
                data={filteredCars}
                keyExtractor={(item, index) => item.id || item._id || index.toString()}
                renderItem={({ item }) => (
                  <CarCard 
                    car={item} 
                    onPress={() => router.push(`/car-detail?id=${item.id || item._id}`)}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                snapToAlignment="start"
              />
            )}
          </View>

          {/* Discount Banner Carousel */}
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerRef}
              data={PROMO_BANNERS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onBannerScroll}
              keyExtractor={(item) => item.id}
              initialScrollIndex={0}
              getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={{ width: width, alignItems: 'center' }}>
                  <View style={styles.discountBanner}>
                    <Text style={styles.discountText}>{item.text}</Text>
                  </View>
                </View>
              )}
            />

            <View style={styles.pagination}>
              {PROMO_BANNERS.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    activeBannerIndex === index && styles.dotActive
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Spacer for tab bar */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  userLocation: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  seeAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  budgetContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetPill: {
    flex: 1,
    paddingVertical: 28,
    borderRadius: theme.borderRadius.card,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetPillActive: {
    backgroundColor: colors.primary,
  },
  budgetPillText: {
    fontSize: 14,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
  },
  budgetPillTextActive: {
    color: colors.white,
  },
  bannerContainer: {
    marginBottom: 24,
    position: 'relative',
    marginHorizontal: -20,
  },
  discountBanner: {
    width: BANNER_WIDTH,
    borderRadius: theme.borderRadius.card,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
  },
  discountText: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    textAlign: 'center',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
  noResults: {
    width: CARD_WIDTH * 2 + CARD_SPACING,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    borderStyle: 'dashed',
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
});
