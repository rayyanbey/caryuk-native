/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validateRequired } from '@/utils/validation';
import { showErrorAlert, showSuccessAlert } from '@/utils/errors';

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!validateRequired(email)) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    if (!validateRequired(password)) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      if (result.success) {
        showSuccessAlert('Success', 'Login successful', () => {
          router.replace('/home');
        });
      } else {
        showErrorAlert('Login Failed', result.message || 'Please check your credentials');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      showErrorAlert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Get the API URL from environment
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';
      const baseUrl = apiUrl.replace('/api', '');

      // Open Google OAuth URL
      const googleAuthUrl = `${baseUrl}/api/auth/google`;
      await Linking.openURL(googleAuthUrl);

      // Note: This is a limitation of mobile web auth flow
      // For production, consider using expo-auth-session or similar
      showErrorAlert(
        'Google Login',
        'Google OAuth requires mobile app integration. Please use email/password for now.'
      );
    } catch (error) {
      showErrorAlert('Error', 'Failed to open Google login');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    showErrorAlert(
      'Coming Soon',
      'Facebook login is not yet available. Please use email/password to sign in.'
    );
  };

  const handleTwitterLogin = () => {
    showErrorAlert(
      'Coming Soon',
      'Twitter login is not yet available. Please use email/password to sign in.'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back, Sir!</Text>
            <Text style={styles.subtitle}>
              Not Just Used Cars Smart Choices.{'\n'}Join Now And Start Your
              Search Today.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View>
              <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                <Image source={require('../assets/images/email_icon.png')} style={styles.inputIconImage} resizeMode="contain" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Field */}
            <View>
              <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                <Image source={require('../assets/images/padlock_icon.png')} style={styles.inputIconImage} resizeMode="contain" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                  <Image source={showPassword ? require('../assets/images/eye1_icon.png') : require('../assets/images/eye2_icon.png')} style={styles.visibilityIconImage} resizeMode="contain" />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Create Account Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have account? </Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text style={styles.signupLink}>Create account</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <Text style={styles.divider}>Or</Text>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Image source={require('../assets/images/google_icon.png')} style={styles.socialIconImage} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleFacebookLogin}
                disabled={loading}
              >
                <Image source={require('../assets/images/facebook_icon.png')} style={styles.socialIconImage} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleTwitterLogin}
                disabled={loading}
              >
                <Image source={require('../assets/images/x_icon.png')} style={styles.socialIconImage} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.fontWeights.black,
    color: colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 40,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: colors.lightBorder,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIconImage: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: colors.textSecondary,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  visibilityIconImage: {
    width: 20,
    height: 20,
    tintColor: colors.textSecondary,
  },
  forgotContainer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  forgotText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.black,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupText: {
    color: colors.dark,
    fontSize: 12,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: theme.fontWeights.bold,
    fontSize: 12,
  },
  divider: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconImage: {
    width: 24,
    height: 24,
  },
});
