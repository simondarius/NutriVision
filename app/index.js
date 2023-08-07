import React, { useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

export default function App() {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);
  const [isPictureTaken, setIsPictureTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  async function takePicture() {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      console.log('Picture taken:', uri);
      setIsPictureTaken(true);
      setCapturedImage(uri);
      await uploadImageToServer(uri);
    }
  }

  async function uploadImageToServer(imageUri) {
    if (imageUri) {
      const apiUrl = 'http://localhost:5000/upload';//Carlos aici daca vrei schimba adresa unde ai backendu
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      try {
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Image uploaded:', response.data);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef} />
      <View style={styles.buttonContainer}>
        <View style={styles.buttonSecondary}>
          <TouchableOpacity onPress={() => console.log('Jurnal')}>
            <FontAwesome name="book" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonPrimary}>
          <TouchableOpacity onPress={takePicture}>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonSecondary}>
          <TouchableOpacity onPress={() => console.log('Galerie')}>
            <FontAwesome name="photo" size={24} color="white" /> 
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  buttonPrimary: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#ffffff',
    backgroundColor: ' #00000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});
