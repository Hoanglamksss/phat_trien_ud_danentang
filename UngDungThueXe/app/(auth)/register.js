import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { registerUser } from '../../api/api'; 

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cmnd, setCmnd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password || !fullName || !phoneNumber || !cmnd) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả thông tin.');
      return;
    }

    setLoading(true);

    const userData = {
      username: username,
      passwordHash: password,
      fullName: fullName,
      phoneNumber: phoneNumber,
      cmnd: cmnd,
      role: 0 
    };

    try {
      const response = await registerUser(userData);
      Alert.alert(
        'Thành công',
        'Đăng ký tài khoản thành công! Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => router.push('/(auth)') }] 
      );
    } catch (error) {
      console.error(error.response?.data);
      Alert.alert('Đăng ký thất bại', error.response?.data?.message || 'Tài khoản này có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Cho Thuê Xe</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Tên đăng nhập" 
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
        <TextInput 
          style={styles.input} 
          placeholder="Họ tên" 
          onChangeText={setFullName} 
          value={fullName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Số điện thoại" 
          onChangeText={setPhoneNumber} 
          value={phoneNumber} 
          keyboardType="phone-pad"
        />
        <TextInput 
          style={styles.input} 
          placeholder="CMND / CCCD" 
          onChangeText={setCmnd} 
          value={cmnd} 
          keyboardType="number-pad"
        />
        
        <View style={styles.buttonGroup}>
          <Button title={loading ? "Đang xử lý..." : "Đăng ký"} onPress={handleRegister} disabled={loading} />
          <Link href="/(auth)" style={styles.link}>
            Đã có tài khoản? Đăng nhập
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  header: { fontSize: 28, fontWeight: 'bold', position: 'absolute', top: 50, left: 20 },
  card: { width: '90%', maxWidth: 400, padding: 20, backgroundColor: 'white', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  link: { color: 'blue', fontSize: 14 }
});