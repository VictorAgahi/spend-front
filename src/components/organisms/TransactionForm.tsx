import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { EventTag } from '../molecules/TransactionItem';
import { AddressAutocomplete } from '../molecules/AddressAutocomplete';

interface TransactionFormProps {
  onSubmit: (data: { name: string; price: number; tag: EventTag; address: string }) => void;
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [tag, setTag] = useState<EventTag>(EventTag.FOOD);
  const [address, setAddress] = useState('');

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  const handleSubmit = () => {
    if (!name || !price || !address) return;
    onSubmit({
      name,
      price: parseFloat(price),
      tag,
      address,
    });
    setName('');
    setPrice('');
    setAddress('');
    handleClose();
  };

  const tagOptions = Object.keys(EventTag)
    .filter(key => isNaN(Number(key)))
    .map(key => ({ label: key, value: EventTag[key as keyof typeof EventTag] }));

  return (
    <>
      <Button
        label="New Transaction"
        onPress={handleOpen}
        variant="primary"
        fullWidth
      />

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Typography variant="h2">Add Transaction</Typography>
              <TouchableOpacity onPress={handleClose}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input
                label="Name"
                placeholder="Market shopping..."
                value={name}
                onChangeText={setName}
              />
              <Input
                label="Price"
                placeholder="24.50"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
              <AddressAutocomplete
                label="Address"
                placeholder="123 Street Name..."
                value={address}
                onChange={setAddress}
              />

              <Typography variant="caption" color={colors.textMuted} style={styles.tagLabel}>
                Category
              </Typography>
              <View style={styles.tagGrid}>
                {tagOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.tagItem,
                      tag === option.value && styles.tagSelected
                    ]}
                    onPress={() => setTag(option.value)}
                  >
                    <Typography
                      variant="caption"
                      color={tag === option.value ? colors.white : colors.textMuted}
                    >
                      {option.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.footer}>
                <Button
                  label="Create Transaction"
                  onPress={handleSubmit}
                  loading={isLoading}
                  fullWidth
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tagLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tagItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
