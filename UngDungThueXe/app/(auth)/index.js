import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { loginUser } from '../../api/api';
import { useAuthStore } from '../../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const token = useAuthStore(state => state.token);
  const logout = useAuthStore(state => state.logout); 


  if (token) return <Redirect href="/(protected)/" />;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const userData = await loginUser({ username, password });
      await login(userData);
      Alert.alert('Thành công', `Chào mừng ${userData.fullName}!`);
    } catch (error) {
      console.error("----- LỖI ĐĂNG NHẬP -----");
      if (error.response) {
        console.error("Data:", error.response.data);
        console.error("Status:", error.response.status);

        
        console.error("Headers:", error.response.headers);
        Alert.alert('Lỗi đăng nhập',
                    (error.response.data?.message || error.response.data) || `Lỗi ${error.response.status}`);
      } else if (error.request)
        
        
        {
        console.error("Request:", error.request);
        Alert.alert('Lỗi mạng', 'Không thể kết nối đến server.');
      } else {
        console.error('Lỗi Setup Request:', error.message);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu.');
      }
      console.error("Config URL:", error.config?.url);
      console.error("-------------------------");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cho Thuê Xe</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>
        <TextInput
          style={styles.input}
          placeholder="Tài khoản"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <View style={styles.buttonGroup}>
          <Button title={loading ? "Đang xử lý..." : "Đăng nhập"} onPress={handleLogin} disabled={loading} />
          <Link href="/(auth)/register" style={styles.link}>
            Chưa có tài khoản? Đăng ký
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', position: 'absolute', top: 50, left: 20 },
  card: { width: '90%', maxWidth: 400, padding: 20, backgroundColor: 'white', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  link: { color: 'blue', fontSize: 14 }
});
