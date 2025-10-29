import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { Text } from 'react-native';
import React, { useEffect } from 'react';

export default function ProtectedLayout() {
  const { user, token, isLoading } = useAuthStore();

  useEffect(() => {
    if (user) {

      console.log("Protected Layout - User Role:", user.role, "| Kiểu dữ liệu:", typeof user.role);
    }
  }, [user]);

  if (isLoading) {
    return <Text>Đang tải...</Text>;
  }

  if (!token) {
    return <Redirect href="/(auth)" />;
  }


  if (user && user.role === 'Admin') {
    console.log("Redirecting to Admin...");
    return <Redirect href="/(admin)/" />;
  }

  console.log("Rendering User Stack...");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Danh sách Xe" }} />
      <Stack.Screen name="[carId]" options={{ title: "Chi tiết Xe" }} />
      <Stack.Screen name="payment" options={{ title: "Thanh toán", presentation: 'modal' }} />

      <Stack.Screen
         name="bookings/index"
         options={{ title: "Lịch sử Đặt Xe" }}
      />
    </Stack>
  );
}

