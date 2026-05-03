/* eslint-disable import/no-unresolved */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { icon: '✉️', label: 'Email', value: 'paul@example.com', bgColor: colors.dark },
  { icon: '☎️', label: 'Phone Number', value: '+1 234 567 8900' },
  { icon: '🔐', label: 'Privacy Policy', value: '' },
  { icon: '❓', label: 'FAQs', value: '' },
  { icon: '⚙️', label: 'Settings', value: '' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
            <TouchableOpacity style={styles.editBadge}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Paul Walker'}</Text>
          <Text style={styles.userHandle}>
            @{user?.email?.split('@')[0] || 'paulwalkerreals'}
          </Text>
        </View>

        {/* Menu List */}
        <View style={styles.menuSection}>
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.label}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  item.bgColor === colors.dark && styles.menuItemActive,
                ]}
              >
                <Text style={styles.menuIcon2}>{item.icon}</Text>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 13,
    color: colors.primary,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  menuItem: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemActive: {
    backgroundColor: colors.dark,
  },
  menuIcon2: {
    fontSize: 16,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
    fontSize: 14,
  },
});
