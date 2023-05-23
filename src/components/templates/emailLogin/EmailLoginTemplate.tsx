import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, ToastAndroid, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'react-query';
import { debounce } from 'lodash';
import { useRecoilState } from 'recoil';

import Icons from '../../smallest/Icons';
import Spacer from '../../smallest/Spacer';
import Colors from '../../../styles/Colors';
import BoldText from '../../smallest/BoldText';
import MediumText from '../../smallest/MediumText';
import TextButton from '../../molecules/TextButton';
import TouchButton from '../../smallest/TouchButton';
import LoginTextInput from '../../molecules/LoginTextInput';
import MoveBackWithPageTitle from '../../organisms/MoveBackWithPageTitle';
import { loginAPI } from '../../../queries/api';
import { EmailLoginTemplateProps } from '../../../types/types';
import { emailLoginTemplateStyles } from '../../../styles/styles';
import { userInfoAtom, userTokenAtom } from '../../../store/atoms';

const EmailLoginTemplate = ({ moveServiceHomeHandler }: EmailLoginTemplateProps) => {
    // Text change Handling
    const [email, setEmail] = useState<string>('');
    const onChangeEmail = (text: string) => {
        setEmail(text);
        setLoginErrorText('');
    };
    const [password, setPassword] = useState('');
    const onChangePassword = (text: string) => {
        setPassword(text);
        setLoginErrorText('');
    };

    // Login API Handling
    const [tokenAtom, setTokenAtom] = useRecoilState(userTokenAtom);
    const [userInfo, setUserInfo] = useRecoilState(userInfoAtom);
    const [loginErrorText, setLoginErrorText] = useState<string>('');
    const { mutate, isLoading } = useMutation(loginAPI, {
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
    const onPressLoginButton = debounce(() => {
        if (email && password) {
            mutate({ email, password });
        }
    }, 300);
    const successJoinMemberHandler = async (data: {
        accessToken: string;
        refreshToken: string;
        memberId: number;
        nickName: string;
        email: string;
    }) => {
        try {
            await AsyncStorage.setItem('GAZI_ac_tk', data.accessToken);
            await AsyncStorage.setItem('GAZI_re_tk', data.refreshToken);
            setTokenAtom({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            setUserInfo({
                memberId: data.memberId,
                nickname: data.nickName,
                email: data.email,
            });
        } catch (err) {
            // For Debug
            console.log('(ERROR) User authorization token set storage. err: ', err);
            ToastAndroid.show('토큰 저장 실패', 4000);
        } finally {
            moveServiceHomeHandler('GO');
        }
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
                            <Icons type={'fontisto'} name={'close'} size={14} color={Colors.STATUS_RED} />
                            <Spacer width={4} />
                            <MediumText text={loginErrorText} size={12} color={Colors.STATUS_RED} />
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
                    backgroundColor={email && password ? Colors.BLACK : Colors.BTN_GRAY}
                    textColor={Colors.WHITE}
                    fontSize={17}
                />

                <Spacer height={24} />

                <TouchButton onPress={() => {}}>
                    <View style={emailLoginTemplateStyles.underBar}>
                        <BoldText text="비밀번호 찾기" size={13} color={Colors.TXT_GRAY} />
                    </View>
                </TouchButton>
            </KeyboardAvoidingView>

            {isLoading && <ActivityIndicator size="large" />}
        </View>
    );
};

export default EmailLoginTemplate;
