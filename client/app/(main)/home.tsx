import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useCarStore } from '@/store/carStore';
import { CarCard } from '@/components/CarCard';
import { TabBar } from '@/components/TabBar';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cars, filterByBudget, searchCars, selectedBudget } = useCarStore();
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'home'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabPress = (tab: 'home' | 'search' | 'favorites' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'search') {
      router.push('/(main)/search');
    } else if (tab === 'favorites') {
      router.push('/(main)/favorites');
    } else if (tab === 'profile') {
      router.push('/(main)/profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity>
              <Text style={styles.icon}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 12 }}>
              <Text style={styles.icon}>🔔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userLocation}>📍 {user?.location || 'Location'}</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
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
              <Text style={styles.sectionTitle}>Recommendation For You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={cars}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/(main)/car-detail?id=${item.id}`)}
                >
                  <CarCard car={item} />
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
            />
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
  headerCenter: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  userLocation: {
    fontSize: 12,
    color: colors.primary,
  },
  icon: {
    fontSize: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: colors.mediumGray,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  filterIcon: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
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
    height: 90,
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
