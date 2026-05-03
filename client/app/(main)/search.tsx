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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCarStore } from '@/store/carStore';
import { CarCard, CARD_WIDTH, CARD_SPACING } from '@/components/CarCard';
import { TabBar } from '@/components/TabBar';

export default function SearchScreen() {
  const router = useRouter();
  const { 
    searchCars, 
    filteredCars, 
    cars, 
    searchHistory, 
    addSearchHistory, 
    clearSearchHistory,
    selectedBudget,
    selectedCategory,
    selectedFuelType,
    selectedTransmission,
    applyFilters,
    clearFilters
  } = useCarStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'search'
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(false);
      searchCars('');
    }
  };

  const handleSubmitSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchCars(searchQuery.trim());
      addSearchHistory(searchQuery.trim());
    } else {
      setIsSearching(false);
      searchCars('');
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
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Image source={require('../../assets/images/filter_icon_home.png')} style={styles.filterIconImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {!isSearching ? (
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
                          setIsSearching(true);
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

              {/* Popular Products / Filtered Results */}
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedBudget || selectedCategory || selectedFuelType || selectedTransmission ? 'Filtered Results' : 'Popular Products'}
                </Text>
                {(selectedBudget || selectedCategory || selectedFuelType || selectedTransmission) && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={styles.clearText}>Clear all filters</Text>
                  </TouchableOpacity>
                )}
              </View>

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
                ListEmptyComponent={() => (
                  <View style={styles.emptyResults}>
                    <Text style={styles.noResultsText}>No matches found</Text>
                  </View>
                )}
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
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Price Range */}
              <Text style={styles.filterGroupTitle}>Price Range</Text>
              <View style={styles.filterOptions}>
                {['Under $20k', '$20k - $50k', '$50k - $100k', 'Above $100k'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterOption, selectedBudget === item && styles.filterOptionActive]}
                    onPress={() => applyFilters(selectedCategory, selectedBudget === item ? '' : item, selectedFuelType, selectedTransmission)}
                  >
                    <Text style={[styles.filterOptionText, selectedBudget === item && styles.filterOptionTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Car Type */}
              <Text style={styles.filterGroupTitle}>Car Type</Text>
              <View style={styles.filterOptions}>
                {['Sedan', 'SUV', 'Truck', 'Hatchback'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterOption, selectedCategory === item && styles.filterOptionActive]}
                    onPress={() => applyFilters(selectedCategory === item ? '' : item, selectedBudget, selectedFuelType, selectedTransmission)}
                  >
                    <Text style={[styles.filterOptionText, selectedCategory === item && styles.filterOptionTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fuel Type */}
              <Text style={styles.filterGroupTitle}>Fuel Type</Text>
              <View style={styles.filterOptions}>
                {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterOption, selectedFuelType === item && styles.filterOptionActive]}
                    onPress={() => applyFilters(selectedCategory, selectedBudget, selectedFuelType === item ? '' : item, selectedTransmission)}
                  >
                    <Text style={[styles.filterOptionText, selectedFuelType === item && styles.filterOptionTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Transmission */}
              <Text style={styles.filterGroupTitle}>Transmission</Text>
              <View style={styles.filterOptions}>
                {['Auto', 'Manual'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterOption, selectedTransmission === item && styles.filterOptionActive]}
                    onPress={() => applyFilters(selectedCategory, selectedBudget, selectedFuelType, selectedTransmission === item ? '' : item)}
                  >
                    <Text style={[styles.filterOptionText, selectedTransmission === item && styles.filterOptionTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.clearAllBtn} 
                onPress={() => { clearFilters(); setShowFilters(false); }}
              >
                <Text style={styles.clearAllBtnText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyBtn} 
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyBtnText}>Show Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    tintColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clearText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 12,
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
  emptyResults: {
    width: CARD_WIDTH,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: colors.dark,
  },
  modalBody: {
    flex: 1,
  },
  filterGroupTitle: {
    fontSize: 15,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: theme.fontWeights.medium,
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  clearAllBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    alignItems: 'center',
  },
  clearAllBtnText: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.white,
  },
});
