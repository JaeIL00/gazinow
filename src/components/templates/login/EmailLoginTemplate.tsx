import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'react-query';
import { debounce } from 'lodash';
import { useSetRecoilState } from 'recoil';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions';

import Icons from '../../atoms/Icons';
import Spacer from '../../atoms/Spacer';
import colors from '../../../constants/colors';
import BoldText from '../../atoms/BoldText';
import MediumText from '../../atoms/MediumText';
import TextButton from '../../molecules/TextButton';
import TouchButton from '../../atoms/TouchButton';
import LoginTextInput from '../../molecules/LoginTextInput';
import MoveBackWithPageTitle from '../../organisms/common/MoveBackWithPageTitle';
import { userInfoAtom, userAuthAtom } from '../../../recoil';
import { fcmDeviceTokenAPI, loginAPI } from '../../../apis/api';
import { emailLoginTemplateStyles } from '../../../styles/templates/styles';
import { EmailLoginTemplateProps } from '../../../types/templates/types';

const EmailLoginTemplate = ({ moveServiceHomeHandler }: EmailLoginTemplateProps) => {
    const setUserAuthState = useSetRecoilState(userAuthAtom);
    const setUserInfoState = useSetRecoilState(userInfoAtom);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loginErrorText, setLoginErrorText] = useState<string>('');

    // Login API Handling
    const { mutate: loginMutate, isLoading } = useMutation(loginAPI, {
        onSuccess: ({ data }) => {
            successJoinMemberHandler(data.data);
        },
        onError: ({ response }) => {
            if (response.data.state === 401) {
                setLoginErrorText(response.data.message);
            }
            // For Debug
            console.log('(ERROR) Login API Handling. response: ', response);
        },
    });

    // Send device token to FCM server
    const { mutate: fcmTokenMutate } = useMutation(fcmDeviceTokenAPI, {
        onSuccess: () => {
            moveServiceHomeHandler('GO');
        },
        onError: error => {
            // For Debug
            console.log('(ERROR) Send device token to FCM server. ', error);
        },
    });

    const onPressLoginButton = debounce(() => {
        if (email && password) {
            loginMutate({ email, password });
        }
    }, 300);
    const successJoinMemberHandler = async (data: {
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
            isAllowLocationPermission(data);

            if (!data.firebaseToken) {
                getTokenFCM(data.accessToken);
            } else {
                moveServiceHomeHandler('GO');
            }
        } catch (err) {
            // For Debug
            console.log('(ERROR) User authorization token set storage. err: ', err);
        }
    };
    const getTokenFCM = async (accessToken: string) => {
        const deviceToken = await messaging().getToken();
        fcmTokenMutate({
            accessToken,
            fireBaseToken: deviceToken,
        });
    };

    // Check location permission
    const isAllowLocationPermission = async (data: {
        accessToken: string;
        refreshToken: string;
        memberId: number;
        nickName: string;
        email: string;
    }) => {
        try {
            const locationPermission = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            const isAllow = locationPermission === RESULTS.GRANTED;
            setUserInfoState({
                memberId: data.memberId,
                nickname: data.nickName,
                email: data.email,
                isAllowLocation: isAllow,
            });
        } catch (err) {
            // For Debug
            console.log('(ERROR) Check Location Permission.', err);
        }
    };

    // Text change Handling
    const onChangeEmail = (text: string) => {
        setEmail(text);
        setLoginErrorText('');
    };
    const onChangePassword = (text: string) => {
        setPassword(text);
        setLoginErrorText('');
    };

    return (
        <View style={emailLoginTemplateStyles.container}>
            <View style={emailLoginTemplateStyles.mainContent}>
                <MoveBackWithPageTitle
                    oneTitle="이메일로 로그인"
                    twoTitle=""
                    onPress={() => moveServiceHomeHandler('BACK')}
                />

                <Spacer height={75} />

                <View>
                    <LoginTextInput
                        title="Email"
                        value={email}
                        placeholder="이메일(아이디)입력"
                        onChangeText={onChangeEmail}
                        keyboardType="email-address"
                    />
                    <Spacer height={20} />
                    <LoginTextInput
                        title="Password"
                        value={password}
                        placeholder="비밀번호 입력"
                        onChangeText={onChangePassword}
                        secureTextEntry={true}
                    />
                    {loginErrorText && (
                        <View style={emailLoginTemplateStyles.emailErrorTextBox}>
                            <Icons type={'fontisto'} name={'close'} size={14} color={colors.STATUS_RED} />
                            <Spacer width={4} />
                            <MediumText text={loginErrorText} size={12} color={colors.STATUS_RED} />
                        </View>
                    )}
                </View>
            </View>

            <KeyboardAvoidingView
                behavior="height"
                style={emailLoginTemplateStyles.bottomBox}
                contentContainerStyle={emailLoginTemplateStyles.bottomContain}>
                <TextButton
                    onPress={onPressLoginButton}
                    text="로그인"
                    height={48}
                    backgroundColor={email && password ? colors.BLACK : colors.BTN_GRAY}
                    fontColor={colors.WHITE}
                    fontWeight="semiBold"
                    fontSize={17}
                    borderRadius={5}
                />

                <Spacer height={24} />

                <TouchButton onPress={() => {}}>
                    <View style={emailLoginTemplateStyles.underBar}>
                        <BoldText text="비밀번호 찾기" size={13} color={colors.TXT_GRAY} />
                    </View>
                </TouchButton>
            </KeyboardAvoidingView>

            {isLoading && <ActivityIndicator size="large" />}
        </View>
    );
};

export default EmailLoginTemplate;
