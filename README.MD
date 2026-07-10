# Smart Check-In App

Aplikasi mobile untuk check-in harian menggunakan fitur native smartphone: kamera, galeri, GPS, dan penyimpanan lokal. Dibangun dengan React Native (Expo) sebagai proyek portofolio profesional.

---

## 📱 Fitur Utama

- Ambil foto selfie langsung dari **kamera** atau pilih dari **galeri**
- Dapatkan lokasi GPS (latitude, longitude)
- Simpan data check-in lengkap: foto, koordinat, tanggal, jam
- Lihat riwayat check-in dalam daftar terurut
- Buka lokasi di **Google Maps** langsung dari aplikasi
- Tampilkan **cuaca terkini** berdasarkan koordinat (Open-Meteo API)
- **Reverse geocoding** – menampilkan alamat lengkap (jalan, kecamatan, kota, provinsi)
- Placeholder avatar jika belum ada foto
- Reset seluruh data riwayat
- Penanganan izin pengguna yang ramah, termasuk tombol **Buka Pengaturan**

---

## 🧩 Fitur Native yang Digunakan

| Native Feature       | Package                 |
|----------------------|-------------------------|
| Kamera               | `expo-image-picker`     |
| Galeri Foto          | `expo-image-picker`     |
| GPS / Lokasi         | `expo-location`         |
| Penyimpanan Lokal    | `@react-native-async-storage/async-storage` |
| Buka Google Maps     | `Linking` (bawaan RN)   |
| Buka Pengaturan OS   | `Linking`               |
| Reverse Geocoding    | `expo-location`         |

---

## 🎯 Level 2 yang Diimplementasikan

1. **Kamera + Galeri** – alert pemilihan sumber foto
2. **Foto + Lokasi** – setiap check-in menyimpan foto, latitude, longitude, tanggal, jam
3. **AsyncStorage** – data tersimpan dan dimuat otomatis saat aplikasi dibuka
4. **Google Maps** – tombol "Buka di Google Maps" menggunakan `Linking.openURL()`
5. **Open Settings** – tombol untuk membuka pengaturan OS jika izin ditolak
6. **Riwayat Check-in** – FlatList dengan foto, tanggal, jam, koordinat, dan tombol Maps

---

## 🥇 Bonus Level 3

- ✅ **Reverse Geocoding** – alamat jalan, kecamatan, kota, provinsi
- ✅ **Cuaca** – suhu, deskripsi cuaca, kecepatan angin, ikon cuaca (Open-Meteo)
- ✅ **Reset Data** – tombol untuk menghapus semua riwayat dan penyimpanan
- ✅ **Placeholder** – avatar default saat belum ada foto
- ✅ **Loading Indicator** – ActivityIndicator muncul saat kamera, lokasi, atau penyimpanan sedang diproses

---

## 🚀 Teknologi (Tech Stack)

- React Native 0.76+ (Expo SDK 54)
- Expo Router (tidak digunakan karena satu layar)
- Expo Image Picker
- Expo Location
- AsyncStorage
- Open-Meteo API (gratis, tanpa API key)
- Ionicons (Expo Vector Icons)
- JavaScript (bukan TypeScript)

---

## 📁 Struktur Folder
