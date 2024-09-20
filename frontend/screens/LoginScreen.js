import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Snackbar } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const handleSignIn = () => {
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/SignIn?username=${email}&password=${password}`, {
            method: 'GET',
        }).then((response) => {
            if (response.status === 200){
                response.json().then(data => {
                    navigation.navigate('Home', {
                        superUser: data.superUser,
                        userName: email
                    });
                })
            }
            else {
                setSnackbarMessage('Login Failed');
                setVisible(true);
            }
        }).catch(
            (error) => {
                console.error(error);
                setSnackbarMessage('An error occurred');
                setVisible(true);
            }
        );
    };

    const handleSignUp = () => {
        fetch(`https://assignment1-sophie-miki-omer.azurewebsites.net/api/SignUp?username=${email}&password=${password}`, {
            method: 'GET',
        }).then((response) => {
            if (response.status === 201){
                setSnackbarMessage('Sign Up Successful');
                setVisible(true);
                navigation.navigate('Home', {
                    superUser: data.superUser,
                    userName: email
                });
            }
            else {
                setSnackbarMessage('Sign Up Failed');
                setVisible(true);
            }
        }).catch(
            (error) => {
                console.error(error);
                setSnackbarMessage('An error occurred');
                setVisible(true);
            }
        );
    };

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    return (
        <View style={styles.container}>

            <View style={styles.formContainer}>
                <Text style={styles.title}>Run Tracker</Text>

                <View style={styles.inputContainer}>

                    <Ionicons name="mail-outline" size={24} color="#3f43bf" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#888" // NEW: Added placeholder color
                    />
                </View>

                <View style={styles.inputContainer}>

                    <Ionicons name="lock-closed-outline" size={24} color="#3f43bf" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={secureTextEntry}
                        placeholderTextColor="#888"
                    />

                    <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
                        <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={24} color="#3f43bf" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={handleSignUp}>
                    <Text style={[styles.buttonText, styles.signUpButtonText]}>Sign Up</Text>
                </TouchableOpacity>
            </View>

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                action={{
                    label: 'Dismiss',
                    onPress: () => setVisible(false),
                }}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },

    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 32,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        marginBottom: 32,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#3f43bf',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderColor: '#3f43bf',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },

    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#333',
    },
    eyeIcon: {
        padding: 8,
    },

    button: {
        backgroundColor: '#3f43bf',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    signUpButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#3f43bf',
    },

    signUpButtonText: {
        color: '#3f43bf',
    },

    snackbar: {
        backgroundColor: '#333',
    },
});

export default LoginScreen;
