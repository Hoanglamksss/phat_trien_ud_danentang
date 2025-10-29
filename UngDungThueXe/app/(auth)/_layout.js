import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { Text } from 'react-native';

export default function AuthLayout() {
  const { token, isLoading } = useAuthStore();


  if (isLoading) {
    return <Text>Đang tải...</Text>; 
  }


  if (token) {
    return <Redirect href="/(protected)/" />;
  }


  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Đăng nhập" }} />
      <Stack.Screen name="register" options={{ title: "Đăng ký" }} />
    </Stack>
  );
}