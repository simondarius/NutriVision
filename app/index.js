import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
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
  const [calorieInfo, setCalorieInfo] = useState(null);
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
      const { uri, cancelled } = await cameraRef.current.takePictureAsync();
      if (cancelled) {
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
        if (responseData['response'] === 'OK') {
          console.log('Image uploaded!', responseData);
          setCalorieInfo(responseData);
          toggleModal();
        } else {
          console.error('Error uploading image. Server:', responseData);
        }
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

      if (!result.cancelled) {
        console.log('Image picked from gallery:', result.uri);
        setCapturedImage(result.uri);
        await uploadImageToServer(result.uri);
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
        if (!result.cancelled) {
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
          console.log('Anulat de utilizator');
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
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <FontAwesome name="close" size={24} color="black" />
          </TouchableOpacity>
          {calorieInfo && (
            <View>
              <Text>Carbohydrates: {calorieInfo.carbohydrates}</Text>
              <Text>Fats: {calorieInfo.fats}</Text>
              <Text>Kcal: {calorieInfo.kcal}</Text>
              <Text>Proteins: {calorieInfo.proteins}</Text>
            </View>
          )}
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
  modalContainer: {
    borderRadius: 10,
    backgroundColor: 'white', 
    padding: 20,
    width: '90%', 
    alignSelf: 'center',
    marginTop: '5%',
    height: '80%'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});
