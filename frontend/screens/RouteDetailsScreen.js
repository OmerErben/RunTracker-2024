import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RouteDetailsScreen = ({ route }) => {
    const { steepness, shadow, score, water_dispenser, difficulty, view_rating, route_name, wind_level, length,
    activity_type} = route.params;

    console.log(route.params);
    return (
        <View style={styles.container}>
            <Text style={styles.title}> Name: {route_name}</Text>
            <Text style={styles.detail}>Score: {score}</Text>
            <Text style={styles.detail}>Length: {length}</Text>
            <Text style={styles.detail}>Difficulty: {difficulty}</Text>
            <Text style={styles.detail}>Activity Type: {activity_type}</Text>
            <Text style={styles.detail}>Steepness: {steepness}</Text>
            <Text style={styles.detail}>Shadow: {shadow}</Text>
            <Text style={styles.detail}>View Rating: {view_rating}</Text>
            <Text style={styles.detail}>Wind Level: {wind_level}</Text>
            <Text style={styles.detail}>Water Dispensers: {water_dispenser}</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#0093ee',
    },
    detailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 16,
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    value: {
        fontSize: 18,
        fontWeight: '400',
        color: '#555',
    },
});

export default RouteDetailsScreen;
