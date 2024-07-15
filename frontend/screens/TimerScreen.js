import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';

const TimerScreen = ({ navigation, route }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerIntervalRef = useRef(null);
    const locationIntervalRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [row_key, setRowKey] = useState(null);
    const [partition_key, setPartitionKey] = useState(null);

    useEffect(() => {
        return () => {
            clearInterval(timerIntervalRef.current);
            clearInterval(locationIntervalRef.current);
        };
    }, []);

    const { user_name, super_user } = route.params;

    const startTimer = () => {
        setIsRunning(true);

        timerIntervalRef.current = setInterval(() => {
            setTime(prevTime => prevTime + 1);
        }, 1000);

        locationIntervalRef.current = setInterval(() => {
            sendLocationData();
        }, 5000);
    };

    const stopTimer = () => {
        setIsRunning(false);
        clearInterval(timerIntervalRef.current);
        clearInterval(locationIntervalRef.current);
    };

    const resetTimer = () => {
        setTime(0);
        setIsRunning(false);
        clearInterval(timerIntervalRef.current);
        clearInterval(locationIntervalRef.current);
    };

    const handleFail = () => {
        if (!partition_key || !row_key) {
            navigation.navigate("Home", { superUser: super_user, userName: user_name });
        }
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/RemoveRoute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                partition_key: partition_key,
                row_key: row_key
            }),
        }).then((response) => {
            if (response.status === 200) {
                Alert.alert('Success', 'Route deleted successfully');
                navigation.navigate("Home", { superUser: super_user, userName: user_name });
            } else {
                Alert.alert('Error', 'Failed to delete the route');
                navigation.navigate("Home", { superUser: super_user, userName: user_name });
            }
        }).catch((error) => {
            console.error(error);
            Alert.alert('Error', 'An error occurred');
            navigation.navigate("Home", { superUser: super_user, userName: user_name });
        });
    };

    const sendLocationData = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Location permission not granted');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            console.log(currentIndex)
            console.log("sending coordinates");

            fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/CollectCoordination`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name,
                    super_user,
                    index: currentIndex,
                    finish_status: false,
                    data: {
                        coordination: { latitude: latitude, longitude: longitude }
                    },
                    row_key: row_key,
                    partition_key: partition_key
                }),
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        console.log(data);
                        setRowKey(data["row_key"]);
                        setPartitionKey(data["partition_key"]);
                        setCurrentIndex(data["index"] + 1);
                        console.log(data["index"] + 1);
                        console.log(currentIndex);
                    });
                }
            }).catch(error => {
                console.error('Error sending location:', error);
            });
        } catch (error) {
            console.error('Error getting location:', error);
            handleFail();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.timerText}>{time}s</Text>
            {isRunning ? (
                <Button title="Stop" onPress={stopTimer} color="#ff0000" />
            ) : (
                <Button title="Start" onPress={startTimer} color="#00ff00" />
            )}
            {!isRunning && time > 0 && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={() => {
                        resetTimer();
                        navigation.navigate("Home", { superUser: super_user, userName: user_name })
                    }}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        resetTimer();
                        handleFail();
                    }}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    timerText: {
        fontSize: 48,
        marginBottom: 24,
        color: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    saveButton: {
        backgroundColor: '#00ff00',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: '#ff0000',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default TimerScreen;
