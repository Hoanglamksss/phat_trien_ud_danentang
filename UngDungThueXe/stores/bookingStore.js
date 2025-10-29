import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  selectedCar: null,
  bookingDetails: null, 

  
  setCar: (car) => set({ selectedCar: car }), 

  setBookingDetails: (details) => set({ bookingDetails: details }),

  clearBooking: () => set({ selectedCar: null, bookingDetails: null }),
}));