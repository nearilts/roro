import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StatusBar, Alert, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS, IMAGE_URLS } from '../config/api';

const CekBookingScreen = ({ navigation }) => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [Email, setEmail] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  
  // QR Scanner states
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Request camera permission when component mounts
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    setBookingNumber(data); 
    setShowScanner(false);
    
    // Show success message first
    Alert.alert(
      'QR Code Berhasil Dipindai',
      `No Booking: ${data}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Add delay to ensure state updates
            setTimeout(() => {
              fetchBookingDetailWithNumber(data);
            }, 500);
          }
        }
      ]
    );
  };

  const openQRScanner = () => {
    if (hasPermission === null) {
      Alert.alert('Meminta Izin', 'Meminta izin akses kamera...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert(
        'Izin Kamera Ditolak',
        'Aplikasi memerlukan akses kamera untuk memindai QR code. Silakan aktifkan di pengaturan.',
        [{ text: 'OK' }]
      );
      return;
    }
    setScanned(false);
    setShowScanner(true);
  };

  const fetchBookingDetail = async () => {
    if (!bookingNumber) {
      Alert.alert('Peringatan', 'Masukkan No Booking terlebih dahulu!');
      return;
    }

    setButtonLoading(true);
    try {
      setBookingData(null);

      const response = await fetch(API_URLS.CHECK_BOOKING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value1: bookingNumber,
          // value2: Email,
        }),
      });

      const json = await response.json();
      console.log('Response JSON:', json);

      if (json.code === 200) {
        setBookingData(json.data);
        Alert.alert('Sukses', 'Data booking berhasil ditemukan!');
      } else {
        setBookingData(null);
        Alert.alert('Tidak Ditemukan', 'No Booking tidak ditemukan di sistem.');
        console.error('Error fetching booking data:', json.message);
      }
    } catch (error) {
      setBookingData(null);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
      console.error('Fetch error:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  // Fungsi khusus untuk QR Scanner dengan parameter
  const fetchBookingDetailWithNumber = async (number) => {
    console.log('fetchBookingDetailWithNumber called with:', number);
    
    if (!number || typeof number !== 'string') {
      Alert.alert('Error', 'Nomor booking tidak valid!');
      return;
    }

    setButtonLoading(true);
    try {
      setBookingData(null);
      console.log('Making API call to:', API_URLS.CHECK_BOOKING);

      const response = await fetch(API_URLS.CHECK_BOOKING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value1: number.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log('Response JSON:', json);

      if (json.code === 200 && json.data) {
        setBookingData(json.data);
        Alert.alert('Sukses', 'Data booking berhasil ditemukan!');
      } else {
        setBookingData(null);
        Alert.alert('Tidak Ditemukan', 'No Booking tidak ditemukan di sistem.');
        console.error('Error fetching booking data:', json.message || 'Unknown error');
      }
    } catch (error) {
      setBookingData(null);
      console.error('Fetch error details:', error);
      Alert.alert('Error', `Terjadi kesalahan: ${error.message}. Silakan coba lagi.`);
    } finally {
      setButtonLoading(false);
    }
  };

  // QR Scanner Component
  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <StatusBar translucent backgroundColor="#000" />
        {hasPermission ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
          />
        ) : (
          <View style={styles.permissionError}>
            <Text style={styles.permissionErrorText}>
              Kamera tidak tersedia atau izin ditolak
            </Text>
          </View>
        )}
        
        {/* Scanner Overlay */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowScanner(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.scannerFrame}>
            <View style={styles.scannerBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
          
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerText}>
              Arahkan kamera ke QR Code No Booking
            </Text>
            {scanned && (
              <TouchableOpacity 
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanText}>Pindai Ulang</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  const { booking, down_payment, project_detail } = bookingData || {};
  const roroBooking = booking?.roro_booking;

  return (
    <ScrollView>
      <StatusBar translucent backgroundColor="#01468A" />
      
      <View style={styles.headerContainer}>
        <View style={styles.leftContent}>
          <Image
            source={{ uri: IMAGE_URLS.LOGO }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Cek Booking</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan No Booking"
              value={bookingNumber}
              onChangeText={setBookingNumber}
              placeholderTextColor="#64748b"
            />
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={openQRScanner}
            >
              <Ionicons name="qr-code" size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={fetchBookingDetail} disabled={buttonLoading}>
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cari Booking</Text>
            )}
          </TouchableOpacity>

          {bookingData && (
            <>
              <View style={styles.separator} />

              <Text style={styles.title}>Rincian Pembayaran</Text>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Tanggal Booking:</Text>
                <Text style={styles.value}>{new Date(booking?.created).toLocaleDateString('id-ID')}</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Golongan:</Text>
                <Text style={styles.value}>{roroBooking?.golongan}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Plat Nomor:</Text>
                <Text style={styles.value}>{roroBooking?.police_number}</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>No Booking:</Text>
                <Text style={styles.value}>{booking?.no_booking}</Text>
              </View>

              <View style={styles.rowBetween}>
              <Text style={styles.label}>Status:</Text>
              <View style={[
                styles.statusBox,
                roroBooking?.status_alp === 'released' && styles.statusReleased,
                roroBooking?.status_alp === 'cancel' && styles.statusCancel,
                roroBooking?.status_alp === 'onBoard' && styles.statusOnBoard,
                roroBooking?.status_alp === 'cancelBoarding' && styles.statusCancel // gunakan gaya cancel
              ]}>
                 <Text style={[
                   roroBooking?.status_alp === 'released' && styles.statusTextReleased,
                   roroBooking?.status_alp === 'cancel' && styles.statusTextCancel,
                   roroBooking?.status_alp === 'onBoard' && styles.statusTextOnBoard,
                   roroBooking?.status_alp === 'cancelBoarding' && styles.statusTextCancel
                 ]}>
                {roroBooking?.status_alp === 'released' && 'RELEASED'}
                {roroBooking?.status_alp === 'cancel' && 'CANCEL'}
                {roroBooking?.status_alp === 'onBoard' && 'ON BOARD'}
                {roroBooking?.status_alp === 'cancelBoarding' && 'CANCEL BOARDING'}
              </Text>
              </View>
            </View>

              <View style={styles.separator} />


              
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#01468A',
    padding: 16,
    alignItems: 'center',
    flex: 1,
    top: 10
  },
  leftContent: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 50,
  },
  container: {
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    fontSize: 14,
    marginRight: 8,
    color: '#1e293b',
  },
  qrButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#334155',
  },
  value: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 12,
  },
  infoBox: {
    backgroundColor: '#90CAF9',
    borderRadius: 12,
    padding: 12,
    alignItems:'center'
  },
  infoText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reference: {
    fontWeight: 'bold',
    color: '#334155',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // QR Scanner Styles
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingRight: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  scannerFrame: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#2563eb',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scannerFooter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  rescanButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  rescanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionErrorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Status Box Styles
  statusBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  statusReleased: {
    backgroundColor: '#dcfce7', // Light green background
    borderWidth: 1,
    borderColor: '#16a34a', // Green border
  },
  statusCancel: {
    backgroundColor: '#fef2f2', // Light red background
    borderWidth: 1,
    borderColor: '#dc2626', // Red border
  },
  statusOnBoard: {
    backgroundColor: '#dbeafe', // Light blue background
    borderWidth: 1,
    borderColor: '#2563eb', // Blue border
  },
  statusTextReleased: {
    fontSize: 12,
    color: '#16a34a', // Green text
    fontWeight: 'bold',
  },
  statusTextCancel: {
    fontSize: 12,
    color: '#dc2626', // Red text
    fontWeight: 'bold',
  },
  statusTextOnBoard: {
    fontSize: 12,
    color: '#2563eb', // Blue text
    fontWeight: 'bold',
  },
});

export default CekBookingScreen;