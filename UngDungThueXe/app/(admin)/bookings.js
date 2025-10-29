import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Button, ActivityIndicator } from 'react-native';
import { useFocusEffect, Link } from 'expo-router'; 
import { getAllBookings, cancelBooking } from '../../api/api'; 

import { format } from 'date-fns'; 

const BookingCard = ({ booking, onCancel }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Xe:</Text> {booking.car?.name || 'Không rõ'} (ID: {booking.carId})
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Người thuê:</Text> {booking.user?.fullName || booking.user?.username || 'Không rõ'} (ID: {booking.userId})
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Bắt đầu:</Text> {booking.startTime ? format(new Date(booking.startTime), 'dd/MM/yyyy HH:mm') : 'N/A'}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Kết thúc:</Text> {booking.endTime ? format(new Date(booking.endTime), 'dd/MM/yyyy HH:mm') : 'N/A'}
      </Text>
      <Text style={styles.infoText}>
        <Text style={styles.bold}>Tổng tiền:</Text> {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
      </Text>
      <View style={styles.buttonContainer}>
         <Button title="Hủy Đặt Xe" onPress={() => onCancel(booking.id)} color="red" />
      </View>
    </View>
  );
};


export default function ManageBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response.data.sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error('Lỗi lấy danh sách booking (Admin)', e);
      Alert.alert('Lỗi', 'Không thể tải danh sách đặt xe.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
      return () => {};
    }, [])
  );


  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Xác nhận Hủy",
      `Bạn có chắc chắn muốn hủy đơn đặt xe ID: ${bookingId} không?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy Đơn",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await cancelBooking(bookingId);
              Alert.alert('Thành công', `Đã hủy đơn đặt xe ID: ${bookingId}.`);
              setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
            } catch (error) {
              console.error('Lỗi hủy booking:', error.response?.data || error.message);
              Alert.alert('Hủy thất bại', 'Đã có lỗi xảy ra.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && bookings.length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Quản lý Đơn Đặt Xe</Text>

      {loading && <ActivityIndicator />}

      <FlatList
        data={bookings}
        renderItem={({ item }) => <BookingCard booking={item} onCancel={handleCancelBooking} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có đơn đặt xe nào.</Text>}
        refreshing={loading}
        onRefresh={fetchBookings} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15, 
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5, 
    borderLeftColor: '#007bff', 
  },
  infoText: {
    fontSize: 15, 
    marginBottom: 6, 
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
     marginTop: 10,
     alignItems: 'flex-end',
  }
});
