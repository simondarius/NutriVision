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
      <Text style={styles.foodName}>{calorieInfo.foodname}</Text>
      <Text style={styles.sectionTitle}>Macronutrients per 100g</Text>
    <View style={styles.chartContainer}>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { height: calorieInfo.carbohydrates , backgroundColor: '#FF5733' }]} />
        <Text style={styles.barLabel}>Carbs</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { height: calorieInfo.fats , backgroundColor: '#32CD32' }]} />
        <Text style={styles.barLabel}>Fats</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { height: calorieInfo.proteins , backgroundColor: '#3498DB' }]} />
        <Text style={styles.barLabel}>Proteins</Text>
      </View>
    </View>
    <View style={styles.macronutrientContainer}>
  <View style={[styles.colorSquare, { backgroundColor: '#FF5733' }]} />
  <Text style={styles.macronutrientText}>Carbs: {calorieInfo.carbohydrates}g</Text>
</View>
<View style={styles.macronutrientContainer}>
  <View style={[styles.colorSquare, { backgroundColor: '#32CD32' }]} />
  <Text style={styles.macronutrientText}>Fats: {calorieInfo.fats}g</Text>
</View>
<View style={styles.macronutrientContainer}>
  <View style={[styles.colorSquare, { backgroundColor: '#3498DB' }]} />
  <Text style={styles.macronutrientText}>Proteins: {calorieInfo.proteins}g</Text>
</View>
<Text style={styles.calories}>Calories:{calorieInfo.kcal} kcal</Text>
<TouchableOpacity
      style={styles.bookButton}
      onPress={() => {
      }}
    >
      <FontAwesome name="book" size={24} color="black" />
      <Text style={styles.bookButtonText}>Save in journal</Text>
    </TouchableOpacity>
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
  chartContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent:'space-between', 
    marginBottom:10,
  },
  barContainer: {
    marginRight: 8,
    alignItems: 'center',
  },
  bar: {
    width: 20,
  },
  barLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  macronutrientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSquare: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  macronutrientText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    marginTop: 10,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    alignSelf:'center',
  },
  calories: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  bookButtonText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});
