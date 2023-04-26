import React, { useEffect, useState } from 'react';
import { ToastAndroid, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'react-query';
import { useRecoilState } from 'recoil';

import Spacer from '../../smallest/Spacer';
import Colors from '../../../styles/Colors';
import BoldText from '../../smallest/BoldText';
import TextButton from '../../molecules/TextButton';
import { forDebugAtom } from '../../../store/atoms';
import { deleteMemberAPI } from '../../../queries/api';
import { notLoginTemplateStyles } from '../../../styles/styles';
import { useRootNavigation } from '../../../navigations/RootStackNavigation';

const NotLoginTemplate = () => {
    // Move screens handling
    const rootNavigation = useRootNavigation();
    const onPressNavigate = (route: string) => {
        if (route === 'JoinMember') {
            rootNavigation.navigate('JoinMember');
        } else {
            rootNavigation.navigate('Login');
        }
    };

    // For Debug
    // Delete member API (temporary)
    const [tok, setTok] = useRecoilState(forDebugAtom);
    const [st, setst] = useState<string>('');
    const getStorage = async () => {
        try {
            const is = await AsyncStorage.getItem('GAZI_ac_tk');
            if (is) {
                setst(is);
                setTok(is);
            }
        } catch (err) {
            // For Debug
            console.log('get access token in storage', err);
            ToastAndroid.show('토큰 불러오기 실패', 4000);
        }
    };
    useEffect(() => {
        if (tok) {
            setst(tok);
        } else {
            getStorage();
        }
    }, [tok]);
    const { mutate } = useMutation(deleteMemberAPI, {
        onSuccess: () => {
            ToastAndroid.show('회원 탈퇴 성공', 4000);
        },
        onError: ({ response }) => {
            // For Debug
            console.log('(ERROR) Delete member API. response: ', response);
            ToastAndroid.show('회원 탈퇴 실패', 4000);
        },
    });

    return (
        <View style={notLoginTemplateStyles.container}>
            <BoldText text="가는길에 지금 어떤 일이" size={24} color={Colors.BLACK} />
            <BoldText text="일어나고 있는지 알아볼까요?" size={24} color={Colors.BLACK} />

            <Spacer height={46} />
            {/* 임시 */}
            <View style={{ backgroundColor: '#333', height: 300 }} />

            <View style={notLoginTemplateStyles.buttonBox}>
                <TextButton
                    text="이메일로 가입"
                    onPress={() => onPressNavigate('JoinMember')}
                    textColor={Colors.WHITE}
                    backgroundColor={Colors.BLACK}
                    fontSize={17}
                    height={48}
                />
                <Spacer height={12} />
                <TextButton
                    text="이메일로 로그인"
                    onPress={() => onPressNavigate('Login')}
                    textColor={Colors.BLACK}
                    backgroundColor={Colors.WHITE}
                    fontSize={17}
                    height={48}
                    borderColor={Colors.BLACK}
                    borderWidth={1}
                />
                <Spacer height={12} />
                {/* For Debug */}
                <TextButton
                    text="(임시)회원 탈퇴"
                    onPress={() => mutate(st)}
                    textColor={Colors.BLACK}
                    backgroundColor={Colors.WHITE}
                    fontSize={17}
                    height={48}
                    borderColor={Colors.BLACK}
                    borderWidth={1}
                />
            </View>
        </View>
    );
};
export default NotLoginTemplate;
