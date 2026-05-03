import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { colors, theme } from '@/constants/colors';

interface TabBarProps {
  activeTab: 'home' | 'search' | 'favorites' | 'profile';
  onTabPress: (tab: 'home' | 'search' | 'favorites' | 'profile') => void;
}

const TabIcons = {
  home: require('../assets/images/home_icon.png'),
  search: require('../assets/images/search_icon_home.png'),
  favorites: require('../assets/images/heart_icon_home.png'),
  profile: require('../assets/images/profile_icon_home.png'),
};

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(Object.keys(TabIcons) as Array<keyof typeof TabIcons>).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabPress(tab)}
              style={styles.tabItem}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Image 
                  source={TabIcons[tab]} 
                  style={[
                    styles.icon, 
                    { tintColor: isActive ? colors.primary : colors.white },
                    (tab === 'search' || tab === 'favorites') && { width: 26, height: 26 },
                    tab === 'favorites' && { transform: [{ translateY: 2 }] }
                  ]} 
                  resizeMode="contain" 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 45,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: colors.primary,
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.white,
  },
  icon: {
    width: 22,
    height: 22,
  },
});
