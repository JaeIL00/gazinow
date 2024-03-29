import React, { useState } from 'react';
import { View } from 'react-native';

import Spacer from '../../atoms/Spacer';
import colors from '../../../constants/colors';
import HeaderMolecule from '../../molecules/HeaderMolecule';
import LoginTextInput from '../../molecules/LoginTextInput';
import IconWithMediumText from '../../molecules/IconWithMediumText';
import useTextInputValidation from '../../../hooks/useTextInputValidation';
import { SingleLineInput } from '../../atoms/SingleLineInput';
import { changePasswordTemplateStyles } from '../../../styles/templates/styles';
import { screenHeight, screenWidth } from '../../../utils/changeStyleSize';
import { ChangePasswordTemplateProps } from '../../../types/templates/types';

const ChangePasswordTemplate = ({ moveToBackScreenHandler }: ChangePasswordTemplateProps) => {
    const {
        text: twoNewPassword,
        onChangeText: onChangeTwoNewPassword,
        validationResult,
        changeValidationResult,
    } = useTextInputValidation();

    const [curPassword, setCurPassword] = useState<string>('');
    const [oneNewPassword, setOneNewPassword] = useState<string>('');
    const [isPasswordReg, setIsPasswordReg] = useState<boolean>(false);
    const [isPasswordLeng, setIsPasswordLeng] = useState<boolean>(false);
    const [isSamePassword, setIsSamePassword] = useState<boolean>(false);

    // Change text password
    const onChangeOneNewPassword = (text: string) => {
        setOneNewPassword(text);
        passwordErrorTextStyle(text);
        onChangeTwoNewPassword('');
    };
    const passwordErrorTextStyle = (text: string) => {
        const reg = /^(?=.*[a-zA-Z])(?=.*[!~.,?@#$%^&()_/|;:'"<>*+=-])(?=.*[0-9])/;
        reg.test(text) ? setIsPasswordReg(true) : setIsPasswordReg(false);
        text.length >= 8 && text.length <= 20 ? setIsPasswordLeng(true) : setIsPasswordLeng(false);
    };
    const onChangeCurPassword = (text: string) => {
        setCurPassword(text);
    };
    const checkSamePassword = (text: string) => {
        onChangeTwoNewPassword(text);
        if (oneNewPassword === text) {
            setIsSamePassword(true);
            changeValidationResult('비밀번호가 일치합니다');
        } else {
            setIsSamePassword(false);
            changeValidationResult('비밀번호가 일치하지 않습니다');
        }
    };

    return (
        <View>
            <HeaderMolecule
                isPaddingHorizontal={true}
                backHandler={moveToBackScreenHandler}
                headerFinish={true}
                title="비밀번호 변경"
                finishText="완료"
                isNextStep={false}
                isWorkDone={isSamePassword}
                background={colors.WHITE}
                finishFunction={() => {}}
            />
            <View style={{ paddingHorizontal: 16 * screenWidth, paddingTop: 39 * screenHeight }}>
                <LoginTextInput
                    title="현재 비밀번호"
                    value={curPassword}
                    onChangeText={Text => onChangeCurPassword(Text)}
                    placeholder="비밀번호를 입력해주세요"
                    secureTextEntry={true}
                    maxLength={20}
                />

                <Spacer height={28} />

                <LoginTextInput
                    title="새로운 비밀번호"
                    value={oneNewPassword}
                    onChangeText={Text => onChangeOneNewPassword(Text)}
                    placeholder="변경하실 비밀번호를 입력해주세요"
                    secureTextEntry={true}
                    maxLength={20}
                />
                {oneNewPassword && !twoNewPassword && (
                    <View style={changePasswordTemplateStyles.emailErrorTextBox}>
                        <IconWithMediumText
                            type="octicons"
                            name="check"
                            iconColor={isPasswordLeng ? colors.STATUS_GREEN : colors.STATUS_GRAY}
                            text="8자-20자 이내"
                            textColor={isPasswordLeng ? colors.STATUS_GREEN : colors.STATUS_GRAY}
                        />
                        <Spacer width={14} />
                        <IconWithMediumText
                            type="octicons"
                            name="check"
                            iconColor={isPasswordReg ? colors.STATUS_GREEN : colors.STATUS_GRAY}
                            text="영어, 숫자, 특수문자 포함"
                            textColor={isPasswordReg ? colors.STATUS_GREEN : colors.STATUS_GRAY}
                        />
                    </View>
                )}
                <View style={changePasswordTemplateStyles.inputBox}>
                    <SingleLineInput
                        value={twoNewPassword}
                        onChangeText={text => checkSamePassword(text)}
                        placeholder="비밀번호를 확인해주세요"
                        secureTextEntry={true}
                        maxLength={20}
                        fontFamily={null}
                        placeFontFamily={null}
                    />
                </View>
                {twoNewPassword && (
                    <View style={changePasswordTemplateStyles.twoPasswordError}>
                        <IconWithMediumText
                            iconColor={isSamePassword ? colors.STATUS_GREEN : colors.STATUS_RED}
                            text={validationResult}
                            textColor={isSamePassword ? colors.STATUS_GREEN : colors.STATUS_RED}
                            type={isSamePassword ? 'octicons' : 'fontisto'}
                            name={isSamePassword ? 'check' : 'close'}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

export default ChangePasswordTemplate;
