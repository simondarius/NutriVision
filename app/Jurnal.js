import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

function Journal() {
  const route = useRoute();
  const savedCalorieInfo = route.params.savedCalorieInfo;
  const [allSavedCalorieInfo, setAllSavedCalorieInfo] = useState([]);

  useEffect(() => {
    setAllSavedCalorieInfo(savedCalorieInfo);
  }, [savedCalorieInfo]);


  const readDataFromStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem('calorieInfo');
      console.log('Stored data from AsyncStorage:', storedData);
      if (storedData) {
        setAllSavedCalorieInfo(JSON.parse(storedData));
      } else {
        setAllSavedCalorieInfo([]); // Handle the case when there is no stored data
      }
    } catch (error) {
      console.error('Error reading data from AsyncStorage:', error);
    }
  };

  const saveDataToStorage = async () => {
    try {
      await AsyncStorage.setItem('calorieInfo', JSON.stringify(allSavedCalorieInfo));
      console.log('Data saved to AsyncStorage:', allSavedCalorieInfo);
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  };

  const addNewData = (newData) => {
    console.log('Adding new data:', newData);
    setAllSavedCalorieInfo((prevInfo) => [...prevInfo, newData]);
    saveDataToStorage();
  };

    
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      {allSavedCalorieInfo.map((info, index) => (
        <View key={index} style={styles.entry}>
          <Text>Food: {info.foodname}</Text>
          <Text>Carbs: {info.carbohydrates}g</Text>
          <Text>Fats: {info.fats}g</Text>
          <Text>Proteins: {info.proteins}g</Text>
          <Text>Calories: {info.kcal} kcal</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  entry: {
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default Journal;
