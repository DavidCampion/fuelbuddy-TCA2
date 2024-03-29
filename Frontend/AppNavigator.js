import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesome5} from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import "core-js/stable/atob";
import axios from 'axios';
import {useAuth} from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import * as Progress from 'react-native-progress';
import {jwtDecode} from "jwt-decode";

import Welcome from './Screens/WelcomeScreen';
import Dashboard from './Screens/DashboardScreen';
import Map from './Screens/MapScreen';
import Scan from './Screens/ScanScreen'
import Friends from './Screens/FriendsScreen';
import Account from './Screens/AccountScreen';

import PersonalInfo from './Screens/PersonalInfoScreen';
import DeleteConfirm from './Screens/DeleteConfirmScreen';
import Vehicle from './Screens/VehicleScreen';
import Developer from './Screens/DeveloperScreen';

import Login from './Screens/LoginScreen';
import LoginVerify from './Screens/LoginVerifyScreen';
import Register from './Screens/RegisterScreen';
import RegisterVerify from './Screens/RegisterVerifyScreen';

const url = process.env.REACT_APP_BACKEND_URL

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6BFF91',
        zIndex: 100,
    },
});

const RegisterNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="Register" component={Register}/>
            <Stack.Screen name="RegisterVerify" component={RegisterVerify}/>
        </Stack.Navigator>
    );
};

const LoginNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="Login" component={Login}/>
            <Stack.Screen name="LoginVerify" component={LoginVerify}/>
        </Stack.Navigator>
    );
};

const AccountNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false
        }}>
            <Stack.Screen name="Account" component={Account}/>
            <Stack.Screen name="PersonalInfo" component={PersonalInfo}/>
            <Stack.Screen name="DeleteConfirm" component={DeleteConfirm}/>
            <Stack.Screen name="Vehicle" component={Vehicle}/>
            {/*<Stack.Screen name="Friends" component={Friends}/>*/}
            <Stack.Screen name="Developer" component={Developer}/>
        </Stack.Navigator>
    );
};

function LoadingScreen({isVisible}) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prevProgress => {
                if (prevProgress < 1) {
                    return prevProgress + 0.1;
                }
                clearInterval(interval);
                return 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadOrFetchUserData = async () => {
            try {
                await fetchAndStoreUserInfo();
            } catch (error) {
                console.error('Error handling user data:', error);
            }
        };

        if (isVisible) {
            loadOrFetchUserData();
        }
    }, [isVisible]);

    const fetchAndStoreUserInfo = async () => {
        try {
            const apiKey = process.env.REACT_NATIVE_API_KEY;
            const storedToken = await AsyncStorage.getItem('token');

            console.log("Testing")

            if (storedToken) {
                const decodedToken = jwtDecode(storedToken);

                console.log(decodedToken)

                const phone = decodedToken.sub;

                console.log(phone)

                const config = {
                    headers: {
                        'X-API-Key': apiKey,
                    },
                };

                const response = await axios.post(`${url}/account`, {phone_number: phone}, config);

                if (response.data && response.data.user) {
                    console.log(response.data.user)
                    await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

                }
            }
        } catch (error) {
            console.error('Error fetching user account information:', error);
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <View style={styles.loadingContainer}>
            <Progress.Bar color={'white'} borderColor={'transparent'} progress={progress} width={200}/>
            <Text>fuelbuddy Alpha Loading</Text>
        </View>
    );
}

const AppNavigator = () => {

    const {state, dispatch} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        const checkAuthState = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                if (token) {
                    dispatch({type: 'LOGIN'});

                } else {
                    dispatch({type: 'LOGOUT'});
                }
            } catch (error) {
                // TODO Handle AsyncStorage or token retrieval errors
            }
        };

        checkAuthState();

        return () => clearTimeout(timer);
    }, [dispatch]);

    return (
        <View style={{flex: 1, overflow: "hidden"}}>
            <StatusBar
                translucent
                backgroundColor="#FFFFFF"
                barStyle="dark-content"
            />
            <NavigationContainer>
                {state.isUserAuthenticated ? (
                    <Tab.Navigator
                        screenOptions={({route}) => ({
                            headerShown: false,
                            tabBarActiveTintColor: '#6BFF91',
                            tabBarInactiveTintColor: '#515151',
                            tabBarStyle: {
                                backgroundColor: '#FFFFFF',
                            },
                            tabBarLabelStyle: {
                                fontSize: 16,
                            },
                            tabBarLabel: '',
                            tabBarIcon: ({color, size, focused}) => {
                                let iconName;

                                const iconStyle = {
                                    marginBottom: focused ? 3 : 0,
                                };

                                let iconSize = 22;

                                if (route.name === 'Dashboard') {
                                    iconName = 'chart-bar';
                                } else if (route.name === 'Map') {
                                    iconName = 'map-marked-alt';
                                } else if (route.name === 'OCR') {
                                    iconName = 'camera';
                                } else if (route.name === 'Friends') {
                                    iconName = 'user-friends';
                                } else if (route.name === 'Account') {
                                    iconName = 'user-astronaut';
                                }

                                let iconColor = focused ? '#6BFF91' : '#515151';

                                return <FontAwesome5 name={iconName} size={iconSize} color={iconColor} style={iconStyle}/>;
                            },
                        })}
                    >
                        <Tab.Screen name="Dashboard" component={Dashboard}/>
                        <Tab.Screen name="Map" component={Map}/>
                        <Tab.Screen name="OCR" component={Scan}/>
                        <Tab.Screen name="Friends" component={Friends}/>
                        <Tab.Screen name="Account" component={AccountNavigator}/>
                    </Tab.Navigator>
                ) : (
                    <Stack.Navigator screenOptions={{
                        headerShown: false
                    }}>
                        <Stack.Screen name="Welcome" component={Welcome}/>
                        <Stack.Screen name="Login" component={LoginNavigator}/>
                        <Stack.Screen name="Register" component={RegisterNavigator}/>
                    </Stack.Navigator>
                )}
            </NavigationContainer>
            <LoadingScreen isVisible={isLoading}/>
        </View>
    );
};

export default AppNavigator;
