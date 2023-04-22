import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, View, useWindowDimensions } from 'react-native';
import { useMutation } from 'react-query';
import { useRecoilValue } from 'recoil';

import TextButton from '../molecules/TextButton';
import { authEmailStyles } from '../../styles/styles';
import { AuthEmailProps } from '../../types/types';
import TouchButton from '../smallest/TouchButton';
import Icons from '../smallest/Icons';
import Colors from '../../styles/Colors';
import BoldText from '../smallest/BoldText';
import Spacer from '../smallest/Spacer';
import { SingleLineInput } from '../smallest/SingleLineInput';
import NormalText from '../smallest/NormalText';
import { authEmailNumber, joinMemberData } from '../../store/atoms';
import { authEmail } from '../../queries/api';
import useKeyboardMotion from '../../utils/hooks/useKeyboardMotion';
import useInterval from '../../utils/hooks/useInterval';

const AuthEmail = ({ finishSlideComponentHandler }: AuthEmailProps) => {
    const joinData = useRecoilValue(joinMemberData);
    const initAuthNumber = useRecoilValue(authEmailNumber);

    // Animation handling
    const { height } = useWindowDimensions();
    const topValue = useRef(new Animated.Value(height)).current;
    const startAnimationHandler = () => {
        Animated.timing(topValue, {
            toValue: 40,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };
    useEffect(() => {
        startAnimationHandler();
    }, []);

    // Back Icon handling
    const onPressBackIcon = () => {
        finishSlideComponentHandler('BACK');
    };

    // Input authorization number
    const [inputNumber, setInputNumber] = useState('');
    const onChangNumberText = (text: string) => {
        setInputNumber(text);
        checkAuthNumber(text);
    };

    // Timer
    const [min, setMin] = useState(0);
    const [sec, setSec] = useState(0);
    const timerHandler = () => {
        if (sec < 59) {
            setSec(sec + 1);
        } else {
            setMin(min + 1);
            setSec(0);
        }
    };
    useInterval(timerHandler, min === 5 ? null : 1000);

    // Retry sending auth number

    const [authNumber, setauthNumber] = useState(initAuthNumber);
    const { mutate, isLoading } = useMutation(authEmail, {
        onSuccess(data) {
            setauthNumber(data.data);
            setMin(0);
        },
    });
    const onPressEmailAuth = () => {
        if (min === 5) {
            mutate(joinData.email);
        }
    };

    // Finish button style handling
    const [activityButton, setActivityButton] = useState(false);
    const checkAuthNumber = (text: string) => {
        if (text === String(authNumber)) {
            setActivityButton(true);
        }
    };
    const onPressFinishAnimation = () => {
        if (activityButton) {
            Animated.timing(topValue, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    finishSlideComponentHandler('OK');
                }
            });
        }
    };

    // Finish button transitionY handling
    const { bottomValue, buttonUpAnimationHandler, buttonDownAnimationHandler } = useKeyboardMotion(80, 330);
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', buttonUpAnimationHandler);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', buttonDownAnimationHandler);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <View style={authEmailStyles.container}>
            <Animated.View style={[authEmailStyles.animateInner, { transform: [{ translateY: topValue }] }]}>
                <View style={authEmailStyles.backButtonBox}>
                    <TouchButton alignSelf="flex-start" onPress={onPressBackIcon}>
                        <Icons type="octicons" name="arrow-left" color={Colors.TXT_BLACK} size={24} />
                    </TouchButton>
                </View>
                <BoldText text="메일로 받은 인증번호를 " size={24} color={Colors.BLACK} />
                <BoldText text="입력해주세요" size={24} color={Colors.BLACK} />

                <Spacer height={57} />

                <View style={authEmailStyles.inputBox}>
                    <View style={authEmailStyles.inputRange}>
                        <SingleLineInput
                            value={inputNumber}
                            onChangeText={onChangNumberText}
                            placeholder="인증번호 4자리"
                            keyboardType="number-pad"
                            maxLength={4}
                        />
                    </View>
                    <View style={authEmailStyles.timerBox}>
                        <NormalText
                            text={`${min}:${String(sec).length === 1 ? '0' : ''}${sec}`}
                            size={13}
                            color={Colors.BLACK}
                        />
                    </View>
                </View>

                <Spacer height={36} />

                <View style={authEmailStyles.retryTextBox}>
                    <NormalText text="메일을 받지 못하셨나요?" size={13} color={Colors.TXT_GRAY} />
                    <Spacer width={8} />
                    <TouchButton onPress={onPressEmailAuth} width={40}>
                        <View style={authEmailStyles.underBar}>
                            <BoldText text="재전송" size={13} color={Colors.TXT_GRAY} />
                        </View>
                    </TouchButton>
                </View>

                <Animated.View style={[authEmailStyles.finishButton, { transform: [{ translateY: bottomValue }] }]}>
                    <TextButton
                        height={48}
                        backgroundColor={activityButton ? Colors.BLACK : Colors.BTN_GRAY}
                        onPress={onPressFinishAnimation}
                        fontSize={17}
                        textColor={Colors.WHITE}
                        text="완료"
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
};

export default AuthEmail;