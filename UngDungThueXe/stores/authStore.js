import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null, 
  token: null,
  isLoading: true, 

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const fullName = await AsyncStorage.getItem('userFullName');
      const role = await AsyncStorage.getItem('userRole');
      
      if (token && fullName && role) {
        
        set({ token, user: { fullName, role }, isLoading: false });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch (e) {
      console.error('Lỗi khôi phục session:', e);
      set({ token: null, user: null, isLoading: false });
    }
  },

  login: async (userData) => {
    
    await AsyncStorage.setItem('userToken', userData.token);
    await AsyncStorage.setItem('userId', userData.id.toString());
    await AsyncStorage.setItem('userFullName', userData.fullName);
    await AsyncStorage.setItem('userRole', userData.role); // <--- LƯU ROLE
    
    set({ user: userData, token: userData.token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userFullName');
    await AsyncStorage.removeItem('userRole'); // <--- XÓA ROLE
    
    set({ user: null, token: null });
  },
}));
