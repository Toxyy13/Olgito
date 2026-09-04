import React from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

interface Props {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

// Brend logo (makaze u šarenom prstenu) — koristi se svuda gde se pojavljuje
// "Olgito" zaglavlje, umesto generičkog kruga sa slovom "O".
export function Logo({ size = 44, style }: Props) {
  return (
    <Image
      source={require('../../assets/icon.png')}
      style={[{ width: size, height: size, borderRadius: size / 2 }, styles.image, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: { overflow: 'hidden' },
});
