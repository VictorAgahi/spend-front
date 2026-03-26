import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: keyof typeof typography;
  color?: string;
  style?: TextStyle;
  center?: boolean;
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = colors.text,
  style,
  center = false,
  numberOfLines,
}) => {
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        typography[variant],
        { color },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </RNText>
  );
};
