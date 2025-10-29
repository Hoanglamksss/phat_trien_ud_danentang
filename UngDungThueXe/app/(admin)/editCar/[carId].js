import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCarDetails, updateCar } from '../../../api/api';

export default function EditCarScreen() {
  const router = useRouter();
  const { carId } = useLocalSearchParams();
  
  const [car, setCar] = useState(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [imageName, setImageName] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!carId) return;
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await getCarDetails(carId);
        const data = response.data;
        setCar(data);

        setName(data.name);
        setBrand(data.brand);
        setImageName(data.imageName);
        setHorsepower(data.horsepower);
        setPricePerHour(data.pricePerHour.toString());
      } catch (e) {
        Alert.alert('Lỗi', 'Không tìm thấy xe để sửa.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId]);

  const handleUpdateCar = async () => {
    setLoading(true);
    const updatedData = {
      ...car, 
      name,
      brand,
      imageName,
      horsepower,
      pricePerHour: parseFloat(pricePerHour),
    };

    try {
      await updateCar(carId, updatedData);
      Alert.alert('Thành công', 'Cập nhật xe thành công.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error.response?.data);
      Alert.alert('Thất bại', 'Đã có lỗi xảy ra khi cập nhật.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !car) {
    return <Text style={{textAlign: 'center', marginTop: 50}}>Đang tải...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Chỉnh Sửa Xe (ID: {carId})</Text>

        <TextInput style={styles.input} placeholder="Tên xe" onChangeText={setName} value={name} />
        <TextInput style={styles.input} placeholder="Hãng" onChangeText={setBrand} value={brand} />
        <TextInput style={styles.input} placeholder="Tên file ảnh" onChangeText={setImageName} value={imageName} />
        <TextInput style={styles.input} placeholder="Mã lực" onChangeText={setHorsepower} value={horsepower} />
        <TextInput style={styles.input} placeholder="Giá thuê / giờ" onChangeText={setPricePerHour} value={pricePerHour} keyboardType="numeric" />
        
        <Button title={loading ? "Đang xử lý..." : "Cập Nhật"} onPress={handleUpdateCar} disabled={loading} />
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