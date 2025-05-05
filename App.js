import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

import BookingScreen from './src/views/BookingScreen';
import OrderScreen from './src/views/OrderScreen';
import PaymentDetailScreen from './src/views/PaymentDetailScreen';
import CekBookingScreen from './src/views/CekBookingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Booking') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Cek Booking') {
            iconName = 'list';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Cek Booking" component={CekBookingScreen} />
    </Tab.Navigator>
  );
}

// Root App
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Tab as the main screen */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          {/* Add additional screens outside of tabs */}
          <Stack.Screen name="OrderScreen" component={OrderScreen} />
          <Stack.Screen name="PaymentDetailScreen" component={PaymentDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// Dummy Settings Screen
function DummySettingsScreen() {
  return null;
}
