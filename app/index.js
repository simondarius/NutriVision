import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const cameraRef = useRef(null);
  const [isPictureTaken, setIsPictureTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      
      const galleryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);
  async function takePicture() {
    if (hasCameraPermission && cameraRef.current) {
      const { uri, canceled } = await cameraRef.current.takePictureAsync();
      if (canceled) {
        console.log('Anulat de utilizator');
        return;
      }
      console.log('Picture taken:', uri);
      setIsPictureTaken(true);
      setCapturedImage(uri);
      await uploadImageToServer(uri);
    }
  }

  async function uploadImageToServer(imageUri) {
    if (imageUri) {
      const apiUrl = 'http://localhost:5000/upload';
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
        toggleModal();
      } catch (error) {
        console.error('Error uploading image:', error);
        console.log('Response:', error.response);
      }
    }
  }

  async function pickImageFromGallery() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {

        console.log('Image picked from gallery:', result.uri);//Damn aici bagam logica cum sa scaneze ai imaginea selectata
      }
    } catch (error) {
      console.error('Eroare la deschiderea galeriei:', error);
    }
  }
  function toggleModal() {
    setIsModalVisible(!isModalVisible);
  }


  async function openGallery() {
    try {
      if (hasGalleryPermission) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
        });
        if (result.canceled) {
          console.log('Anulat de utilizator');
          return;
        }
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
          <TouchableOpacity onPress={pickImageFromGallery}>
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
