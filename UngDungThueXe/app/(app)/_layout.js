import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function AppLayout() {
  const { token } = useAuthStore();

  if (!token) {
      return <Redirect href="/(auth)" />;
  }

 
  return (
    <Stack>

      <Stack.Screen
        name="index" 
        options={{ title: "Danh sách Xe" }}
      />
      

      <Stack.Screen
        name="[carId]"
        options={{ title: "Chi tiết Xe" }}
      />
      <Stack.Screen
        name="payment"
        options={{ title: "Thanh toán", presentation: 'modal' }}
      />
    </Stack>
  );
}