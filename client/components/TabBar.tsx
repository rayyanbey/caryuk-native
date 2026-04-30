import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, theme } from '@/constants/colors';

interface TabBarProps {
  activeTab: 'home' | 'search' | 'favorites' | 'profile';
  onTabPress: (tab: 'home' | 'search' | 'favorites' | 'profile') => void;
}

const TabIcons = {
  home: '🏠',
  search: '🔍',
  favorites: '❤️',
  profile: '👤',
};

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(Object.keys(TabIcons) as Array<keyof typeof TabIcons>).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabPress(tab)}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
          >
            <Text style={styles.icon}>{TabIcons[tab]}</Text>
            {activeTab === tab && (
              <Text style={styles.tabLabel}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.pill,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeTab: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
    color: colors.primary,
    marginTop: 2,
  },
});
