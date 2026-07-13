# 📱 ProfileCard

ProfileCard adalah aplikasi kartu profil sederhana berbasis React Native (Expo) yang memungkinkan pengguna menyimpan data diri — nama, nomor HP, email, dan bio singkat — lengkap dengan foto profil, lokasi GPS terkini, serta riwayat lokasi. Aplikasi ini cocok sebagai kartu identitas digital pribadi yang bisa disimpan dan dibagikan kapan saja.

---

## ✨ Fitur Utama

- 👤 **Isi & simpan profil** — nama, nomor HP, email, dan bio (maks. 140 karakter)
- 📸 **Ubah foto profil** — ambil foto langsung dari kamera
- 🖼️ **Pilih dari galeri** — upload foto profil dari galeri HP
- 📍 **Lokasi saya** — ambil koordinat GPS terkini secara otomatis dan tampilkan alamat
- 🕒 **Riwayat lokasi** — menyimpan histori lokasi yang pernah diambil beserta waktunya
- 💾 **Simpan profil** — data tersimpan secara persisten di perangkat
- 📤 **Bagikan profil** — share kartu profil ke aplikasi lain
- 🗑️ **Hapus profil** — reset data profil kapan saja
- 🌗 **Mode gelap / terang** — toggle tema sesuai preferensi
- 📊 **Indikator kelengkapan profil** — progress bar menunjukkan persentase data yang sudah diisi (0% – 100%)

---

## 📸 Screenshot Aplikasi

|             Profil Kosong (Awal)              |                   Profil 67% Lengkap                    |                 Profil 100% Lengkap                  |
| :-------------------------------------------: | :-----------------------------------------------------: | :--------------------------------------------------: |
| ![Profil Awal](screenshots/home-profile.jpeg) | ![Profil Sebagian](screenshots/app-berjalan-di-hp.jpeg) | ![Profil Lengkap](screenshots/complete-profile.jpeg) |

|                  Pilih Foto dari Galeri                  |
| :------------------------------------------------------: |
| ![Pilih dari Galeri](screenshots/pilih-dari-galeri.jpeg) |

---

## 📦 Download APK

📲 **[Download APK dari EAS Dashboard](https://expo.dev/accounts/jerryhutabarat/projects/profilecard/builds/90b3ff63-f92f-459e-bc9e-8f255dc7b858) atau link Download by Handphone (https://expo.dev/accounts/jerryhutabarat/projects/profilecard/builds/90b3ff63-f92f-459e-bc9e-8f255dc7b858)

> Ganti link di atas dengan link build kamu dari EAS dashboard klik tombol **Install** atau **Download build** pada halaman build

Build juga bisa langsung dijalankan lewat command:

```
eas build --platform android --profile preview
```

---

## 🔧 Cara Install APK

1. Download file APK melalui link di atas menggunakan browser HP Android kamu.
2. Buka file APK yang sudah terdownload (biasanya ada di folder **Downloads**).
3. Jika muncul peringatan "Install blocked" atau "Unknown sources", aktifkan izin **Install from this source** melalui pengaturan yang muncul.
4. Tekan **Install**, tunggu proses selesai.
5. Buka aplikasi melalui tombol **Open**, atau cari icon **ProfileCard** di home screen / app drawer.

---

## 🛠️ Bukti Proses Build & Instalasi

### 1. Build Selesai via Terminal (EAS CLI)

![EAS Build Finished - Terminal](screenshots/eas-build-terminal-finished.png)

### 2. Dashboard EAS — Status Build `Finished`

![EAS Dashboard Finished](screenshots/eas-dashboard-finished.png)

### 3. Dialog Instalasi APK di HP

> ⚠️ Screenshot belum tersedia — tambahkan screenshot dialog instalasi APK (saat APK diinstall di HP) ke folder `screenshots/`, lalu update baris ini.

### 4. Icon Aplikasi di Home Screen / App Drawer

> ⚠️ Screenshot belum tersedia — tambahkan screenshot icon **ProfileCard** di home screen / app drawer HP ke folder `screenshots/`, lalu update baris ini.

### 5. Aplikasi Berjalan di HP (Tanpa Frame Expo Go)

![Aplikasi Berjalan di HP](screenshots/app-berjalan-di-hp.jpeg)

---

## 🧩 Tech Stack

- React Native (Expo, SDK 54)
- Expo Location (GPS)
- Expo Image Picker (kamera & galeri)
- EAS Build (Android internal distribution)

---

## 📄 Lisensi

[Opsional — tambahkan jenis lisensi jika ada, contoh: MIT License]
