import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, theme } from '@/constants/colors';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorBox}>
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>Something went wrong</Text>
            <Text style={styles.details}>{this.state.error?.message}</Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  errorBox: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 24,
    alignItems: 'center',
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    color: colors.danger,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: theme.fontWeights.semibold,
    color: colors.dark,
    marginBottom: 16,
  },
  details: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.pill,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
    color: colors.dark,
  },
});
