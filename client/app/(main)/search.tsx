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
import { useCarStore } from '@/store/carStore';
import { CarCard } from '@/components/CarCard';
import { TabBar } from '@/components/TabBar';

const searchHistoryData = ['Nissan GTR', 'Toyota Scar', 'Toyota Supra', 'Mazda RX-7', 'Supra MK4', 'Lancer Tokyo'];

export default function SearchScreen() {
  const router = useRouter();
  const { searchCars, filteredCars } = useCarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'search'
  );
  const [history, setHistory] = useState(searchHistoryData);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchCars(query);
  };

  const handleTabPress = (tab: 'home' | 'search' | 'favorites' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'home') {
      router.push('/(main)/home');
    } else if (tab === 'favorites') {
      router.push('/(main)/favorites');
    } else if (tab === 'profile') {
      router.push('/(main)/profile');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
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
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your favorites car"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
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
          {searchQuery.length === 0 && history.length > 0 ? (
            <>
              {/* History Section */}
              <View style={styles.section}>
                <View style={styles.historyHeader}>
                  <Text style={styles.sectionTitle}>History</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.trashIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.historyChips}>
                  {history.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.historyChip}
                      onPress={() => handleSearch(item)}
                    >
                      <Text style={styles.historyChipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : searchQuery.length > 0 && filteredCars.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No cars found</Text>
            </View>
          ) : (
            <>
              {/* Search Results */}
              <Text style={styles.sectionTitle}>Popular Products</Text>
              <FlatList
                data={filteredCars.length > 0 ? filteredCars : filteredCars}
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
  flashSaleBanner: {
    backgroundColor: colors.mediumGray,
    marginHorizontal: 20,
    borderRadius: theme.borderRadius.card,
    height: 90,
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
  trashIcon: {
    fontSize: 18,
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
