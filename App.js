// App.js — ProfileCard
// Fitur lengkap: foto (kamera/galeri + kompresi), nama, kontak, bio,
// lokasi (+ reverse geocoding & riwayat), dark mode, dan penyimpanan lokal.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
  BackHandler,
  Animated,
  Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFIL_KEY = '@profilecard_data';
const MAX_RIWAYAT_LOKASI = 5;

const TEMA = {
  terang: {
    bg: '#f5f5f5',
    card: '#ffffff',
    text: '#0a2e0a',
    muted: '#9aa5a0',
    border: '#e0e0e0',
    primary: '#00b894',
    primarySoft: '#e8f5e9',
    biru: '#0984e3',
    ungu: '#6c5ce7',
    merah: '#d63031',
    inputBg: '#f8faf9',
    skeleton: '#e2e6e4',
  },
  gelap: {
    bg: '#121212',
    card: '#1e1e1e',
    text: '#eaf5ea',
    muted: '#8a938d',
    border: '#333333',
    primary: '#00d1a0',
    primarySoft: '#123326',
    biru: '#3ea6ff',
    ungu: '#a29bfe',
    merah: '#ff7675',
    inputBg: '#262626',
    skeleton: '#2a2a2a',
  },
};

function formatNomorHp(input) {
  let v = input.replace(/[^\d+]/g, '');
  if (v.startsWith('0')) {
    v = '+62' + v.slice(1);
  } else if (v.startsWith('62')) {
    v = '+' + v;
  }
  if (v.startsWith('+62') && v.length > 3) {
    const sisa = v.slice(3);
    v = '+62 ' + sisa;
  }
  return v.trim();
}

const PROFIL_KOSONG = {
  foto: null,
  nama: '',
  hp: '',
  email: '',
  bio: '',
  lokasi: null,
  alamat: null,
  riwayatLokasi: [],
};

export default function App() {
  const [foto, setFoto] = useState(null);
  const [nama, setNama] = useState('');
  const [hp, setHp] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [lokasi, setLokasi] = useState(null);
  const [alamat, setAlamat] = useState(null);
  const [riwayatLokasi, setRiwayatLokasi] = useState([]);
  const [modeGelap, setModeGelap] = useState(false);

  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [mencariLokasi, setMencariLokasi] = useState(false);
  const [fotoZoomTampil, setFotoZoomTampil] = useState(false);

  const snapshotTersimpan = useRef(JSON.stringify(PROFIL_KOSONG));
  const t = useMemo(() => (modeGelap ? TEMA.gelap : TEMA.terang), [modeGelap]);
  const styles = useMemo(() => buatStyles(t), [t]);

  useEffect(() => {
    async function muatProfil() {
      try {
        const [json, temaTersimpan] = await Promise.all([
          AsyncStorage.getItem(PROFIL_KEY),
          AsyncStorage.getItem('@profilecard_tema'),
        ]);
        if (temaTersimpan != null) {
          setModeGelap(temaTersimpan === 'gelap');
        }
        if (json != null) {
          const data = JSON.parse(json);
          setFoto(data.foto ?? null);
          setNama(data.nama ?? '');
          setHp(data.hp ?? '');
          setEmail(data.email ?? '');
          setBio(data.bio ?? '');
          setLokasi(data.lokasi ?? null);
          setAlamat(data.alamat ?? null);
          setRiwayatLokasi(data.riwayatLokasi ?? []);
          snapshotTersimpan.current = json;
        }
      } catch (e) {
        console.log('Gagal memuat profil:', e);
      } finally {
        setMemuat(false);
      }
    }
    muatProfil();
  }, []);

  const dataSaatIni = useMemo(
    () => ({ foto, nama, hp, email, bio, lokasi, alamat, riwayatLokasi }),
    [foto, nama, hp, email, bio, lokasi, alamat, riwayatLokasi]
  );

  const adaPerubahan = useMemo(
    () => JSON.stringify(dataSaatIni) !== snapshotTersimpan.current,
    [dataSaatIni]
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const onBackPress = () => {
      if (!adaPerubahan) return false;
      Alert.alert(
        'Perubahan Belum Disimpan',
        'Kamu punya perubahan yang belum disimpan. Yakin ingin keluar?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Keluar Tanpa Simpan',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ]
      );
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [adaPerubahan]);

  const kompresFoto = useCallback(async (uriAsli) => {
    try {
      const hasil = await ImageManipulator.manipulateAsync(
        uriAsli,
        [{ resize: { width: 600 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      return hasil.uri;
    } catch (e) {
      console.log('Gagal kompres foto, pakai asli:', e);
      return uriAsli;
    }
  }, []);

  const ambilFoto = useCallback(async () => {
    const izin = await ImagePicker.requestCameraPermissionsAsync();
    if (izin.status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi butuh izin kamera.');
      return;
    }
    const hasil = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!hasil.canceled) {
      const uri = await kompresFoto(hasil.assets[0].uri);
      setFoto(uri);
    }
  }, [kompresFoto]);

  const pilihDariGaleri = useCallback(async () => {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (izin.status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi butuh izin galeri.');
      return;
    }
    const hasil = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!hasil.canceled) {
      const uri = await kompresFoto(hasil.assets[0].uri);
      setFoto(uri);
    }
  }, [kompresFoto]);

  const ubahFoto = useCallback(() => {
    Alert.alert('Ubah Foto Profil', 'Pilih sumber foto:', [
      { text: '📸 Kamera', onPress: ambilFoto },
      { text: '🖼️ Galeri', onPress: pilihDariGaleri },
      { text: 'Batal', style: 'cancel' },
    ]);
  }, [ambilFoto, pilihDariGaleri]);

  const ambilLokasi = useCallback(async () => {
    const izin = await Location.requestForegroundPermissionsAsync();
    if (izin.status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi butuh izin lokasi.');
      return;
    }
    try {
      setMencariLokasi(true);
      const posisi = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const koordinatBaru = {
        latitude: posisi.coords.latitude,
        longitude: posisi.coords.longitude,
      };
      setLokasi(koordinatBaru);
      let alamatBaru = null;
      try {
        const hasilGeocode = await Location.reverseGeocodeAsync(koordinatBaru);
        if (hasilGeocode.length > 0) {
          const a = hasilGeocode[0];
          alamatBaru = [a.street, a.subregion || a.city, a.region]
            .filter(Boolean)
            .join(', ');
        }
      } catch (e) {
        console.log('Reverse geocoding gagal:', e);
      }
      setAlamat(alamatBaru);
      const entriBaru = {
        ...koordinatBaru,
        alamat: alamatBaru,
        waktu: new Date().toISOString(),
      };
      setRiwayatLokasi((prev) => [entriBaru, ...prev].slice(0, MAX_RIWAYAT_LOKASI));
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat mengambil lokasi.');
    } finally {
      setMencariLokasi(false);
    }
  }, []);

  const simpanProfil = useCallback(async () => {
    const namaBersih = nama.trim();
    const polaNama = /^[A-Za-zÀ-ÿ' .-]+$/;
    if (!namaBersih) {
      Alert.alert('Nama Kosong', 'Silakan isi nama.');
      return;
    }
    if (!polaNama.test(namaBersih)) {
      Alert.alert('Nama Tidak Valid', 'Nama hanya boleh huruf, spasi, titik, dll.');
      return;
    }
    const emailBersih = email.trim();
    const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailBersih && !polaEmail.test(emailBersih)) {
      Alert.alert('Email Tidak Valid', 'Format email salah.');
      return;
    }
    const hpTerformat = hp.trim() ? formatNomorHp(hp.trim()) : '';
    const polaHp = /^\+?[0-9\s-]{8,17}$/;
    if (hpTerformat && !polaHp.test(hpTerformat)) {
      Alert.alert('Nomor HP Tidak Valid', 'Gunakan angka saja.');
      return;
    }
    setHp(hpTerformat);
    try {
      setMenyimpan(true);
      const dataUntukSimpan = {
        foto,
        nama: namaBersih,
        hp: hpTerformat,
        email: emailBersih,
        bio: bio.trim(),
        lokasi,
        alamat,
        riwayatLokasi,
      };
      const json = JSON.stringify(dataUntukSimpan);
      await AsyncStorage.setItem(PROFIL_KEY, json);
      snapshotTersimpan.current = json;
      Alert.alert('Tersimpan!', 'Profil berhasil disimpan.');
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan profil.');
    } finally {
      setMenyimpan(false);
    }
  }, [foto, nama, hp, email, bio, lokasi, alamat, riwayatLokasi]);

  const hapusProfil = useCallback(() => {
    Alert.alert('Hapus Profil?', 'Semua data akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(PROFIL_KEY);
            setFoto(null); setNama(''); setHp(''); setEmail(''); setBio('');
            setLokasi(null); setAlamat(null); setRiwayatLokasi([]);
            snapshotTersimpan.current = JSON.stringify(PROFIL_KOSONG);
            Alert.alert('Terhapus', 'Profil telah dikosongkan.');
          } catch (e) {
            Alert.alert('Gagal', 'Gagal menghapus profil.');
          }
        },
      },
    ]);
  }, []);

  const shareProfil = useCallback(async () => {
    if (!nama.trim()) {
      Alert.alert('Belum Ada Data', 'Isi profil dulu.');
      return;
    }
    const baris = [
      `👤 ${nama}`,
      hp ? `📱 ${hp}` : null,
      email ? `✉️ ${email}` : null,
      bio ? `📝 ${bio}` : null,
      alamat ? `📍 ${alamat}` : null,
    ].filter(Boolean);
    try {
      await Share.share({ message: baris.join('\n') });
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat membagikan profil.');
    }
  }, [nama, hp, email, bio, alamat]);

  const gantiTema = useCallback(async (nilai) => {
    setModeGelap(nilai);
    try {
      await AsyncStorage.setItem('@profilecard_tema', nilai ? 'gelap' : 'terang');
    } catch (e) {
      console.log('Gagal menyimpan tema:', e);
    }
  }, []);

  const persenLengkap = useMemo(() => {
    const field = [foto, nama.trim(), hp.trim(), email.trim(), bio.trim(), lokasi];
    const terisi = field.filter(Boolean).length;
    return Math.round((terisi / field.length) * 100);
  }, [foto, nama, hp, email, bio, lokasi]);

  const opasitas = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const animasi = Animated.loop(
      Animated.sequence([
        Animated.timing(opasitas, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opasitas, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    animasi.start();
    return () => animasi.stop();
  }, [opasitas]);

  if (memuat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Animated.View style={[styles.skeletonAvatar, { opacity: opasitas }]} />
          <Animated.View style={[styles.skeletonBaris, { opacity: opasitas, width: '70%' }]} />
          <Animated.View style={[styles.skeletonBaris, { opacity: opasitas, width: '50%' }]} />
          <Animated.View style={[styles.skeletonBaris, { opacity: opasitas, width: '85%' }]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ width: '100%', flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBaris}>
            <Text style={styles.title}>👤 ProfileCard</Text>
            <View style={styles.toggleTema}>
              <Text style={styles.toggleLabel}>{modeGelap ? '🌙' : '☀️'}</Text>
              <Switch
                value={modeGelap}
                onValueChange={gantiTema}
                trackColor={{ false: '#ccc', true: t.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${persenLengkap}%` }]} />
              </View>
              <Text style={styles.progressText}>Profil {persenLengkap}% lengkap</Text>
            </View>

            <TouchableOpacity
              onPress={() => foto && setFotoZoomTampil(true)}
              activeOpacity={foto ? 0.8 : 1}
            >
              {foto ? (
                <Image source={{ uri: foto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarKosong]}>
                  <Text style={{ fontSize: 40 }}>📷</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.inputNama}
              placeholder="Masukkan nama..."
              placeholderTextColor={t.muted}
              value={nama}
              onChangeText={setNama}
              textAlign="center"
              maxLength={40}
            />

            <View style={styles.grupDetail}>
              <View style={styles.baris}>
                <Text style={styles.label}>📱</Text>
                <TextInput
                  style={styles.inputDetail}
                  placeholder="Nomor HP"
                  placeholderTextColor={t.muted}
                  value={hp}
                  onChangeText={setHp}
                  onEndEditing={() => setHp((prev) => (prev.trim() ? formatNomorHp(prev.trim()) : prev))}
                  keyboardType="phone-pad"
                  maxLength={17}
                />
              </View>
              <View style={styles.baris}>
                <Text style={styles.label}>✉️</Text>
                <TextInput
                  style={styles.inputDetail}
                  placeholder="Alamat email"
                  placeholderTextColor={t.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={50}
                />
              </View>
              <TextInput
                style={styles.inputBio}
                placeholder="Tulis bio singkat tentang dirimu..."
                placeholderTextColor={t.muted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                maxLength={140}
              />
              <Text style={styles.hitungKarakter}>{bio.length}/140</Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={ubahFoto} activeOpacity={0.8}>
              <Text style={styles.btnText}>✏️ Ubah Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnSekunder]} onPress={pilihDariGaleri} activeOpacity={0.8}>
              <Text style={[styles.btnText, { color: t.primary }]}>🖼️ Dari Galeri</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnLokasi]}
              onPress={ambilLokasi}
              disabled={mencariLokasi}
              activeOpacity={0.8}
            >
              {mencariLokasi ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnText}>📍 Lokasi Saya</Text>
              )}
            </TouchableOpacity>

            {lokasi && (
              <View style={styles.lokasiInfo}>
                <Text style={styles.koordinat}>
                  📍 {alamat ? alamat : `${lokasi.latitude.toFixed(5)}, ${lokasi.longitude.toFixed(5)}`}
                </Text>
              </View>
            )}

            {riwayatLokasi.length > 0 && (
              <View style={styles.riwayatWrap}>
                <Text style={styles.riwayatJudul}>Riwayat Lokasi</Text>
                {riwayatLokasi.map((entri, idx) => (
                  <Text key={entri.waktu + idx} style={styles.riwayatItem} numberOfLines={1}>
                    • {entri.alamat || `${entri.latitude.toFixed(4)}, ${entri.longitude.toFixed(4)}`}
                    {'  '}
                    <Text style={styles.riwayatWaktu}>
                      ({new Date(entri.waktu).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})
                    </Text>
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, styles.btnSimpan]}
              onPress={simpanProfil}
              disabled={menyimpan}
              activeOpacity={0.8}
            >
              {menyimpan ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnText}>💾 Simpan Profil</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnShare]} onPress={shareProfil} activeOpacity={0.8}>
              <Text style={styles.btnText}>📤 Bagikan Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnHapus]} onPress={hapusProfil} activeOpacity={0.8}>
              <Text style={[styles.btnText, { color: t.merah }]}>🗑️ Hapus Profil</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={fotoZoomTampil} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalTutup}
            onPress={() => setFotoZoomTampil(false)}
          >
            <Text style={styles.modalTutupText}>✕</Text>
          </TouchableOpacity>
          {foto && <Image source={{ uri: foto }} style={styles.fotoZoom} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function buatStyles(t) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      alignItems: 'center',
      paddingTop: 50,
      paddingBottom: 40,
      paddingHorizontal: 20,
      flexGrow: 1,
      width: '100%',
    },
    headerBaris: {
      width: '100%',
      maxWidth: 340,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: t.text,
    },
    toggleTema: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    toggleLabel: {
      fontSize: 16,
      marginRight: 4,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: t.card,
      borderRadius: 20,
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    progressWrap: {
      width: '100%',
      marginBottom: 20,
    },
    progressTrack: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      backgroundColor: t.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: t.primary,
      borderRadius: 4,
    },
    progressText: {
      marginTop: 6,
      fontSize: 12,
      color: t.muted,
      textAlign: 'center',
    },
    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: t.primary,
    },
    avatarKosong: {
      backgroundColor: t.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputNama: {
      fontSize: 18,
      fontWeight: '600',
      color: t.text,
      borderBottomWidth: 1.5,
      borderBottomColor: t.primary,
      width: '90%',
      paddingVertical: 6,
      marginBottom: 20,
    },
    grupDetail: {
      width: '100%',
      marginBottom: 8,
    },
    baris: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      marginBottom: 10,
      paddingBottom: 4,
    },
    label: {
      fontSize: 16,
      marginRight: 8,
    },
    inputDetail: {
      flex: 1,
      fontSize: 14,
      color: t.text,
      paddingVertical: 4,
    },
    inputBio: {
      width: '100%',
      fontSize: 14,
      color: t.text,
      backgroundColor: t.inputBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.border,
      padding: 10,
      minHeight: 64,
      textAlignVertical: 'top',
      marginTop: 4,
    },
    hitungKarakter: {
      alignSelf: 'flex-end',
      fontSize: 11,
      color: t.muted,
      marginTop: 2,
      marginBottom: 8,
    },
    btn: {
      backgroundColor: t.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 12,
      width: '100%',
      alignItems: 'center',
    },
    btnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
      textAlign: 'center',
    },
    btnSekunder: {
      backgroundColor: t.primarySoft,
      borderWidth: 1,
      borderColor: t.primary,
    },
    btnLokasi: {
      backgroundColor: t.biru,
    },
    btnSimpan: {
      backgroundColor: t.ungu,
    },
    btnShare: {
      backgroundColor: '#636e72',
    },
    btnHapus: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: t.merah,
    },
    lokasiInfo: {
      width: '100%',
      marginTop: 4,
    },
    koordinat: {
      marginTop: 12,
      fontSize: 13,
      color: t.biru,
      fontWeight: '600',
      textAlign: 'center',
    },
    riwayatWrap: {
      width: '100%',
      marginTop: 14,
      padding: 10,
      backgroundColor: t.inputBg,
      borderRadius: 10,
    },
    riwayatJudul: {
      fontSize: 12,
      fontWeight: 'bold',
      color: t.muted,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    riwayatItem: {
      fontSize: 12,
      color: t.text,
      marginBottom: 4,
    },
    riwayatWaktu: {
      color: t.muted,
      fontSize: 11,
    },
    skeletonAvatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: t.skeleton,
      marginBottom: 20,
    },
    skeletonBaris: {
      height: 14,
      borderRadius: 7,
      backgroundColor: t.skeleton,
      marginBottom: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTutup: {
      position: 'absolute',
      top: 50,
      right: 24,
      zIndex: 1,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTutupText: {
      color: '#fff',
      fontSize: 20,
    },
    fotoZoom: {
      width: '90%',
      height: '70%',
    },
  });
}