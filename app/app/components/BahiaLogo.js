import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const LOGO_RATIO = 768 / 1052; // Native asset width/height
const DEFAULT_HEIGHT = 150;

export default function BahiaLogo({ width, height, style }) {
  const computedHeight = height ?? (width ? width / LOGO_RATIO : DEFAULT_HEIGHT);
  const computedWidth = width ?? computedHeight * LOGO_RATIO;

  return (
    <View style={[styles.wrapper, { width: computedWidth, height: computedHeight }, style]}>
      <Image
        source={require('../../assets/images/bahia-go-logo.png')}
        style={styles.image}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Bahía Go"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});