import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Image, Button } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { getCars } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';

const imageMap = {
  'default.jpg': require('../../assets/images/default.jpg'), 
  'img1.jpg': require('../../assets/images/img1.jpg'),
  'img2.jpg': require('../../assets/images/img2.jpg'),
  'img3.jpg': require('../../assets/images/img3.jpg'),
  'img4.jpg': require('../../assets/images/img4.jpg'),
  'img5.jpg': require('../../assets/images/img5.jpg'),
  'img6.jpg': require('../../assets/images/img6.jpg'),
  'img7.jpg': require('../../assets/images/img7.jpg'),
  'img8.jpg': require('../../assets/images/img8.jpg'),
  'img9.jpg': require('../../assets/images/img9.jpg'),
  'img10.jpg': require('../../assets/images/img10.jpg'),
  'img11.jpg': require('../../assets/images/img11.jpg'),
  'img12.jpg': require('../../assets/images/img12.jpg'),
  'img13.jpg': require('../../assets/images/img13.jpg'),
  'img14.jpg': require('../../assets/images/img14.jpg'),
  'img15.jpg': require('../../assets/images/img15.jpg'),
  'img16.jpg': require('../../assets/images/img16.jpg'),
  'img17.jpg': require('../../assets/images/img17.jpg'),
};




const CarCard = ({ car }) => {
  const imageSource = imageMap[car.imageName] || imageMap['default.jpg'];

  return (
    <View style={styles.card}>

      <Image 
        source={imageSource} 
        style={styles.image} 
      /> 
      
      <Text style={styles.carName}>{car.name}</Text>
      <Text style={styles.carBrand}>Hãng: {car.brand}</Text>
      <Text style={styles.carPrice}>{car.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ</Text>
   
      <Link href={{ pathname: "/[carId]", params: { carId: car.id } }} asChild>
        <Button title="Đặt xe" />
      </Link>
    </View>
  );
};


export default function HomeScreen() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await getCars();
        setCars(response.data);
      } catch (e) {
        console.error('Lỗi lấy danh sách xe', e);
        Alert.alert('Lỗi', 'Không thể tải danh sách xe.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleLogout = async () => {
    await logout();

  };

  if (loading) {
    return <Text style={styles.loadingText}>Đang tải danh sách xe...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách xe cho thuê</Text>
        <Button title="Đăng xuất" onPress={handleLogout} color="red" />
      </View>
      
      <FlatList
        data={cars}
        renderItem={({ item }) => <CarCard car={item} />}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.loadingText}>Không có xe nào.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },

  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    maxWidth: '48%', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  image: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 10,
    resizeMode: 'cover', 
  },
  
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  carBrand: {
    fontSize: 14,
    color: '#555',
  },
  carPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: 'green',
    marginVertical: 5,
  },
});