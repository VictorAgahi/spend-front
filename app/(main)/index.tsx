import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Container } from '../../src/components/atoms/Container';
import { Typography } from '../../src/components/atoms/Typography';
import { Card } from '../../src/components/atoms/Card';
import { TransactionForm } from '../../src/components/organisms/TransactionForm';
import { TransactionItem } from '../../src/components/molecules/TransactionItem';
import { TransactionService } from '../../src/services/transaction.service';
import { colors, spacing } from '../../src/theme';
import { useAuth } from '../../src/providers/auth.provider';
import { CreateTransactionRequest, TransactionResponse } from '../../src/types/transaction.types';
import { EventTag } from '../../src/components/molecules/TransactionItem';
import { geocodingConfig } from '../../src/services/geocoding.config';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await TransactionService.getTransactions();
      const sorted = response.transactions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    geocodingConfig.init();
    fetchTransactions();
  }, []);

  const handleCreateTransaction = async (data: Omit<CreateTransactionRequest, 'userId' | 'provider'>) => {
    if (!user?.user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }
    setCreating(true);
    try {
      await TransactionService.createTransaction({
        ...data,
        provider: geocodingConfig.getProvider(),
      });
      fetchTransactions();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      Alert.alert('Error', error.response?.data?.message || 'Could not create transaction');
    } finally {
      setCreating(false);
    }
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <Container padding="md">
      <View style={styles.header}>
        <View>
          <Typography variant="body" color={colors.textMuted}>Hello,</Typography>
          <Typography variant="h1">{user?.user?.email.split('@')[0]}</Typography>
        </View>
        <Typography variant="caption" color={colors.textMuted}>{new Date().toLocaleDateString()}</Typography>
      </View>

      <Card variant="elevated" padding="lg" style={styles.balanceCard}>
        <Typography variant="body" color={colors.white} style={{ opacity: 0.8 }}>Total Spending</Typography>
        <Typography variant="h1" color={colors.white} style={styles.balanceAmount}>
          ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Card>

      <View style={styles.actionSection}>
        <Typography variant="h3" style={styles.sectionTitle}>Quick Access</Typography>
        <TransactionForm onSubmit={handleCreateTransaction} isLoading={creating} />
      </View>

      <View style={styles.listSection}>
        <Typography variant="h3" style={styles.sectionTitle}>Recent Transactions</Typography>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              name={item.name}
              price={item.price}
              tag={item.tag}
              createdAt={item.createdAt}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchTransactions();
            }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="body" color={colors.textMuted}>No transactions yet.</Typography>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 40,
    marginBottom: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    marginBottom: spacing.xl,
    borderRadius: 24,
  },
  balanceAmount: {
    fontSize: 40,
    marginTop: spacing.xs,
  },
  actionSection: {
    marginBottom: spacing.xl,
  },
  listSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
