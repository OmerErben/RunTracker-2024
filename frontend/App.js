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
  const [counter, setCounter] = useState(null);
  // Lets add a connection state for SignalR
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

    signalrConnection.on('newCountUpdate', (message) => {
      setCounter(parseInt(message));
    });


    signalrConnection.onclose(() => {
      console.log('Connection closed.');
    });
    
    setConnection(signalrConnection); 

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
  


  const increaseCounter = () => {
    fetch("https://assignment1-sophie-miki-omer.azurewebsites.net/api/IncreaseCounter?code=RMpgUeQA1CPRfoPC5Y9QBIYXz35rQD0gFMvXD442rRLuAzFuTtHBwA%3D%3D", {
      method: 'GET',
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setCounter(parseInt(text));
    }).catch(
      (error) => { console.error(error); }
    );
  };

  const decreaseCounter = () => {
    fetch("https://assignment1-sophie-miki-omer.azurewebsites.net/api/DecreaseCounter?code=p21dem8bSCSI2ZDp4-xTLOWx-aqQdi1aYeZ7fGYK9Z8gAzFuEP5n2A%3D%3D", {
      method: 'GET',
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setCounter(parseInt(text));
    }).catch(
      (error) => { console.error(error); }
    );
  };

  // Note: We also support reading the counter value
  // This will be used to initialize the counter value upon
  // Startup.
  const readCounter = () => {
    fetch("https://assignment1-sophie-miki-omer.azurewebsites.net/api/ReadCounter?code=qSGXkNJ5RuRgF-bhqbjxFpVevLnQ1NBKsGt79Xp7M_mdAzFuXdIIbA%3D%3D", {
      method: 'GET',
    }).then((response) => {
      return response.text();
    }).then((text) => {
      setCounter(parseInt(text));
    }).catch(
      (error) => { console.error(error); }
    );
  };


  readCounter();
  
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
          <Stack.Screen name="UpdateRoute" component={UpdateRouteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    /*<View style={styles.container}>
      <Text style={styles.counterText}>Counter: {counter}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Increase" onPress={increaseCounter} />
        <Button title="Decrease" onPress={decreaseCounter} />
      </View>
    </View>*/
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  counterText: {
    fontSize: 32,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
});