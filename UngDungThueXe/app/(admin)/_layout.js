import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { Text } from 'react-native';
import React, { useEffect } from 'react'; 

export default function AdminLayout() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (user) {

      console.log("Admin Layout - User Role:", user.role, "| Kiểu dữ liệu:", typeof user.role);
    }
  }, [user]);
  
  if (isLoading) return <Text>Đang tải...</Text>;


  if (!user || user.role !== 'Admin') { 
    console.log("AdminLayout: Access Denied. Redirecting to /protected/");
    return <Redirect href="/(protected)/" />;
  }

  console.log("AdminLayout: Access Granted.");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Quản lý Xe (Admin)" }} />
      <Stack.Screen name="bookings" options={{ title: "Quản lý Đặt Xe" }} />
      <Stack.Screen name="addCar" options={{ title: "Thêm Xe Mới" }} />
      <Stack.Screen name="editCar/[carId]" options={{ title: "Chỉnh Sửa Xe" }} />
    </Stack>
  );
}

