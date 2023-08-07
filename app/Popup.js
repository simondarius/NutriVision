import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Popup = ({ onClose }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.modalText}>Poza a fost făcută!</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.modalButton}>Închide</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    height: 200,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default Popup;
