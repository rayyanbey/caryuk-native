import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCarStore } from '@/store/carStore';
import { CarCard, CARD_WIDTH, CARD_SPACING } from '@/components/CarCard';
import { TabBar } from '@/components/TabBar';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { cars, filterByBudget, searchCars, selectedBudget, fetchCars, isLoading } = useCarStore();
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'home'
  );

  useEffect(() => {
    fetchCars();
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    if (!user?.location || user?.location === 'Location') {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        if (response.data && response.data.city && response.data.country_name) {
          const locationString = `${response.data.city}, ${response.data.country_name}`;
          updateUser({ location: locationString });
        }
      } catch (error) {
        console.warn('Failed to fetch live location:', error);
      }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => Alert.alert('Notifications', 'Coming Soon')}>
            <Image 
              source={require('../../assets/images/bell_icon_home.png')} 
              style={styles.bellIconOnly} 
              resizeMode="contain" 
            />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userLocation}>📍 {user?.location || 'Detecting...'}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
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
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
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

            {isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <FlatList
                data={cars}
                keyExtractor={(item, index) => item.id || item._id || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => router.push(`/car-detail?id=${item.id}`)}
                  >
                    <CarCard car={item} />
                  </TouchableOpacity>
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

          {/* Discount Banner */}
          <View style={styles.discountBanner}>
            <Text style={styles.discountText}>Get discount in 50%</Text>
            <View style={styles.pagination}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
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
    backgroundColor: colors.lightGray,
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
  bellIconOnly: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: colors.mediumGray,
  },
  budgetPillActive: {
    backgroundColor: colors.primary,
  },
  budgetPillText: {
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
  },
  budgetPillTextActive: {
    color: colors.white,
  },
  discountBanner: {
    backgroundColor: colors.placeholder,
    borderRadius: theme.borderRadius.card,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  discountText: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginBottom: 8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 12,
  },
});
