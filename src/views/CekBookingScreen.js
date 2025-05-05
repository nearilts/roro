import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { CommonActions } from '@react-navigation/native';

const CekBookingScreen = ({ navigation }) => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [Email, setEmail] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const fetchBookingDetail = async () => {
    if ( !bookingNumber || !Email) {
      alert('Masukkan No Booking terlebih dahulu!');
      return;
    }

    setButtonLoading(true);
    try {
      setBookingData(null);

      const response = await fetch('https://cigading.krakatauport.id:8020/api/roro/check_booking_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value1: bookingNumber,
          value2: Email,
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

  const { booking, down_payment, project_detail } = bookingData || {};
  const roroBooking = booking?.roro_booking;

  return (
    <ScrollView>
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

          <TextInput
            style={styles.input}
            placeholder="Masukkan No Booking"
            value={bookingNumber}
            onChangeText={setBookingNumber}
          />

          <TextInput
            style={styles.input}
            placeholder="Masukkan Email"
            value={Email}
            onChangeText={setEmail}
          />
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
                <Text style={styles.label}>Nama Pemesan:</Text>
                <Text style={styles.value}>{roroBooking?.order_name}</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Status Pembayaran:</Text>
                <Text style={[styles.value, { color: 'red' }]}>Belum Lunas</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>No Booking:</Text>
                <Text style={styles.value}>{booking?.no_booking}</Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>Batas Waktu Pembayaran:</Text>
                <Text style={styles.value}>{down_payment?.expired_date}</Text>
              </View>

              <View style={styles.separator} />

              {project_detail.map((item, index) => (
                <View style={[styles.rowBetween, { alignItems: 'flex-start', marginBottom: 4 }]} key={index}>
                  <Text style={[styles.label, { flex: 1, paddingRight: 8 }]} numberOfLines={2}>
                    {item.service_code.name}
                  </Text>
                  <Text style={[styles.value, { textAlign: 'right' }]}>
                    Rp{parseInt(item.val_formula_1).toLocaleString('id-ID')},000
                  </Text>
                </View>
              ))}

              <View style={styles.rowBetween}>
                <Text style={[styles.label, { fontWeight: 'bold' }]}>Jumlah yang harus dibayar</Text>
                <Text style={[styles.value, { fontWeight: 'bold' }]}>
                  Rp{project_detail.reduce((sum, item) => sum + parseInt(item.val_formula_1), 0).toLocaleString('id-ID')},000
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Silahkan melakukan pembayaran melalui <Text style={styles.bold}>Bank Mandiri</Text> menggunakan Referensi No:
                  <Text style={styles.reference}> {bookingData?.bp_no}</Text>
                </Text>
                <Text style={[styles.infoText, { marginTop: 8 }]}>
                  Untuk Bank lain, gunakan Referensi No: <Text style={styles.reference}> {bookingData?.va_no}</Text>
                </Text>
              </View>
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
    flex:1,
    top:10
  },
  leftContent: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 50,
  }
  ,container: {
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
  timer: {
    fontSize: 12,
    color: 'gray',
    marginTop: -6,
    marginBottom: 8,
    textAlign: 'right',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#1e293b',
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
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
  },
});

export default CekBookingScreen;
