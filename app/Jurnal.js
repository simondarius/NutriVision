import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

function Journal() {
  const navigation = useNavigation();
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
  return (
<View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.headerText}>My Journal</Text>
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => navigation.navigate('index', { addNewData })}
    >
      <FontAwesome name="angle-right" size={30} color="white" />
    </TouchableOpacity>
  </View>
  <View style={styles.dataContainer}>
  <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={false}>
  {allSavedCalorieInfo.map((data, index) => (
    <View key={index} style={styles.dataItem}>
      <View style={styles.row}>
        <View style={styles.dateContainer}>
          <Text style={styles.dayText}>{getDayOfWeek(new Date())}</Text>
        </View>
        <View style={styles.infoContainer}>
        <Text style={styles.dataItemText}>{data.foodname.toUpperCase()}</Text>
  <View style={styles.macroContainer}>
    <View style={[styles.colorSquare, { backgroundColor: '#FF5733' }]} />
    <Text style={styles.macroText}>Carbs: {data.carbohydrates}g</Text>
  </View>
  <View style={styles.macroContainer}>
    <View style={[styles.colorSquare, { backgroundColor: '#32CD32' }]} />
    <Text style={styles.macroText}>Fats: {data.fats}g</Text>
  </View>
  <View style={styles.macroContainer}>
    <View style={[styles.colorSquare, { backgroundColor: '#3498DB' }]} />
    <Text style={styles.macroText}>Proteins: {data.proteins}g</Text>
  </View>
  <Text style={styles.dataItemText}>Calories: {data.kcal} kcal</Text>
        </View>
        <View style={styles.chartContainer}>
          <PieChart
            data={[
              { name: 'Carbs', value: data.carbohydrates, color: '#FF5733' },
              { name: 'Fats', value: data.fats, color: '#32CD32' },
              { name: 'Proteins', value: data.proteins, color: '#3498DB' },
            ]}
            width={200}
            height={100}
            chartConfig={{
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="value"
            style={{ alignSelf: 'center', marginLeft: 130 }}
            hasLegend={false}
            backgroundColor="transparent"
          />
        </View>
      </View>
    </View>
        ))}
         <View style={styles.extraMarginHack} />
        </ScrollView>
      </View>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#800080',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#800080',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15
  },
  addButton: {
    padding: 11,
    borderRadius: 20,
    marginRight: 0
  },
  dataContainer: {
    flex: 1,
    padding: 20,
    overflow: 'hidden',
  },
  dataItem: {
    backgroundColor: '#B8B8B8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,

  },
  dataItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  dayText:{
    top: 45,

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    width: 60,
    marginRight: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  chartContainer: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  macroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorSquare: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  macroText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  extraMarginHack: {
    width: 50,
  },
});
function getDayOfWeek(date) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

export default Journal;
