import React, { useState, useEffect } from 'react'; 
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { createBooking } from '../../api/api';
import QRCode from 'react-native-qrcode-svg'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function PaymentScreen() {
  const router = useRouter();
  const { bookingDetails, selectedCar, clearBooking } = useBookingStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);


  useEffect(() => {
    if (!bookingDetails || !selectedCar) {
    
      if (!orderConfirmed) { 
        Alert.alert('Lỗi', 'Không có thông tin đơn hàng. Vui lòng đặt lại.');
      }
      router.replace('/(app)/');
    }
  }, [bookingDetails, selectedCar, router, orderConfirmed]);



  const handleCreateBooking = async () => {
    setLoading(true);
    try {
      const userId = user?.id || await AsyncStorage.getItem('userId'); 

      if (!userId) {
         throw new Error("Không tìm thấy ID người dùng.");
      }
      
      const bookingData = {
        ...bookingDetails,
        userId: parseInt(userId),
        car: undefined,
        user: undefined
      };

      await createBooking(bookingData);

      clearBooking(); 
      setOrderConfirmed(true);

      Alert.alert(
        'Đặt xe thành công', 
        'Đơn hàng của bạn đã được xác nhận! Vui lòng làm thủ tục.',
        [
   
          { text: 'OK', onPress: () => router.replace('/(app)/') } 
        ]
      );


    } catch (error) {
      console.error('Lỗi tạo booking:', error.response?.data || error.message);
      Alert.alert('Đặt xe thất bại', error.response?.data?.message || 'Không thể tạo đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails || !selectedCar) {
    return null; 
  }

  const paymentData = `BOOKING-${selectedCar.name}-${bookingDetails.totalPrice}`;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thanh toán</Text>

      <View style={styles.card}>
        <QRCode value={paymentData} size={200} />
        
        <Text style={styles.carName}>{selectedCar.name}</Text>
        <Text style={styles.totalPrice}>Tổng tiền: {bookingDetails.totalPrice.toLocaleString('vi-VN')} VNĐ</Text>
        <Text style={styles.detailText}>Địa chỉ: 45 Trần Phú, Nha Trang</Text>
      </View>

      <Text style={styles.instruction}>
        Vui lòng đến địa chỉ trên để làm thủ tục thuê xe.
      </Text>
      <Text style={styles.instruction}>
        Mang theo <Text style={{fontWeight: 'bold'}}>CMND/CCCD và bằng lái xe</Text>.
      </Text>

      <Button 
        title={loading ? 'Đang xử lý...' : 'Xác nhận Đơn hàng'} 
        onPress={handleCreateBooking} 
        disabled={loading || orderConfirmed} 
        style={{ marginTop: 20 }}
      />
      

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20, alignItems: 'center', paddingTop: 80 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  card: { width: '90%', maxWidth: 350, padding: 25, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  carName: { fontSize: 20, fontWeight: '600', marginTop: 15, marginBottom: 5 },
  totalPrice: { fontSize: 22, fontWeight: 'bold', color: 'green', marginVertical: 10 },
  detailText: { fontSize: 16, color: '#555', marginBottom: 20 },
  instruction: { fontSize: 15, marginVertical: 5, textAlign: 'center', paddingHorizontal: 10 },
});