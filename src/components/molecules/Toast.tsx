import React, { useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { AlertCircle, CheckCircle2, XCircle, Info, X } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import { Typography } from '../atoms/Typography';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 40, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const getConfig = () => {
    switch (type) {
      case 'error': return { icon: XCircle, color: colors.error, bg: '#FEE2E2' };
      case 'success': return { icon: CheckCircle2, color: colors.success, bg: '#DCFCE7' };
      case 'warning': return { icon: AlertCircle, color: colors.warning, bg: '#FEF3C7' };
      case 'info': return { icon: Info, color: colors.primary, bg: '#DBEAFE' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Animated.View style={[
      styles.container, 
      { 
        opacity, 
        transform: [{ translateY }],
        backgroundColor: colors.surface,
        borderColor: config.color,
      }
    ]}>
      <View style={[styles.iconBox, { backgroundColor: config.color + '20' }]}>
        <Icon size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <Typography variant="caption" color={config.color} style={styles.typeLabel}>
          {type.toUpperCase()}
        </Typography>
        <Typography variant="body" color={colors.text} style={styles.message}>
          {message}
        </Typography>
      </View>
      <X size={18} color={colors.textMuted} onPress={handleClose} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  typeLabel: {
    fontWeight: '700',
    fontSize: 10,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
  },
});
