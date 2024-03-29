import React, { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import PushNotification from 'react-native-push-notification';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions';

import { userAuthAtom, userInfoAtom } from './recoil';
import { autoLoginAPI, fcmDeviceTokenAPI } from './apis/api';
import { RootStackNavigation, navigationRef } from './navigations/RootStackNavigation';

const RootApp = () => {
    const setUserAuthState = useSetRecoilState(userAuthAtom);
    const [userInfo, setUserInfo] = useRecoilState(userInfoAtom);

    // Get notification
    PushNotification.configure({
        onNotification: (notification: any) => {
            if (notification.userInteraction && notification.foreground) {
                navigationRef.current?.navigate(notification.data.screen, { postId: notification.data.postId });
            } else if (notification.userInteraction && !notification.foreground) {
                setTimeout(() => {
                    navigationRef.current?.navigate(notification.data.screen, { postId: notification.data.postId });
                }, 1000);
            }
        },
    });

    // Check storage and token valication for auto login
    const { mutate } = useMutation(autoLoginAPI, {
        onSuccess: ({ data }) => {
            successTokenHandler(data.data);
        },
        onError: ({ response }) => {
            errorLoginHandler(response.status);
            // For Debug
            console.log('(ERROR) auto login API.', response);
        },
    });

    // Send device token to FCM server
    const { mutate: fcmTokenMutate } = useMutation(fcmDeviceTokenAPI, {
        onSuccess: () => {
            navigationRef.current?.navigate('ServiceMainTab');
        },
        onError: error => {
            // For Debug
            console.log('(ERROR) Send device token to FCM server. ', error);
        },
    });

    // Remove token in storage
    const errorLoginHandler = async (status: number) => {
        if (status === 400 || status === 404) {
            try {
                await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            } catch (error) {
                // For Debug
                console.log('(ERROR) Remove token in storage', error);
            }
        }
        navigationRef.current?.navigate('NotLoginHome');
        SplashScreen.hide();
    };
    const successTokenHandler = async (data: {
        accessToken: string;
        refreshToken: string;
        memberId: number;
        nickName: string;
        email: string;
        firebaseToken: string;
    }) => {
        try {
            await AsyncStorage.setItem('access_token', data.accessToken);
            await AsyncStorage.setItem('refresh_token', data.refreshToken);
            setUserAuthState({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                isLogIn: true,
            });
            setUserInfo({
                ...userInfo,
                memberId: data.memberId,
                nickname: data.nickName,
                email: data.email,
            });
            console.log('저장 엑세스', data.accessToken);
            console.log('저장 리프레시', data.refreshToken);

            if (!data.firebaseToken) {
                getTokenFCM(data.accessToken);
            } else {
                navigationRef.current?.navigate('ServiceMainTab');
            }
        } catch (error) {
            // For Debug
            console.log('(ERROR) User authorization token set storage.', error);
        }
    };
    const getTokenFCM = async (accessToken: string) => {
        const deviceToken = await messaging().getToken();
        fcmTokenMutate({
            accessToken,
            fireBaseToken: deviceToken,
        });
    };

    const checkAsyncStorage = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (accessToken && refreshToken) {
                console.log('겟 엑세스', accessToken);
                console.log('겟 리프레시', refreshToken);
                mutate({
                    accessToken,
                    refreshToken,
                });
            } else {
                navigationRef.current?.navigate('NotLoginHome');
                SplashScreen.hide();
            }
        } catch (error) {
            // For Debug
            console.log('(ERROR) Check async storage for auto login ', error);
            navigationRef.current?.navigate('NotLoginHome');
            SplashScreen.hide();
        }
    };

    // Check location permission
    const isAllowLocationPermission = async () => {
        try {
            const locationPermission = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            const isAllow = locationPermission === RESULTS.GRANTED;
            if (isAllow) {
                setUserInfo({
                    ...userInfo,
                    isAllowLocation: true,
                });
            }
        } catch (err) {
            // For Debug
            console.log('(ERROR) Check Location Permission.', err);
        }
    };

    useEffect(() => {
        isAllowLocationPermission();
        checkAsyncStorage();
    }, []);

    return <RootStackNavigation />;
};

export default RootApp;
