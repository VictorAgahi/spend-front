import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { AddressService, AddressSuggestion } from '../../services/address.service';
import { Input } from '../atoms/Input';
import { Typography } from '../atoms/Typography';
import { colors, spacing } from '../../theme';
import { MapPin } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AddressInputProps {
  label: string;
  value: string;
  onChange: (address: string) => void;
  error?: string;
  placeholder?: string;
}

export const AddressAutocomplete: React.FC<AddressInputProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = "Start typing your address..."
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length >= 3 && query !== value) {
        setLoading(true);
        const results = await AddressService.search(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query, value]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const cityName = suggestion.display_name;
    setQuery(cityName);
    onChange(cityName);
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <Input
        label={label}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (text === '') onChange('');
        }}
        placeholder={placeholder}
        error={error}
        rightElement={loading ? <ActivityIndicator size="small" color={colors.primary} /> : <MapPin size={20} color={colors.textMuted} />}
      />

      {showDropdown && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.dropdown}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <MapPin size={16} color={colors.primary} style={styles.pinIcon} />
                <Typography variant="body" style={styles.suggestionText} numberOfLines={1}>
                  {item.display_name}
                </Typography>
              </TouchableOpacity>
            )}
            style={styles.list}
            scrollEnabled={false}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100, // Make sure dropdown appears above other fields
    position: 'relative',
    marginBottom: spacing.md,
  },
  dropdown: {
    position: 'absolute',
    top: 85, // Position below the input label/input
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 101,
  },
  list: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  pinIcon: {
    marginRight: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
  },
});
