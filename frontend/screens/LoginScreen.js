import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Snackbar } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from Expo

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true); // State for password visibility

    const handleLogin = () => {
        // Todo: Add real db
        if (email === 'user@example.com' && password === 'password') {
            navigation.navigate('Home');
        } else {
            setVisible(true);
        }
    };

    const handleSignUp = () => {
        // Todo: Add real option to sign up
        console.log("does nothing");
    };

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                />
                <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
                    <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={24} color="black" />
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <View style={styles.button}>
                    <Button title="Login" onPress={handleLogin} color="#6200ee" />
                </View>
                <View style={styles.button}>
                    <Button title="SignUp" onPress={handleSignUp} color="#6200ee" />
                </View>
            </View>
            <Snackbar visible={visible} onDismiss={() => setVisible(false)}> Login Failed </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        marginBottom: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    eyeIcon: {
        padding: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        width: '48%',
    },
});

export default LoginScreen;
