import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

function Journal() {
  const route = useRoute();
  const savedCalorieInfo = route.params.savedCalorieInfo;
  const [allSavedCalorieInfo, setAllSavedCalorieInfo] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');


  useEffect(() => {
    setAllSavedCalorieInfo(savedCalorieInfo);
  }, [savedCalorieInfo]);
  useEffect(() => {
  readDataFromStorage();
}, []);
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
  
    // Adaugă data curentă la obiectul newData
    newData.dateAdded = new Date().toISOString();
  
    setAllSavedCalorieInfo((prevInfo) => [...prevInfo, newData]);
    saveDataToStorage();
  };


  const filterDataByCategory = (data) => {
    if (selectedCategory === 'today') {
        return data;
    } else if (selectedCategory === 'yesterday') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return data.filter(item => {
        const itemDate = new Date(item.dateAdded);
        return itemDate.getDate() === yesterday.getDate() && itemDate.getMonth() === yesterday.getMonth() && itemDate.getFullYear() === yesterday.getFullYear();
      });
    } else if (selectedCategory === 'lastWeek') {
      const today = new Date(); // Adaugă data curentă
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(today);
      return data.filter(item => {
        const itemDate = new Date(item.dateAdded);
        return itemDate >= lastWeekStart && itemDate <= lastWeekEnd;
      });
    } else {
      // Filtrare pentru alte categorii (ex. 2 zile în urmă)
      // Implementează logică similară aici
      return [];
    }
  };

  const calculateTotalCalories = (data) => {
    let totalCalories = 0;
  
    data.forEach((info) => {
      totalCalories += parseFloat(info.kcal);
    });
  
    return totalCalories.toFixed(2); // Rotunjim suma la 2 zecimale
  };
  
  
   return (
    <View style={styles.container}>
    <ImageBackground source={require('./im1.jpg')} style={styles.backgroundImage}>
      <View style={styles.categoryMenuBackground}>
        <View style={styles.categoryMenu}>
          <TouchableOpacity onPress={() => setSelectedCategory('today')}>
            <Text style={selectedCategory === 'today' ? styles.activeCategory : styles.category}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('yesterday')}>
            <Text style={selectedCategory === 'yesterday' ? styles.activeCategory : styles.category}>Yesterday</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('lastWeek')}>
            <Text style={selectedCategory === 'lastWeek' ? styles.activeCategory : styles.category}>Last Week</Text>
          </TouchableOpacity>
          {/* Adaugă butoane pentru alte categorii aici */}
        </View>
      </View>
      {/* Aici începe afișarea elementelor filtrate */}
      {filterDataByCategory(allSavedCalorieInfo).map((info, index) => (
        <View key={index} style={styles.entry}>
          <Text style={styles.entryTitle}>Food: {info.foodname}</Text>
          <Text style={styles.entryInfo}>Carbs: {info.carbohydrates}g</Text>
          <Text style={styles.entryInfo}>Fats: {info.fats}g</Text>
          <Text style={styles.entryInfo}>Proteins: {info.proteins}g</Text>
          <Text style={styles.entryInfo}>Calories: {info.kcal} kcal</Text>
      {/* Aici se termină afișarea elementelor filtrate */}
      </View>
      ))}
      <Text style={styles.totalCalories}>
        Total Calories : {calculateTotalCalories(filterDataByCategory(allSavedCalorieInfo))} kcal
      </Text>
   </ImageBackground>

    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryMenuBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fundal alb semi-transparent pentru butoane
    padding: 30,
  },
  categoryMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
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
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  entryInfo: {
    fontSize: 16,
    marginBottom: 3,
  },
  category: {
    // Stilurile butonului ne-selectat
    fontSize: 16,
    marginRight: 10, // Adaugă o distanță între butoane
  },
  activeCategory: {
    // Stilurile butonului selectat
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10, // Adaugă o distanță între butoane
    color: 'blue', // Poți schimba culoarea după preferințe
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  activeCategoryButton: {
    backgroundColor: '#3498DB',
  },
  inactiveCategoryButton: {
    backgroundColor: '#E0E0E0',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  totalCalories: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: 'white',
  },  
});

export default Journal;
