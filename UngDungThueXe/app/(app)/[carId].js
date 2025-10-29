import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { Text, View, Button, Alert, StyleSheet, ScrollView, Image, Platform, TouchableOpacity } from 'react-native'; 
import { useBookingStore } from '../../stores/bookingStore';
import { getCarDetails } from '../../api/api'; 
import { useAuthStore } from '../../stores/authStore';
import { format, isValid } from 'date-fns'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 


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


export default function CarDetailsScreen() {
  const { carId } = useLocalSearchParams(); 
  const router = useRouter();
  const { setBookingDetails, setCar } = useBookingStore(); 
  
  const [car, setCarDetails] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [hasNavigatedBack, setHasNavigatedBack] = useState(false); 
  
  const [startDate, setStartDate] = useState(new Date()); 
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600 * 1000 * 2)); 
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);


  useEffect(() => {
    if (!carId) {
      if (!hasNavigatedBack) {
          Alert.alert('Lỗi', 'ID xe không hợp lệ.', [{text: 'OK', onPress: () => router.replace('/(protected)/') }]); // Chuyển hướng sau khi Alert đóng
          setHasNavigatedBack(true);
      }
      return;
    }
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await getCarDetails(carId);
        setCarDetails(response.data); 
      } catch (e) {
        if (!hasNavigatedBack) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin xe.', [{text: 'OK', onPress: () => router.replace('/(protected)/') }]); // Chuyển hướng sau khi Alert đóng
            setHasNavigatedBack(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, hasNavigatedBack]);

  useEffect(() => {
    if (car && startDate && endDate && isValid(startDate) && isValid(endDate)) {
      const diffMs = endDate.getTime() - startDate.getTime();
      
      if (diffMs > 0) {
        const price = parseFloat(car.pricePerHour); 
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); 
        setTotalPrice(diffHours * price);
      } else {
        setTotalPrice(0); 
      }
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, car]);


  const handleConfirmBooking = () => {
    if (totalPrice <= 0 || !car || !startDate || !endDate || !isValid(startDate) || !isValid(endDate) || endDate <= startDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian bắt đầu và kết thúc hợp lệ (kết thúc phải sau bắt đầu).');
      return;
    }

    const bookingDetails = {
      carId: car.id,
      startTime: startDate.toISOString(), 
      endTime: endDate.toISOString(),
      totalPrice: totalPrice,
      carName: car.name 
    };
    
    setCar(car); 
    setBookingDetails(bookingDetails);
    router.push('/(protected)/payment'); 
  };

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false); 
    if (selectedDate) {
      const currentDate = startDate || new Date();
      selectedDate.setHours(currentDate.getHours());
      selectedDate.setMinutes(currentDate.getMinutes());
      setStartDate(selectedDate);
      if (Platform.OS !== 'web') setShowStartTimePicker(true); 
    }
  };
  const onChangeStartTime = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartDate(selectedTime); 
    }
  };
   const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const currentDate = endDate || new Date();
      selectedDate.setHours(currentDate.getHours());
      selectedDate.setMinutes(currentDate.getMinutes());
      setEndDate(selectedDate);
      if (Platform.OS !== 'web') setShowEndTimePicker(true);
    }
  };
  const onChangeEndTime = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndDate(selectedTime);
    }
  };


  if (loading) return <Text style={styles.loadingText}>Đang tải...</Text>;
  if (!car && hasNavigatedBack) return null;
  if (!car) return <Text style={styles.loadingText}>Không có dữ liệu xe.</Text>;

  const imageSource = imageMap[car.imageName] || imageMap['default.jpg'];

  return (
    <ScrollView style={styles.container}>
      <Link href="/(protected)/" style={styles.backLink}>← Quay lại</Link> 
      <View style={styles.card}>
        
        <Image source={imageSource} style={styles.image} />
        
        <Text style={styles.carName}>{car.name}</Text>
        <Text style={styles.carDetail}>Hãng: {car.brand}</Text>
        <Text style={styles.carDetail}>Mã lực: {car.horsepower}</Text>
        <Text style={styles.price}>Giá thuê: {car.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ</Text>

        <Text style={styles.label}>Thời gian bắt đầu:</Text>
        <TouchableOpacity 
           onPress={() => { setShowStartDatePicker(true); if (Platform.OS === 'web') setShowStartTimePicker(true); }} 
           style={styles.dateInput}
        >
           <Text>{startDate ? format(startDate, 'dd/MM/yyyy HH:mm') : 'Chọn ngày giờ bắt đầu'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Thời gian kết thúc:</Text>
        <TouchableOpacity 
           onPress={() => { setShowEndDatePicker(true); if (Platform.OS === 'web') setShowEndTimePicker(true); }} 
           style={styles.dateInput}
        >
           <Text>{endDate ? format(endDate, 'dd/MM/yyyy HH:mm') : 'Chọn ngày giờ kết thúc'}</Text>
        </TouchableOpacity>

        <Text style={styles.total}>Tổng chi phí: {totalPrice.toLocaleString('vi-VN')} VNĐ</Text>
        <Button 
          title="Xác nhận thuê xe" 
          onPress={handleConfirmBooking} 
          disabled={totalPrice <= 0}
        />
      </View>


      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeStartDate}
          minimumDate={new Date()}
        />
      )}
       {showStartTimePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeStartTime}
        />
      )}
       {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeEndDate}
          minimumDate={startDate || new Date()}
        />
      )}
       {showEndTimePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeEndTime}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  backLink: { color: 'blue', marginBottom: 15, marginTop: 40 },
  card: { padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  loadingText: { paddingTop: 50, textAlign: 'center', fontSize: 16 },
  image: { 
    width: '100%', 
    height: 200, 
    backgroundColor: '#ccc', 
    borderRadius: 8, 
    marginBottom: 15,
    resizeMode: 'cover',
  },
  dateInput: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    borderRadius: 5, 
    width: '100%', 
    marginBottom: 15,
    justifyContent: 'center',
    minHeight: 40, 
  },
  carName: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  carDetail: { fontSize: 16, color: '#555', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: 'red', marginVertical: 15 },
  label: { fontSize: 16, alignSelf: 'flex-start', marginTop: 10, marginBottom: 5, fontWeight: '500' },
  total: { fontSize: 20, fontWeight: 'bold', color: 'green', marginVertical: 20 }
});
