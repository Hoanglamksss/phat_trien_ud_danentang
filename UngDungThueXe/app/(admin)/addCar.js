import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createCar } from '../../api/api'; 

export default function AddCarScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [imageName, setImageName] = useState(''); 
  const [horsepower, setHorsepower] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCar = async () => {
    if (!name || !brand || !pricePerHour) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên, Hãng, và Giá thuê.');
      return;
    }

    setLoading(true);

    const carData = {
      name,
      brand,
      imageName: imageName || 'default.jpg',
      horsepower,
      pricePerHour: parseFloat(pricePerHour),
      isAvailable: true
    };

    try {
      await createCar(carData);
      Alert.alert(
        'Thành công',
        'Đã thêm xe mới thành công.',
        [{ text: 'OK', onPress: () => router.back() }] 
      );
    } catch (error) {
      console.error(error.response?.data);
      Alert.alert('Thất bại', 'Đã có lỗi xảy ra khi thêm xe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Thêm Xe Mới</Text>

        <TextInput style={styles.input} placeholder="Tên xe (vd: Mazda 3)" onChangeText={setName} value={name} />
        <TextInput style={styles.input} placeholder="Hãng (vd: Mazda)" onChangeText={setBrand} value={brand} />
        <TextInput style={styles.input} placeholder="Tên file ảnh (vd: mazda3.jpg)" onChangeText={setImageName} value={imageName} />
        <TextInput style={styles.input} placeholder="Mã lực (vd: 186 HP)" onChangeText={setHorsepower} value={horsepower} />
        <TextInput 
          style={styles.input} 
          placeholder="Giá thuê / giờ (vd: 140000)" 
          onChangeText={setPricePerHour} 
          value={pricePerHour} 
          keyboardType="numeric"
        />
        
        <Button title={loading ? "Đang xử lý..." : "Thêm Xe"} onPress={handleAddCar} disabled={loading} />
      </View>
    </ScrollView>
  );
}

// Dùng chung style
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', padding: 20, backgroundColor: 'white', borderRadius: 8, },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
});