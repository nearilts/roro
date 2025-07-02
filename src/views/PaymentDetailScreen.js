import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { CommonActions } from '@react-navigation/native';

const PaymentDetailScreen = ({ navigation, route }) => {
  console.log('params : ', route.params.data)
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const fetchBookingDetail = async () => {
    try {
      const response = await fetch('https://cigading.krakatauport.id:8020/api/roro/booking_detail/'+route.params.data.id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
       
      });

      const json = await response.json();
      console.log('Response JSON:', json);

      if (json.code === 200) {
        setBookingData(json.data);
      } else {
        console.error('Error fetching booking data:', json.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBookingDetail();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#01468A" />
      </View>
    );
  }

  if (!bookingData) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text style={{ color: '#dc2626', fontSize: 16 }}>Gagal mengambil data booking.</Text>
      </View>
    );
  }

  const { booking, down_payment, roro_booking_detail } = bookingData;
  const roroBooking = booking?.roro_booking;

  const fetchProjectDetail = async () => {
    setButtonLoading(true);
    try {
      await fetchBookingDetail();
    } finally {
      setButtonLoading(false);
    }
  };
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
          <Text style={styles.title}>Rincian Pembayaran</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Tanggal Booking:</Text>
            <Text style={styles.value}>{new Date(bookingData?.created).toLocaleDateString('id-ID')}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Email Pemesan:</Text>
            <Text style={styles.value}>{bookingData?.email}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Nama Pemesan:</Text>
            <Text style={styles.value}>{bookingData?.order_name}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Status Pembayaran:</Text>
            <Text style={[styles.value, { color: 'red' }]}>Belum Lunas</Text>
          </View>


          <View style={styles.separator} />

          
          <TouchableOpacity style={styles.button} onPress={fetchProjectDetail} disabled={buttonLoading}>
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Periksa Status</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                })
              );
            }}
          >
            <Text style={styles.buttonText}>Halaman Utama</Text>
          </TouchableOpacity>

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
    color: '#1e293b',
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
  timer: {
    fontSize: 12,
    color: '#64748b',
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
});

export default PaymentDetailScreen;
