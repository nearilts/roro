import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image,FlatList, ScrollView, StatusBar } from 'react-native';
import { TextInput, Menu, Button, Text,ActivityIndicator  } from 'react-native-paper';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const BookingScreen = ({navigation}) => {
  const [portOrigins, setPortOrigins] = useState([]);
  const [portDestinations, setPortDestinations] = useState([]);
  const [originPort, setOriginPort] = useState(null);
  const [destinationPort, setDestinationPort] = useState(null);
  
  const [originVisible, setOriginVisible] = useState(false);
  const [destVisible, setDestVisible] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [departureDate, setDepartureDate] = useState(moment().format('YYYY-MM-DD'));
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const baseUrl = 'https://cigading.krakatauport.id:8020';

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const originRes = await axios.get(`${baseUrl}/api/roro/list_port_origin`);
        const destRes = await axios.get(`${baseUrl}/api/roro/list_port_destination`);
        setPortOrigins(originRes.data.data);
        setPortDestinations(destRes.data.data);
      } catch (err) {
        console.error('Error fetching ports:', err);
      }
    };

    fetchPorts();
  }, []);


  
  const fetchData = async () => {
    setLoading(true);
    console.log("s")

    try {
      const response = await axios.get(`${baseUrl}/api/roro/list_schedule`, {
        params: {
          origin_port: originPort?.name,
          destination_port: destinationPort?.name,
          est_departure: departureDate,
          size: 10,
          page: 1,
        },
      });
      const items = response.data.data.data.map((item, index) => ({
        id: item.id,
        vessel_name: item.vessel?.name || '-',
        est_arrival: item.est_arrival || '-',
        est_departure: item.est_departure || '-',
        origin_port: item.origin_port || '-',
        destination_port: item.dest_port || '-',
      }));
      setData(items);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || departureDate;
    setShowDatePicker(false);
    setDepartureDate(moment(currentDate).format('YYYY-MM-DD'));
  };

  
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={{ color:'#000'}}>{item.vessel_name}</Text>
      <Text style={{ color:'#000'}}>{item.est_departure}</Text>
      <Text style={{ color:'#000'}}>{item.origin_port} → {item.destination_port}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OrderScreen', item)}
        >
        <Text style={styles.buttonText}>Pesan Tiket</Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <ScrollView style={{}}>
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
      <Text style={styles.heading}>Pilih Pelabuhan</Text>

      {/* Origin Port */}
      <Menu
        visible={originVisible}
        onDismiss={() => setOriginVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setOriginVisible(true)}>
            <TextInput
              label="Pelabuhan Asal"
              value={originPort?.name || ''}
              editable={false}
              right={<TextInput.Icon icon="menu-down" />}
              style={{ backgroundColor: '#fff', borderColor: 'blue', borderWidth: 1,marginBottom:20 }} // Ganti border menjadi biru
              textColor="#000" // warna teks (input)
              placeholderTextColor="gray" // warna placeholder
            />
          </TouchableOpacity>
        }
      >
        {portOrigins.map((port) => (
          <Menu.Item
            key={port.id}
            onPress={() => {
              setOriginPort(port);
              setOriginVisible(false);
            }}
            title={port.name}
          />
        ))}
      </Menu>

      {/* Destination Port */}
      <Menu
        visible={destVisible}
        onDismiss={() => setDestVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setDestVisible(true)}>
            <TextInput
              label="Pelabuhan Tujuan"
              value={destinationPort?.name || ''}
              editable={false}
              right={<TextInput.Icon icon="menu-down" />}
              style={{ backgroundColor: '#fff', borderColor: 'blue', borderWidth: 1,marginBottom:20,color:'#000' }} // Ganti border menjadi biru
              textColor="#000" // warna teks (input)
              placeholderTextColor="gray" // warna placeholder
            />
          </TouchableOpacity>
        }
      >
        {portDestinations.map((port) => (
          <Menu.Item
            key={port.id}
            onPress={() => {
              setDestinationPort(port);
              setDestVisible(false);
            }}
            title={port.name}
          />
        ))}
      </Menu>

      {/* Departure Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          label="Tanggal Keberangkatan"
          value={departureDate}
          editable={false}
          right={<TextInput.Icon icon="calendar" />}
          style={{ backgroundColor: '#fff', borderColor: 'blue', borderWidth: 1,color:'#000'  }} // Ganti border menjadi biru
          textColor="#000" // warna teks (input)
          placeholderTextColor="gray" // warna placeholder
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(departureDate)}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
          style={{ backgroundColor: '#fff', borderColor: 'blue', borderWidth: 1,color:'#000'  }} 
          textColor="#000" // warna teks (input)
          placeholderTextColor="gray" // warna placeholder
        />
      )}

    <Button
        mode="contained"
        onPress={() =>fetchData()}
        style={{ marginTop: 20,backgroundColor: '#01468A',  borderWidth: 1, color:'#fff' }}
         textColor="#fff"
      >
        Cari
      </Button>


      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderItem}
          style={{ marginTop: 20, marginBottom:50 }}
        />
      )}
      </View>
    </ScrollView>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
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
    width: '100%',
    height: 80,
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#000'
  }, 
  itemRow: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#01468A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
  },
});
