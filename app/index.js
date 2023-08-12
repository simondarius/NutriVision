import React, { useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);
  const [isPictureTaken, setIsPictureTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

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
      const apiUrl = 'http://simondarius.pythonanywhere.com/';
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
  
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json', 
            'Content-Type': 'multipart/form-data', 
          },
          body: formData,
        });
        const responseData = await response.json();
        if (responseData['response']=='OK') {
          console.log('Image uploaded!',responseData);
        } else {
          console.error('Error uploading image. Server:', responseData);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  }

  async function openGallery() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const album = await MediaLibrary.getAlbumAsync('Camera');
        if (album) {
          const media = await MediaLibrary.getAssetsAsync({ album: album.id });
          if (media.assets.length > 0) {
            MediaLibrary.openAsset(media.assets[0]);
          } else {
            console.log('Galeria este goală.');
          }
        } else {
          console.log('Albumul nu a fost găsit.');
        }
      } else {
        console.log('Permisiunea pentru galerie nu a fost acordată.');
      }
    } catch (error) {
      console.error('Eroare la deschiderea galeriei:', error);
    }
  }

  function toggleModal() {
    setIsModalVisible(!isModalVisible);
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef} />
      <View style={styles.buttonContainer}>
        <View style={styles.buttonSecondary}>
          <TouchableOpacity onPress={() => navigation.navigate('Jurnal')}>
            <FontAwesome name="book" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonPrimary}>
          <TouchableOpacity onPress={takePicture}>
            <FontAwesome name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonSecondary}>
          <TouchableOpacity onPress={openGallery}>
            <FontAwesome name="photo" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={isModalVisible} transparent>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Imaginea a fost încărcată cu succes!</Text>
          <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Închide</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'black',
  },
});
