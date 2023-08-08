import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Jurnal() {
  return (
    <View style={styles.container}>
      <Text>Muie Dinamo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
