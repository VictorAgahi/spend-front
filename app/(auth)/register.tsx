import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../src/components/atoms/Container';
import { Typography } from '../../src/components/atoms/Typography';
import { Input } from '../../src/components/atoms/Input';
import { Button } from '../../src/components/atoms/Button';
import { colors, spacing } from '../../src/theme';
import { AuthService } from '../../src/services/auth.service';
import { useAuth } from '../../src/providers/auth.provider';
import { useNotification } from '../../src/providers/notification.provider';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { success } = useNotification();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await AuthService.register({ email, password });
      await signIn(response.accessToken);
      success('Account created successfully!');
      router.replace('/(main)');
    } catch (e: any) {
      // Automatic toast already handles via axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container scrollable backgroundColor={colors.background}>
      <View style={styles.header}>
        <Typography variant="h1">Create Account</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Join us and start tracking your expenses.
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Email Address"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          label="Register"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.footer}>
          <Typography variant="body" color={colors.textMuted}>
            Already have an account?{' '}
          </Typography>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Typography variant="body" color={colors.primary}>
              Sign In
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
