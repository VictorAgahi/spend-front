import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Container } from '../src/components/atoms/Container';
import { Typography } from '../src/components/atoms/Typography';
import { Button } from '../src/components/atoms/Button';
import { colors, spacing } from '../src/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <Container padding="xl" style={styles.container}>
      <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.hero}>
        <View style={styles.logoCircle}>
          <Typography variant="h1" color={colors.white} style={styles.logoText}>$</Typography>
        </View>
        <Typography variant="h1" center style={styles.title}>
          SpendApp
        </Typography>
        <Typography variant="body" center color={colors.textMuted} style={styles.subtitle}>
          Track your expenses effortlessly with style and precision.
        </Typography>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(1000)} style={styles.footer}>
        <Button
          label="Sign In"
          onPress={() => router.push('/(auth)/login')}
          fullWidth
          style={styles.button}
        />
        <Button
          label="Create Account"
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          fullWidth
        />
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    paddingHorizontal: spacing.xl,
  },
  footer: {
    width: '100%',
    paddingBottom: spacing.xxl,
  },
  button: {
    marginBottom: spacing.md,
  },
});
