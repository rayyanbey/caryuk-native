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
  Platform,
  StatusBar,
  Image,
  Modal,
  BackHandler,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useCarStore } from '@/store/carStore';
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
  const [activeBannerIndex, setActiveBannerIndex] = useState(1); 
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'profile'>(
    'search'
  );
  
  const bannerRef = useRef<FlatList>(null);

  useEffect(() => {
    const backAction = () => {
      router.push('/home');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

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

  const onBannerScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveBannerIndex(Math.round(index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.headerIconButton}>
            <Image 
              source={require('../../assets/images/arrow_back.png')} 
              style={styles.headerIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={styles.title}>Search</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Promo Banner Carousel */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={PROMO_BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            keyExtractor={(item) => item.id}
            initialScrollIndex={1}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={{ width: width, alignItems: 'center' }}>
                <View style={styles.flashSaleBanner}>
                  <Text style={styles.flashSaleText}>{item.text}</Text>
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

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Image source={require('../../assets/images/search_icon_home.png')} style={styles.searchIconImage} resizeMode="contain" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your favorite cars"
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
                          setIsSearching(true);
                          searchCars(item);
                        }}
                      >
                        <Text style={styles.historyChipText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No search history</Text>
                )}
              </View>

              {/* Popular Posts Section (Scrollable) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popular Posts</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAll}>View all</Text>
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={cars.slice(0, 10)}
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
              </View>
            </>
          ) : (
            <>
              {/* Results Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results ({filteredCars.length})</Text>
                {filteredCars.length > 0 ? (
                  <View style={styles.resultsGrid}>
                    {filteredCars.map((item, index) => (
                      <CarCard 
                        key={item.id || item._id || index} 
                        car={item} 
                        onPress={() => router.push(`/car-detail?id=${item.id || item._id}`)}
                        variant="full"
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No cars found matching "{searchQuery}"</Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterNotice}>Detailed filters coming soon!</Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
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
  headerIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: colors.dark,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  bannerContainer: {
    marginVertical: 12,
  },
  flashSaleBanner: {
    width: BANNER_WIDTH,
    borderRadius: theme.borderRadius.card,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
  },
  flashSaleText: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.pill,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIconImage: {
    width: 20,
    height: 20,
    tintColor: colors.textSecondary,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  filterIconImage: {
    width: 20,
    height: 20,
    tintColor: colors.dark,
    marginLeft: 12,
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
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  historyChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  resultsGrid: {
    gap: 16,
  },
  noResults: {
    paddingVertical: 40,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  filterNotice: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  applyFiltersButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  applyFiltersText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
});
