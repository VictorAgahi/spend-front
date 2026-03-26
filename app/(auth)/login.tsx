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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { success } = useNotification();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      await signIn(response.accessToken);
      success('Welcome back!');
      router.replace('/(main)');
    } catch (e: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container scrollable backgroundColor={colors.background}>
      <View style={styles.header}>
        <Typography variant="h1">Welcome Back</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Enter your credentials to access your account.
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

        <TouchableOpacity style={styles.forgotPassword}>
          <Typography variant="caption" color={colors.primary}>
            Forgot password?
          </Typography>
        </TouchableOpacity>

        <Button
          label="Login"
          onPress={handleLogin}
          loading={loading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.footer}>
          <Typography variant="body" color={colors.textMuted}>
            Don't have an account?{' '}
          </Typography>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Typography variant="body" color={colors.primary}>
              Register
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
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
