import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.8:5073/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const registerUser = (data) => api.post('/Users/register', data);

export const loginUser = async (data) => {
  const response = await api.post('/Users/login', data);
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('userId', response.data.id.toString());
    await AsyncStorage.setItem('userFullName', response.data.fullName);
    await AsyncStorage.setItem('userRole', response.data.role);
  }
  return response.data;
};

export const getCars = () => api.get('/Cars');
export const getCarDetails = (id) => api.get(`/Cars/${id}`);


export const createBooking = (data) => api.post('/Bookings', data);


export const getBookingsForUser = (userId) => api.get(`/Bookings/user/${userId}`);

export const createCar = (data) => api.post('/Cars', data);
export const updateCar = (id, data) => api.put(`/Cars/${id}`, data);
export const deleteCar = (id) => api.delete(`/Cars/${id}`);
export const getAllBookings = () => api.get('/Bookings'); 
export const cancelBooking = (id) => api.delete(`/Bookings/${id}`);

