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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, theme } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword, validateName, validateRequired } from '@/utils/validation';
import { showErrorAlert, showSuccessAlert } from '@/utils/errors';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!validateRequired(name)) {
      setNameError('Name is required');
      isValid = false;
    } else if (!validateName(name)) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }

    if (!validateRequired(email)) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    const passwordValidation = validatePassword(password);
    if (!validateRequired(password)) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.errors[0]);
      isValid = false;
    }

    if (!validateRequired(confirmPassword)) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password.trim() !== confirmPassword.trim()) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Trim all inputs to remove any accidental whitespace
      const result = await signup(
        name.trim(),
        email.trim(),
        password.trim(),
        confirmPassword.trim()
      );
      if (result.success) {
        showSuccessAlert('Success', 'Account created successfully', () => {
          router.replace('/(tabs)');
        });
      } else {
        showErrorAlert('Sign Up Failed', result.message || 'Please try again');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Sign up failed. Please try again.';
      showErrorAlert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start finding your perfect car.</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Field */}
            <View>
              <View style={[styles.inputWrapper, nameError && styles.inputError]}>
                <Image source={require('../assets/images/profile_icon_home.png')} style={styles.inputIconImage} resizeMode="contain" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError('');
                  }}
                  editable={!loading}
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

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

            {/* Confirm Password Field */}
            <View>
              <View style={[styles.inputWrapper, confirmPasswordError && styles.inputError]}>
                <Image source={require('../assets/images/padlock_icon.png')} style={styles.inputIconImage} resizeMode="contain" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  <Image source={showConfirmPassword ? require('../assets/images/eye1_icon.png') : require('../assets/images/eye2_icon.png')} style={styles.visibilityIconImage} resizeMode="contain" />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have account? </Text>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text style={styles.signinLink}>Sign In</Text>
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
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: colors.white,
    fontWeight: theme.fontWeights.black,
    fontSize: 14,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    color: colors.dark,
    fontSize: 12,
  },
  signinLink: {
    color: colors.primary,
    fontWeight: theme.fontWeights.bold,
    fontSize: 12,
  },
});
