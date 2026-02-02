import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function EmptyState({
  title,
  description,
  ctaLabel,
  onPress,
  actionLabel,
  onAction,
  testID,
}) {
  return (
    <View style={styles.container} testID={testID || 'empty-state'}>
      {title ? <Text variant="titleMedium" style={styles.title}>{title}</Text> : null}
      {description ? <Text variant="bodyMedium" style={styles.description}>{description}</Text> : null}
      {ctaLabel && onPress ? (
        <Button mode="contained" onPress={onPress} style={styles.button} accessibilityLabel={ctaLabel}>
          {ctaLabel}
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="text" onPress={onAction} style={styles.secondary} accessibilityLabel={actionLabel}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginTop: 4,
    borderRadius: 12,
  },
  secondary: {
    marginTop: 4,
  },
});
