import React, {useState} from 'react';
import {View, Text, StyleSheet, Button, Alert, ActivityIndicator} from 'react-native';

const RouteDetailsScreen = ({ route, navigation }) => {
    const [loading, setLoading] = useState(false);
    const {
        steepness,
        shadow,
        score,
        water_dispenser,
        difficulty,
        view_rating,
        route_name,
        wind_level,
        length,
        activity_type,
        super_user,
        partition_key,
        row_key,
        user_name,
        high_score,
        liked,
        run_count,
        last_run_date
    } = route.params;


    const handleDeleteRoute = () => {
        setLoading(true);
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
            setLoading(false);
            if (response.status === 200) {
                Alert.alert('Success', 'Route deleted successfully');
                navigation.navigate("Home", {superUser: super_user, userName: user_name})
            } else {
                Alert.alert('Error', 'Failed to delete the route');
            }
        }).catch((error) => {
            setLoading(false);
            console.error(error);
            Alert.alert('Error', 'An error occurred');
        });
    };

    const handleRateRoute = () => {
        navigation.navigate('UpdateRoute', {
            steepness,
            shadow,
            score,
            water_dispenser,
            difficulty,
            view_rating,
            route_name,
            wind_level,
            length,
            activity_type,
            partition_key,
            row_key,
            super_user,
            user_name,
            high_score,
            liked,
            run_count,
            last_run_date
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Name: {route_name}</Text>
            <Text style={styles.detail}>Score: {score.toFixed(3)}</Text>
            <Text style={styles.detail}>Length: {length}</Text>
            <Text style={styles.detail}>Difficulty: {difficulty}</Text>
            <Text style={styles.detail}>Activity Type: {activity_type}</Text>
            <Text style={styles.detail}>Steepness: {steepness}</Text>
            <Text style={styles.detail}>Shadow: {shadow}</Text>
            <Text style={styles.detail}>View Rating: {view_rating}</Text>
            <Text style={styles.detail}>Wind Level: {wind_level}</Text>
            <Text style={styles.detail}>Water Dispensers: {water_dispenser}</Text>
            <Text style={styles.smallTitle}>My Personal Info</Text>
            <Text style={styles.detail}>Personal High Score: {high_score}</Text>
            <Text style={styles.detail}>Liked: {liked !== undefined ? (liked === true ? "True" : "False") : ""}</Text>
            <Text style={styles.detail}>My Last Run Date: {last_run_date}</Text>
            <Text style={styles.detail}>My Run Count: {run_count}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#6200ee" />
            ) : (
            <View style={styles.buttonContainer}>
                <Button title="Delete Route" onPress={handleDeleteRoute} color="#ff0000" disabled={!super_user}/>
                <Button title="Rate Route" onPress={handleRateRoute} color="#6200ee" />
            </View>)}
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
    detail: {
        fontSize: 18,
        marginBottom: 8,
        color: '#333',
    },
    buttonContainer: {
        marginTop: 20,
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    smallTitle: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#000000',
    },
});

export default RouteDetailsScreen;
