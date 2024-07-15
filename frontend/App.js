import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as SignalR from '@microsoft/signalr'
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RouteDetailsScreen from "./screens/RouteDetailsScreen";
import UpdateRouteScreen from "./screens/UpdateRouteScreen";

const Stack = createStackNavigator();

export default function App() {
  const [connection, setConnection] = useState(null);

  useEffect( () => {
    const signalrConnection = new SignalR.HubConnectionBuilder()
    .withUrl("https://assignment1-sophie-miki-omer.azurewebsites.net/api", {
      withCredentials: false, // We disable the credential for simplicity.
      // TODO: check what happens when you disable this flag  !
    })// Note we don't call the Negotiate directly, it will be called by the Client SDK
    .withAutomaticReconnect()
    .configureLogging(SignalR.LogLevel.Information)
    .build();

    // Start the connection
    const startConnection = async () => {
        try {
            await signalrConnection.start();
            console.log('SignalR connected.');
            setConnection(signalrConnection);
        } catch (err) {
            console.log('SignalR connection error:', err);
            setTimeout(startConnection, 5000); // Retry connection after 5 seconds
        }
    };

    startConnection();
  }, []);

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
          <Stack.Screen name="UpdateRoute" component={UpdateRouteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}