/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Alert,
  BackHandler,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/service/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, syncProfile, isLoading } = useAuthStore();
  
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/sign-in');
          }
        },
      ]
    );
  };

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const result = await syncProfile({ phone: newPhone.trim() });
    if (result.success) {
      setIsPhoneModalVisible(false);
      Alert.alert('Success', 'Phone number updated successfully');
    } else {
      Alert.alert('Error', result.message || 'Failed to update phone number');
    }
  };

  const handleEditPhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload your profile picture.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const selectedImage = result.assets[0];
      
      try {
        setIsUploading(true);
        
        // Prepare form data
        const formData = new FormData();
        const filename = selectedImage.uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        
        // @ts-ignore
        formData.append('avatar', {
          uri: selectedImage.uri,
          name: filename,
          type: type,
        });

        // Upload to server
        const response = await apiService.uploadAvatar(formData);
        
        if (response.data.success) {
          const avatarUrl = response.data.data.url;
          // Sync with user profile
          await syncProfile({ avatarUrl });
          Alert.alert('Success', 'Profile picture updated successfully');
        } else {
          Alert.alert('Error', 'Failed to upload photo');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'An unexpected error occurred during upload');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Your data is secured with end-to-end encryption. We never share your car listings or personal info with third parties without your consent.');
  };

  const handleContact = () => {
    Alert.alert('Contact Us', 'Need help? Email us at support@caryuk.com or call our 24/7 hotline at +1 (800) CARYUK-HELP.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* AppBar */}
          <View style={styles.appBar}>
            <TouchableOpacity onPress={() => router.push('/home')} style={styles.headerIconButton}>
              <Image 
                source={require('../../assets/images/arrow_back.png')} 
                style={styles.headerIcon} 
                resizeMode="contain" 
              />
            </TouchableOpacity>
            <Text style={styles.title}>My Profile</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {isUploading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : user?.avatarUrl ? (
                  <Image 
                    source={{ uri: user.avatarUrl }} 
                    style={styles.avatarImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.editBadge} onPress={handleEditPhoto} disabled={isUploading}>
                <Image 
                  source={require('../../assets/images/edit_icon.png')} 
                  style={styles.editIcon} 
                  tintColor={colors.white}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          </View>

          {/* Menu List */}
          <View style={styles.menuSection}>
            <View style={[styles.menuItem, { opacity: 0.8 }]}>
              <View style={styles.iconBox}>
                <Image source={require('../../assets/images/email_icon.png')} style={styles.menuAsset} resizeMode="contain" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Email</Text>
                <Text style={styles.menuValue}>{user?.email || 'Not set'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => setIsPhoneModalVisible(true)}>
              <View style={styles.iconBox}>
                <Image source={require('../../assets/images/profile_icon_home.png')} style={styles.menuAsset} resizeMode="contain" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Phone Number</Text>
                <Text style={styles.menuValue}>{user?.phone || 'Not set'}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
              <View style={styles.iconBox}>
                <Image source={require('../../assets/images/padlock_icon.png')} style={styles.menuAsset} resizeMode="contain" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Privacy Policy</Text>
                <Text style={styles.menuValue}>View our terms & conditions</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleContact}>
              <View style={styles.iconBox}>
                <Image source={require('../../assets/images/bell_icon_home.png')} style={styles.menuAsset} resizeMode="contain" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Contact Us</Text>
                <Text style={styles.menuValue}>24/7 Support for your car</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Phone Modal */}
      <Modal
        visible={isPhoneModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setIsPhoneModalVisible(false);
                  setNewPhone(user?.phone || '');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleUpdatePhone}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Global Loading Overlay */}
      {isLoading && !isPhoneModalVisible && !isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
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
  scrollContent: {
    paddingBottom: 20,
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
  avatarSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  editIcon: {
    width: 14,
    height: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    marginBottom: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuAsset: {
    width: 20,
    height: 20,
    tintColor: colors.dark,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
  menuValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FFF0F0',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  logoutButtonText: {
    color: colors.danger,
    fontWeight: theme.fontWeights.bold,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.dark,
    borderWidth: 1,
    borderColor: colors.mediumGray,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: theme.fontWeights.bold,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.bold,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
