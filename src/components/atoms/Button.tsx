import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, spacing, typography } from '../../theme';
import { Typography } from './Typography';

interface ButtonProps {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primary },
          text: colors.white,
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.surfaceLight },
          text: colors.text,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: colors.primary,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: colors.primary,
        };
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: colors.white,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        commonStyles.container,
        styles.container,
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.6 },
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={styles.text} />
      ) : (
        <Typography
          variant="button"
          color={styles.text}
          style={commonStyles.label}
        >
          {label}
        </Typography>
      )}
    </AnimatedPressable>
  );
};

const commonStyles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  label: {
    fontWeight: '600',
  },
});
