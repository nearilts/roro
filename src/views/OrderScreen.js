import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity,  ScrollView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Menu, TextInput,ActivityIndicator  } from 'react-native-paper';

const OrderHeader = ({navigation, route}) => {
  console.log(route.params)

  const DataSchedule = route.params;
  const [identity, setIdentity] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [domicile, setDomicile] = useState('');
  const [passengers, setPassengers] = useState([]);
  const [City, setCity] = useState(null);

  const handleAddPassenger = () => {
    if (!identity || !name || !age || !City)
      {
        alert(`Semua kolom wajib diisi.`);

        return;
      } 
    const newPassenger = {
      id: Date.now(),
      "no_document" : identity,
      "fullname" : name,
      age,
      "dwelling" : {
        "id" : City.id,
        "code" : City.id,
        "label" : City.name,
      },
    };
      console.log(newPassenger)
    setPassengers([...passengers, newPassenger]);
    setIdentity('');
    setName('');
    setAge('');
    setCity('');
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR' }).format(price);
  };
  const handleDelete = (id) => {
    setPassengers(passengers.filter((p) => p.id !== id));
  };

  const baseUrl = 'https://cigading.krakatauport.id:8020';

  const [Datas, setDatas] = useState([]);
  const [Vehicle, setVehicle] = useState([]);
  const [Citys, setCitys] = useState([]);
  
    const [originVisible, setOriginVisible] = useState(false);
    const [destVisible, setDestVisible] = useState(false);

  const [VehicleClass, setVehicleClass] = useState(null);


  const [formData, setFormData] = useState({
    t_vessel_schedule_id: DataSchedule.id,
    order_name: '',
    no_hp: '',
    email: '',
    police_number: '',
    golongan: '',
    golongan_id: '',
    jadwal_check_in: DataSchedule.est_departure,
  });

  const handleInputChange = (key, value) => {
    if (key == 'golongan_id') {
      setFormData({
        ...formData,
        golongan_id: value.id,
        golongan: value.name
      });
      console.log(value)
    }else{
      setFormData({ ...formData, [key]: value });
    }
   
  };

  
  const handleSaveOrder = () => {

    const requiredFields = [
      'email', 'no_hp', 'order_name', 'police_number',
      'golongan_id', 'golongan', 'jadwal_check_in',
      't_vessel_schedule_id'
    ];
  
    for (let field of requiredFields) {
      if (!formData[field]) {
        console.warn(`Field "${field}" wajib diisi.`);
        alert(`Field "${field}" wajib diisi.`);
        return;
      }
    }
  
    // Validasi passengers minimal 1
    if (!passengers || passengers.length === 0) {
      console.warn('Minimal harus ada 1 penumpang.');
      alert('Minimal harus ada 1 penumpang.');
      return;
    }

    const finalData = {
      ...formData,
      detail: passengers
    };
    
    console.log(finalData);
    fetchData(finalData)
    
  };
  const [isLoading, setLoading] = useState(false);

  const fetchData = async (finalData) => {
    setLoading(true);
    console.log("s",finalData)

    try {
      const response = await axios.post(`${baseUrl}/api/roro/booking`, finalData);

      console.log(response.data)
     if (response.data.code == 200) {
      alert('Berhasil Booking');
      navigation.navigate('PaymentDetailScreen', response.data);
     }
    } catch (error) {
      alert('Error fetching datas');
      console.log('Response data:', error.response.data); 
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const fetchPorts = async () => {
        try {
          // const DataSchedule = await axios.get(`${baseUrl}/api/roro/schedule?size=100`);
          const originRes = await axios.get(`${baseUrl}/api/roro/list_vehicle_class?size=100`);
          const destRes = await axios.get(`${baseUrl}/api/roro/list_city?size=100`);
          // console.log(DataSchedule.data.data)
          // setDatas(DataSchedule.data.data);
          setVehicle(originRes.data.data);
          setCitys(destRes.data.data);
        } catch (err) {
          console.error('Error fetching ports:', err);
        }
      };
  
      fetchPorts();
    }, []);

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

        <View style={styles.middleContent}>
          <Text style={styles.routeLabel}>Rute Perjalanan</Text>
          <View style={{flexDirection: 'row',
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginTop: 4,}}>
            <Text style={styles.portText}>{DataSchedule.origin_port}</Text>
            <Text style={styles.arrow}> → </Text>
            <Text style={styles.portText}>{DataSchedule.destination_port}</Text>
          </View>
          <View style={styles.dateRow}>
            <MaterialIcons name="schedule" size={16} color="white" />
            <Text style={styles.dateText}>{DataSchedule.est_departure}</Text>
          </View>
        </View>

        {/* <TouchableOpacity style={styles.policyButton}>
          <MaterialIcons name="warning" size={16} color="#fff" />
          <Text style={styles.policyText}>Lihat Kebijakan</Text>
        </TouchableOpacity> */}
      </View>

      <View>
        <Text style={styles.title}>Rincian Pesanan</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Pemesan</Text>

          <Text style={styles.label}>Nama Pemesan <Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={formData.order_name}
            onChangeText={(value) => handleInputChange('order_name', value)} 
            style={styles.input} 
            placeholder="Nama Pemesan Tiket"
            textColor="#000" // warna teks (input)
            placeholderTextColor="gray" // warna placeholder
            />

          <Text style={styles.label}>Nomor Handphone <Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={formData.no_hp}
            onChangeText={(value) => handleInputChange('no_hp', value)} 
            style={styles.input} 
            keyboardType="phone-pad" placeholder="08xxxxxxxx"
            textColor="#000" // warna teks (input)
            placeholderTextColor="gray" // warna placeholder
            />

          <Text style={styles.label}>E-mail <Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)} 
            style={styles.input} 
            keyboardType="email-address" placeholder="contoh@email.com"
            textColor="#000" // warna teks (input)
            placeholderTextColor="gray" // warna placeholder 
            />
        </View>
      </View>

      <View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Kendaraan</Text>

          <Text style={styles.label}>Nomor Polisi <Text style={styles.required}>*</Text></Text>
          <TextInput 
            value={formData.police_number}
            onChangeText={(value) => handleInputChange('police_number', value)} 
            style={styles.input} 
            textColor="#000" // warna teks (input)
            placeholderTextColor="gray" // warna placeholder
            keyboardType="default" placeholder="B1234XYZ" />

          <Text style={styles.label}>E-Golongan Kendaraan <Text style={styles.required}>*</Text></Text>
          <Menu
            visible={originVisible}
            onDismiss={() => setOriginVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setOriginVisible(true)}>
                <TextInput
                  label="Golongan"
                  value={VehicleClass?.name || ''}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                  style={styles.input}
                  textColor="#000" // warna teks (input)
                  placeholderTextColor="gray" // warna placeholder
                />
              </TouchableOpacity>
            }
          >
            {Vehicle.map((port) => (
              <Menu.Item
                key={port.id}
                onPress={() => {
                  setVehicleClass(port);
                  setOriginVisible(false);
                  handleInputChange('golongan_id', port);
                }}
                title={port.name}
              />
            ))}
          </Menu>
          
        </View>
      </View>
      <View style={styles.cardPrice}>
        <Text style={styles.headerText}>Informasi Jadwal dan Harga</Text>

        {/* Keberangkatan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="calendar-today" size={16} color="white" />
            <Text style={styles.sectionTitle}> KEBERANGKATAN</Text>
          </View>
          <View style={styles.routeRow}>
            <View style={styles.routeBox}>
              <Text style={styles.routeText}>{DataSchedule.origin_port}</Text>
            </View>
            <Text style={styles.arrow}> → </Text>

            {/* <Entypo name="arrow-long-right" size={24} color="white" style={{ marginHorizontal: 8 }} /> */}
            <View style={styles.routeBox}>
              <Text style={styles.routeText}>{DataSchedule.destination_port}</Text>
            </View>
          </View>
          <View style={styles.departureRow}>
            <MaterialIcons name="schedule" size={16} color="white" />
            <Text style={styles.departureText}> {DataSchedule.est_departure}</Text>
          </View>
        </View>

        {/* Rincian Harga */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <FontAwesome name="ticket" size={16} color="white" /> */}
            <Text style={styles.sectionTitle}> Rincian Harga</Text>
          </View>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>{VehicleClass?.name || ''}</Text>
             
            </View>
            <View>
              <Text style={styles.priceValue}> {formatPrice(VehicleClass?.tariff_ammount|| 0) }</Text>
            </View>

          </View>
          <Text style={{
                 color: 'white',
              }}>{VehicleClass?.description || ''}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Form Penumpang</Text>

        <Text style={styles.label}>Nomor Identitas (KTP/SIM) *</Text>
        <TextInput
          style={styles.input}
          placeholder="20241201"
          value={identity}
          onChangeText={setIdentity}
          textColor="#000" // warna teks (input)
          placeholderTextColor="gray" // warna placeholder
        />
        <Text style={styles.note}>
          Penumpang di bawah 18 tahun, silakan isi dengan tanggal lahir.
        </Text>

        <Text style={styles.label}>Nama Lengkap *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nama lengkap"
          value={name}
          onChangeText={setName}
          textColor="#000" // warna teks (input)
          placeholderTextColor="gray" // warna placeholder
        />

        <Text style={styles.label}>Usia *</Text>
        <TextInput
          style={styles.input}
          placeholder="17"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          textColor="#000" // warna teks (input)
          placeholderTextColor="gray" // warna placeholder
        />

        <Text style={styles.label}>Domisili *</Text>
        <Menu
            visible={destVisible}
            onDismiss={() => setDestVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setDestVisible(true)}>
                <TextInput
                  label="Domisili"
                  value={City?.name || ''}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                  style={styles.input}
                  textColor="#000" // warna teks (input)
                  placeholderTextColor="gray" // warna placeholder

                />
              </TouchableOpacity>
            }
          >
            {Citys.map((port) => (
              <Menu.Item
                key={port.id}
                onPress={() => {
                  setCity(port);
                  setDestVisible(false);
                }}
                title={port.name}
              />
            ))}
          </Menu>

        <TouchableOpacity style={styles.button} onPress={handleAddPassenger}>
          <Text style={styles.buttonText}>Tambah</Text>
        </TouchableOpacity>

        <View style={styles.table}>
          <Text style={styles.tableHeader}>Daftar Penumpang</Text>
          {passengers.length === 0 ? (
            <Text style={styles.noData}>No Data</Text>
          ) : (
            passengers.map((p, index) => (

              <View style={styles.tableRow} key={p.id}>
                 <View style={{flexDirection:'row'}}>
                  <Text style={styles.cell}>Penumpang {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleDelete(p.id)}>
                  <Text style={styles.delete}>Hapus</Text>
                </TouchableOpacity>
                </View>

                <View style={{flexDirection:'row'}}>
                  <Text style={{ fontSize: 13,  width: 70 }}>NIK</Text>
                  <Text style={styles.cell}> : {p.no_document}</Text>
                </View>
                <View style={{flexDirection:'row'}}>
                  <Text style={{ fontSize: 13,  width: 70 }}>Nama</Text>
                  <Text style={styles.cell}> : {p.fullname}</Text>
                </View>
                <View style={{flexDirection:'row'}}>
                  <Text style={{ fontSize: 13,  width: 70 }}>Usia</Text>
                  <Text style={styles.cell}> : {p.age}</Text>
                </View>
                <View style={{flexDirection:'row'}}>
                  <Text style={{ fontSize: 13,  width: 70 }}>Domisili</Text>
                  <Text style={styles.cell}> : {p.dwelling?.label}</Text>
                </View>
                
                
              </View>
            ))
          )}
        </View>
      </View>

      
      

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>INFORMASI PENTING:</Text>
        <Text style={styles.infoText}>
            1. Sesuai Peraturan Menteri Perhubungan Nomor 25 Tahun 2016 tentang Daftar Penumpang dan Kendaraan Angkutan Penyeberangan, apabila identitas dan jumlah penumpang dalam kendaraan tidak sesuai maka PT Krakatau Bandar Samudera dapat menolak tiket Anda;
        </Text>
        <Text style={styles.infoText}>
            2. Dengan menekan tombol "LANJUTKAN" di bawah, saya menyatakan bahwa data diri penumpang dan data kendaraan yang saya isi di atas adalah benar adanya. Jika saat proses menyeberang didapati ketidaksesuaian pada data diri penumpang dan data kendaraan saya, maka saya menerima diproses sesuai Syarat & Ketentuan PT Krakatau Bandar Samudera
        </Text>
        </View>

        <TouchableOpacity onPress={handleSaveOrder} style={[styles.button, { marginHorizontal: 16, marginBottom: 32 }]}>
        
        {isLoading ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
              <Text style={styles.buttonText} >Lanjutkan</Text>
            )}
            
        </TouchableOpacity>

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
  },
  middleContent: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  routeLabel: {
    color: '#fff',
    fontSize: 12,
  },
  routeBox: {
    flexDirection: 'row',
    backgroundColor: '#0255AD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  portText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  arrow: {
    color: '#fff',
    marginHorizontal: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  policyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
  },
  policyText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#1e293b',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#01468A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  table: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 16,
  },
  tableHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  tableRow: {
   borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  cell: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },
  delete: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  noData: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#D6EAF8',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#154360',
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },

  cardPrice: {
    backgroundColor: '#003366',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  routeBox: {
    backgroundColor: '#0E4C92',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  routeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  departureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departureText: {
    color: 'white',
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  priceValue: {
    color: 'white',
    fontWeight: 'bold',
  },

});

export default OrderHeader;
