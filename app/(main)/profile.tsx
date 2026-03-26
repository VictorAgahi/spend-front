import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { LogOut, User, Bell, Shield, HelpCircle } from 'lucide-react-native';
import { Container } from '../../src/components/atoms/Container';
import { Typography } from '../../src/components/atoms/Typography';
import { Card } from '../../src/components/atoms/Card';
import { useAuth } from '../../src/providers/auth.provider';
import { colors, spacing } from '../../src/theme';

export default function Profile() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    const performLogout = () => signOut();

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to log out?')) {
        await performLogout();
      }
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: performLogout
        },
      ]
    );
  };

  const menuItems = [
    { icon: Bell, label: 'Notifications', color: colors.primary },
    { icon: Shield, label: 'Security', color: colors.secondary },
    { icon: HelpCircle, label: 'Support', color: colors.textMuted },
  ];

  return (
    <Container scrollable padding="lg" backgroundColor={colors.background}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <User color={colors.white} size={64} />
        </View>
        <Typography variant="h1" center style={styles.email}>
          {user?.user?.email}
        </Typography>
        <Typography variant="body" center color={colors.textMuted}>
          Member since {new Date().getFullYear()}
        </Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="h3" style={styles.sectionTitle}>Account Settings</Typography>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Card variant="outline" padding="md" style={styles.logoutCard}>
          <LogOut color={colors.error} size={24} />
          <Typography variant="body" color={colors.error} style={styles.logoutLabel}>
            Log Out
          </Typography>
        </Card>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Typography variant="caption" color={colors.textMuted}>
          SpendApp v1.0.0
        </Typography>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: spacing.xxl,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  email: {
    marginBottom: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.error + '40',
  },
  logoutLabel: {
    marginLeft: spacing.md,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  debugCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.primary + '40',
  }
});
