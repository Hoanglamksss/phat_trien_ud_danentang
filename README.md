# 1. Khởi tạo dự án (Nếu chưa có)
# npx create-expo-app@latest UngDungThueXe --template tabs@50

# 2. Cài đặt các thư viện chính (Front-end)
npm install axios zustand @react-native-async-storage/async-storage date-fns

# 3. Cài đặt các module native (Expo install)
npx expo install @react-native-community/datetimepicker react-native-svg

# 4. Sửa lỗi xung đột (nếu gặp lỗi ERESOLVE)
npm install react-native-qrcode-svg --legacy-peer-deps

#5. chạy:
dotnet run
 #6. chạy front end : 
npm start -c
