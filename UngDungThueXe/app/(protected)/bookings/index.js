import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Button, ActivityIndicator } from 'react-native';
import { useFocusEffect, Link, useRouter } from 'expo-router';
import { getBookingsForUser, cancelBooking } from '../../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isFuture } from 'date-fns';


const UserBookingCard = ({ booking, onCancel }) => {
  const canCancel = booking.startTime ? isFuture(new Date(booking.startTime)) : false;
  return (
    <View style={styles.card}>
      <Text style={styles.infoText}><Text style={styles.bold}>Xe:</Text> {booking.car?.name || 'Không rõ'} (ID đặt: {booking.id})</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Bắt đầu:</Text> {booking.startTime ? format(new Date(booking.startTime), 'dd/MM/yyyy HH:mm') : 'N/A'}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Kết thúc:</Text> {booking.endTime ? format(new Date(booking.endTime), 'dd/MM/yyyy HH:mm') : 'N/A'}</Text>
      <Text style={styles.infoText}><Text style={styles.bold}>Tổng tiền:</Text> {booking.totalPrice.toLocaleString('vi-VN')} VNĐ</Text>
      {canCancel && (
          <View style={styles.cancelButtonContainer}>
             <Button title="Hủy Đơn" onPress={() => onCancel(booking.id)} color="red" />
          </View>
      )}
    </View>
  );
};


export default function UserBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const fetchUserBookings = useCallback(async (id) => {
    if (!id) {
        console.log("fetchUserBookings called with invalid userId:", id);
        setLoading(false); 
        return;
    }
    console.log("Fetching bookings for userId:", id);
    setLoading(true);
    try {
      const response = await getBookingsForUser(id);
      console.log("API Response:", response.data);
      setBookings(response.data.sort((a, b) => {
         const aFuture = a.startTime ? isFuture(new Date(a.startTime)) : false;
         const bFuture = b.startTime ? isFuture(new Date(b.startTime)) : false;
         if (aFuture && !bFuture) return -1;
         if (!aFuture && bFuture) return 1;
         return b.id - a.id;
      }));
    } catch (e) {
      console.error('Lỗi lấy lịch sử booking:', e.response?.data || e.message);
      Alert.alert('Lỗi', 'Không thể tải lịch sử đặt xe. Vui lòng thử lại.');
      setBookings([]); 
    } finally {
      setLoading(false); 
    }
  }, []); 


  useEffect(() => {
    let isMounted = true; 
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (isMounted) {
            if (id) {
                const parsedId = parseInt(id);
                setUserId(parsedId);
         
            } else {
                 Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.', [
                     { text: 'OK', onPress: () => router.replace('/(auth)') }
                 ]);
                 setLoading(false);
            }
        }
      } catch (error) {
         console.error("Lỗi lấy userId từ AsyncStorage:", error);
         if (isMounted) setLoading(false);
      }
    };
    loadUserId();
    return () => { isMounted = false; }; 
  }, [router]); 

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchUserBookings(userId);
      } else {
  
         console.log("useFocusEffect: userId chưa sẵn sàng.");
         setLoading(true); 
      }
      return () => {

      };
    }, [userId, fetchUserBookings]) 
  );


  const handleCancelUserBooking = (bookingId) => {
      Alert.alert(
      "Xác nhận Hủy Đơn",
      `Bạn có chắc chắn muốn hủy đơn đặt xe ID: ${bookingId} không?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy Đơn",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await cancelBooking(bookingId);
              Alert.alert('Thành công', `Đã hủy đơn đặt xe ID: ${bookingId}.`);
               setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
            } catch (error) {
              console.error('Lỗi hủy booking (User):', error.response?.data || error.message);
              if (error.response?.status === 403) {
                 Alert.alert('Hủy thất bại', 'Bạn không có quyền hủy đơn hàng này hoặc đã quá hạn hủy.');
              } else {
                 Alert.alert('Hủy thất bại', 'Đã có lỗi xảy ra.');
              }
            } finally {
              setLoading(false); 
            }
          }
        }
      ]
    );
  };


  return (
    <View style={styles.container}>
       <Link href="/(protected)/" style={styles.backLink}>← Quay lại Trang chủ</Link>

      <Text style={styles.title}>Lịch sử Đặt Xe Của Bạn</Text>


      {loading && <ActivityIndicator style={{ marginBottom: 10 }} />}

   
      {!loading && !userId ? (
         <Text style={styles.emptyText}>Lỗi tải thông tin người dùng.</Text>
      ) : !loading && bookings.length === 0 ? (
         <Text style={styles.emptyText}>Bạn chưa có đơn đặt xe nào.</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => <UserBookingCard booking={item} onCancel={handleCancelUserBooking} />}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}

          refreshing={loading}
          onRefresh={() => { if(userId) fetchUserBookings(userId) }}
        />
      )}

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 10,
  },
  backLink: { 
     color: 'blue',
     fontSize: 16,
     paddingHorizontal: 15,
     paddingTop: 10,
     marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15, 
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexGrow: 1, 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
    flex: 1,
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
    borderLeftColor: '#28a745',
  },
  infoText: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  cancelButtonContainer: {
     marginTop: 10,
     alignItems: 'flex-end',
     borderTopWidth: 1,
     borderTopColor: '#eee',
     paddingTop: 10,
  },

});

