import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, ViewStyle, StatusBar, Platform } from 'react-native';
import { colors, spacing } from '../../theme';

interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: keyof typeof spacing;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  scrollable = false,
  padding = 'lg',
  backgroundColor = colors.background,
  style,
}) => {
  const content = (
    <View style={[
      styles.content,
      { padding: spacing[padding] },
      Platform.OS === 'web' && styles.webContainer,
      style
    ]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle="light-content" />
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  webContainer: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    marginHorizontal: 'auto',
  },
});
