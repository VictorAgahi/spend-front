import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ShoppingBag,
  Utensils,
  Car,
  Gamepad2,
  Heart,
  Plane,
  Zap,
  MoreHorizontal
} from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Card } from '../atoms/Card';

export enum EventTag {
  FOOD = 0,
  TRANSPORT = 1,
  ENTERTAINMENT = 2,
  SHOPPING = 3,
  HEALTH = 4,
  TRAVEL = 5,
  UTILITIES = 6,
  OTHER = 7,
}

interface TransactionItemProps {
  name: string;
  price: number;
  tag: EventTag;
  createdAt: string;
}

const getTagConfig = (tag: EventTag) => {
  switch (tag) {
    case EventTag.FOOD:
      return { icon: Utensils, label: 'Food', color: '#F87171' };
    case EventTag.TRANSPORT:
      return { icon: Car, label: 'Transport', color: '#60A5FA' };
    case EventTag.ENTERTAINMENT:
      return { icon: Gamepad2, label: 'Entertainment', color: '#A78BFA' };
    case EventTag.SHOPPING:
      return { icon: ShoppingBag, label: 'Shopping', color: '#FBBF24' };
    case EventTag.HEALTH:
      return { icon: Heart, label: 'Health', color: '#F472B6' };
    case EventTag.TRAVEL:
      return { icon: Plane, label: 'Travel', color: '#34D399' };
    case EventTag.UTILITIES:
      return { icon: Zap, label: 'Utilities', color: '#FB923C' };
    default:
      return { icon: MoreHorizontal, label: 'Other', color: '#94A3B8' };
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  name,
  price,
  tag,
  createdAt,
}) => {
  const config = getTagConfig(tag);
  const Icon = config.icon;
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <Card variant="flat" padding="md" style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
        <Icon size={24} color={config.color} />
      </View>
      <View style={styles.details}>
        <Typography variant="h3">{name}</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          {config.label} • {date}
        </Typography>
      </View>
      <View style={styles.amount}>
        <Typography variant="h2" color={colors.primary}>
          -${price.toFixed(2)}
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  amount: {
    alignItems: 'flex-end',
  },
});
