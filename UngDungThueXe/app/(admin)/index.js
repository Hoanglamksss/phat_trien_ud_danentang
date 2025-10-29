import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, FlatList, StyleSheet, Alert, Image, Button } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { getCars, deleteCar } from '../../api/api';
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


const AdminCarCard = ({ car, onDelete, onEdit }) => {
   const imageSource = imageMap[car.imageName] || imageMap['default.jpg'];

   return (
    <View style={styles.card}>
      <Image
        source={imageSource}
        style={styles.image}
      />
      <Text style={styles.carName}>{car.name} (ID: {car.id})</Text>
      <Text style={styles.carBrand}>Hãng: {car.brand}</Text>
      <Text style={styles.carPrice}>{car.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ</Text>

      <View style={styles.buttonRow}>
        <Button title="Sửa" onPress={() => onEdit(car.id)} color="orange" />
        <Button title="Xóa" onPress={() => onDelete(car.id, car.name)} color="red" />
      </View>
    </View>
  );
};


export default function AdminHomeScreen() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const router = useRouter();


  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await getCars();
      setCars(response.data);
    } catch (e) {
      console.error('Lỗi lấy danh sách xe (Admin)', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách xe.');
    } finally {
      setLoading(false);
    }
   };

  useFocusEffect( useCallback(() => { fetchCars(); return () => {}; }, []) );

  const handleDeleteCar = (carId, carName) => {
    Alert.alert(
      "Xác nhận Xóa",
      `Bạn có chắc chắn muốn xóa xe "${carName}" (ID: ${carId}) không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCar(carId);
              Alert.alert('Thành công', `Đã xóa xe "${carName}".`);
              setCars(prevCars => prevCars.filter(car => car.id !== carId));
            } catch (error) {
              console.error('Lỗi xóa xe:', error.response?.data || error.message);
              Alert.alert('Xóa thất bại', 'Đã có lỗi xảy ra.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
   };

  const handleEditCar = (carId) => { router.push(`/(admin)/editCar/${carId}`); };

  const handleLogout = async () => { await logout(); };


  if (!user || user.role !== 'Admin') {
      router.replace('/(auth)');
      return null;
  }

  if (loading && cars.length === 0) {
      return <Text style={styles.loadingText}>Đang tải danh sách xe...</Text>;
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Xe</Text>

        <View style={styles.headerButtons}>

          <Link href="/(admin)/addCar" style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Thêm Xe</Text>
          </Link>

          <Link href="/(admin)/bookings" style={[styles.linkButton, styles.yellowButton]}>
             <Text style={styles.linkButtonText}>Ds Thuê</Text>
          </Link>
           <View style={{ marginLeft: 10 }}>
            <Button title="Thoát" onPress={handleLogout} color="red" />
          </View>
        </View>
      </View>

      {loading && <Text style={styles.loadingText}>Đang làm mới...</Text>}

      <FlatList
        data={cars}
        renderItem={({ item }) => (
          <AdminCarCard
            car={item}
            onDelete={handleDeleteCar}
            onEdit={handleEditCar}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.loadingText}>Chưa có xe nào.</Text>}
        refreshing={loading}
        onRefresh={fetchCars}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
     flexDirection: 'row',
     alignItems: 'center',
  },

  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkButtonText: {
    color: 'white',
    fontSize: 14, 
    fontWeight: '500',
  },
  yellowButton: {
     backgroundColor: '#ffc107',
  },

  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  carBrand: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: 'green',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
});

