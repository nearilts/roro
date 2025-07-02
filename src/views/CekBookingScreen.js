import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StatusBar, Alert, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

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
    setScanned(true);
    setBookingNumber(data); 
    setShowScanner(false);
    Alert.alert(
      'QR Code Berhasil Dipindai',
      `No Booking: ${data}`,
      [{ text: 'OK', onPress: () => setScanned(false) }]
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
      alert('Masukkan No Booking terlebih dahulu!');
      return;
    }

    setButtonLoading(true);
    try {
      setBookingData(null);

      const response = await fetch('https://cigading.krakatauport.id:8020/api/roro/check_booking_ticked_id', {
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
      } else {
        setBookingData(null);
        alert('No Booking Tidak Ditemukan');
        console.error('Error fetching booking data:', json.message);
      }
    } catch (error) {
      setBookingData(null);
      alert('Fetch error');
      console.error('Fetch error:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  // QR Scanner Component
  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <StatusBar translucent backgroundColor="#000" />
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
        />
        
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
            source={{ uri: 'https://cigading.krakatauport.id:8021/_nuxt/img/kipos-4x-removebg-preview.948721e.png' }}
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
              textColor="#000"
              placeholderTextColor="gray"
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
                 <Text style={styles.infoText}>
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
    fontSize: 16,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
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
});

export default CekBookingScreen;