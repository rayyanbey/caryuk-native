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
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCarStore } from '@/store/carStore';
import { CarCard, CARD_WIDTH, CARD_SPACING } from '@/components/CarCard';
import { TabBar } from '@/components/TabBar';

export default function SearchScreen() {
  const router = useRouter();
  const { searchCars, filteredCars, cars, searchHistory, addSearchHistory, clearSearchHistory } = useCarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'search'
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchCars(query);
  };

  const handleSubmitSearch = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
    }
  };

  const handleTabPress = (tab: 'home' | 'search' | 'favorites' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'home') {
      router.push('/home');
    } else if (tab === 'favorites') {
      router.push('/favorites');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <View style={{ width: 24 }} />
          <Text style={styles.title}>Search</Text>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Flash Sale Banner */}
        <View style={styles.flashSaleBanner}>
          <Text style={styles.flashSaleText}>Flash sale in today 50%.</Text>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Image source={require('../../assets/images/search_icon_home.png')} style={styles.searchIconImage} resizeMode="contain" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your favorites car"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmitSearch}
            returnKeyType="search"
          />
          <TouchableOpacity>
            <Image source={require('../../assets/images/filter_icon_home.png')} style={styles.filterIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {searchQuery.length === 0 ? (
            <>
              {/* History Section */}
              <View style={styles.section}>
                <View style={styles.historyHeader}>
                  <Text style={styles.sectionTitle}>History</Text>
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Image source={require('../../assets/images/trash_icon.png')} style={styles.trashIconImage} resizeMode="contain" />
                  </TouchableOpacity>
                </View>

                {searchHistory.length > 0 ? (
                  <View style={styles.historyChips}>
                    {searchHistory.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.historyChip}
                        onPress={() => {
                          setSearchQuery(item);
                          searchCars(item);
                        }}
                      >
                        <Text style={styles.historyChipText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noResultsText}>No recent searches</Text>
                )}
              </View>

              {/* Popular Products */}
              <Text style={styles.sectionTitle}>Popular Products</Text>
              <FlatList
                data={cars}
                keyExtractor={(item, index) => item._id || item.id || index.toString()}
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
            </>
          ) : filteredCars.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No cars found</Text>
            </View>
          ) : (
            <>
              {/* Search Results */}
              <Text style={styles.sectionTitle}>Search Results</Text>
              <FlatList
                data={filteredCars}
                keyExtractor={(item, index) => item._id || item.id || index.toString()}
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
            </>
          )}

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
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  menuIcon: {
    fontSize: 20,
  },
  flashSaleBanner: {
    backgroundColor: colors.mediumGray,
    marginHorizontal: 20,
    borderRadius: theme.borderRadius.card,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  flashSaleText: {
    fontSize: 14,
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
  searchBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIconImage: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  filterIconImage: {
    width: 20,
    height: 20,
    tintColor: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
    marginBottom: 12,
  },
  trashIconImage: {
    width: 20,
    height: 20,
    tintColor: colors.textSecondary,
  },
  historyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyChip: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  historyChipText: {
    fontSize: 12,
    color: colors.dark,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
