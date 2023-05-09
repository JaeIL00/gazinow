import React, { useState } from 'react';
import { Image, Modal, View } from 'react-native';
import { useMutation } from 'react-query';
import { useRecoilValue } from 'recoil';

import Icons from '../../smallest/Icons';
import Spacer from '../../smallest/Spacer';
import Colors from '../../../styles/Colors';
import MediumText from '../../smallest/MediumText';
import TouchButton from '../../smallest/TouchButton';
import SemiBoldText from '../../smallest/SemiBoldText';
import MultiLineInput from '../../smallest/MultiLineInput';
import SearchLocation from '../../organisms/SearchLocation';
import WritePhoto from '../../organisms/cummunity/WritePhoto';
import WritePostAddKeyword from '../../organisms/cummunity/WritePostAddKeyword';
import { writePostAPI } from '../../../queries/api';
import { userTokenAtom } from '../../../store/atoms';
import { issueKeywords } from '../../../utils/allKeywords';
import { writePostTemplateStyles } from '../../../styles/styles';
import { SingleLineInput } from '../../smallest/SingleLineInput';
import { screenFont, screenHeight, screenWidth } from '../../../utils/changeStyleSize';
import { WritePostTemplateProps, writePostTypes } from '../../../types/types';
import TextButton from '../../molecules/TextButton';

const WritePostTemplate = ({ moveToScreen }: WritePostTemplateProps) => {
    // Write post data for API request
    const [writePostData, setWritePostData] = useState<writePostTypes>({
        dto: {
            title: '',
            placeName: '',
            content: '',
            latitude: null,
            longitude: null,
            keywordIdList: null,
            headKeywordId: null,
        },
        files: [],
        thumbnail: null,
    });
    const getLocationHandler = (location: { lat: number; lng: number }, placeName: string) => {
        setWritePostData({
            ...writePostData,
            dto: { ...writePostData.dto, latitude: location.lat, longitude: location.lng, placeName },
        });
    };
    const getKeywordHandler = (state: string, keyword: number[]) => {
        switch (state) {
            case 'LIST':
                setWritePostData({ ...writePostData, dto: { ...writePostData.dto, keywordIdList: keyword } });
                break;
            case 'HEAD':
                setWritePostData({ ...writePostData, dto: { ...writePostData.dto, headKeywordId: keyword[0] } });
                break;
            default:
                // For Debug
                console.log('(ERROR) Get keyword function of keyword modal.', state);
        }
    };
    const getImageHandler = (files: FormDataPart[]) => {
        setWritePostData({ ...writePostData, files, thumbnail: files[0] });
    };

    // Write post API and check essential value
    const { accessToken } = useRecoilValue(userTokenAtom);
    const [onErrorModal, setOnErrorModal] = useState(false);
    const [onErrorText, setOnErrorText] = useState('');
    const { mutate, isLoading } = useMutation(writePostAPI, {
        onSuccess: data => {
            console.log(data);
        },
        onError: error => {
            // For Debug
            console.log('(ERROR) Write post API.', error);
        },
    });
    const finishWritingHandler = () => {
        const isNotEnoughLocation = !writePostData.dto.latitude || !writePostData.dto.longitude;
        const isNotEnoughKeyword = !writePostData.dto.keywordIdList || !writePostData.dto.headKeywordId;
        if (isNotEnoughLocation && isNotEnoughKeyword) {
            setOnErrorText('위치와 키워드를 설정해주세요');
            setOnErrorModal(true);
        } else if (isNotEnoughLocation) {
            setOnErrorText('위치를 설정해주세요');
            setOnErrorModal(true);
        } else if (isNotEnoughKeyword) {
            setOnErrorText('키워드를 설정해주세요');
            setOnErrorModal(true);
        }
        // mutate({
        //     token: accessToken,
        //     data: writePostData,
        // });
    };
    const offErrorModalHandler = () => {
        setOnErrorModal(false);
    };

    // Search location modal
    const [loactionModal, setLoactionModal] = useState<boolean>(false);
    const locationModalHandler = (state: string) => {
        switch (state) {
            case 'OPEN':
                setLoactionModal(true);
                break;
            case 'CLOSE':
                setLoactionModal(false);
                break;
            default:
                // For Debug
                console.log('(ERROR) Search location modal.', state);
        }
    };

    // Set post keyword modal
    const [keywordModal, setKeywordModal] = useState<boolean>(false);
    const keywordModalHandler = (state: string) => {
        switch (state) {
            case 'OPEN':
                setKeywordModal(true);
                break;
            case 'CLOSE':
                setKeywordModal(false);
                break;
            default:
                // For Debug
                console.log('(ERROR) Set post keyword modal.', state);
        }
    };

    // Input text title and content
    const [title, setTitle] = useState('');
    const [content, setcontent] = useState('');
    const onChangeTitleText = (text: string) => {
        setTitle(text);
    };
    const onChangeContentText = (text: string) => {
        setcontent(text);
    };

    return (
        <View style={writePostTemplateStyles.container}>
            <View style={writePostTemplateStyles.headerBox}>
                <View style={writePostTemplateStyles.headerNavigateBox}>
                    <TouchButton onPress={() => moveToScreen('BACK')}>
                        <Icons type="ionicons" name="close-sharp" size={20} color={Colors.BLACK} />
                    </TouchButton>
                    <TouchButton
                        onPress={() => {
                            finishWritingHandler();
                            // moveToScreen('GO')
                        }}>
                        <SemiBoldText text="다음" size={16} color={Colors.TXT_GRAY} />
                    </TouchButton>
                </View>

                <View style={writePostTemplateStyles.settingBox}>
                    <TouchButton onPress={() => locationModalHandler('OPEN')}>
                        <View style={writePostTemplateStyles.settingButton}>
                            {writePostData.dto.latitude && writePostData.dto.placeName ? (
                                <>
                                    <Image
                                        source={require('../../../assets/icons/location-pin-outline.png')}
                                        style={{ width: 16 * screenWidth, height: 16 * screenWidth }}
                                    />
                                    <Spacer width={5} />
                                    <MediumText text={writePostData.dto.placeName} size={13} color={Colors.BLACK} />
                                </>
                            ) : (
                                <MediumText text="위치설정" size={13} color={Colors.BLACK} />
                            )}
                            <Spacer width={4} />
                            <Image
                                source={require('../../../assets/icons/triangle-down.png')}
                                style={{ width: 10 * screenWidth, height: 10 * screenWidth }}
                            />
                        </View>
                    </TouchButton>
                    <Spacer width={13} />
                    <TouchButton onPress={() => keywordModalHandler('OPEN')}>
                        <View style={writePostTemplateStyles.settingBox}>
                            {writePostData.dto.headKeywordId ? (
                                <MediumText
                                    text={issueKeywords[writePostData.dto.headKeywordId - 1].keywordName}
                                    size={13}
                                    color={Colors.BLACK}
                                />
                            ) : (
                                <MediumText text="키워드설정" size={13} color={Colors.BLACK} />
                            )}
                            <Spacer width={4} />
                            <Image
                                source={require('../../../assets/icons/triangle-down.png')}
                                style={{ width: 10 * screenWidth, height: 10 * screenWidth }}
                            />
                        </View>
                    </TouchButton>
                </View>
            </View>

            <View style={{ paddingHorizontal: 16 * screenWidth }}>
                <SingleLineInput
                    value={title}
                    onChangeText={text => onChangeTitleText(text)}
                    placeFontFamily="Pretendard-SemiBold"
                    fontFamily="Pretendard-SemiBold"
                    placeholder="제목을 입력해주세요"
                    fontSize={24}
                />
                <MultiLineInput
                    value={content}
                    onChangeText={text => onChangeContentText(text)}
                    placeholder="무슨일이 일어나고 있나요?"
                    height={196 * screenHeight}
                    maxLength={300}
                />
            </View>

            <WritePhoto getImageHandler={getImageHandler} />

            {loactionModal && (
                <View style={writePostTemplateStyles.searchContainer}>
                    <View style={writePostTemplateStyles.searchHeaderBox}>
                        <TouchButton onPress={() => locationModalHandler('CLOSE')}>
                            <View style={writePostTemplateStyles.searchTitleBox}>
                                <Icons type="ionicons" name="close-sharp" size={24} color={Colors.BLACK} />
                                <Spacer width={16.8} />
                                <MediumText text="위치 설정" size={18} color={Colors.BLACK} />
                            </View>
                        </TouchButton>
                        <TouchButton
                            onPress={() => (writePostData.dto.latitude ? locationModalHandler('CLOSE') : undefined)}>
                            <SemiBoldText
                                text="완료"
                                size={16}
                                color={writePostData.dto.latitude ? Colors.BLACK : Colors.TXT_GRAY}
                            />
                        </TouchButton>
                    </View>

                    <Spacer height={28} />

                    <SearchLocation getLocationHandler={getLocationHandler} />
                </View>
            )}

            {keywordModal && (
                <WritePostAddKeyword keywordModalHandler={keywordModalHandler} getKeywordHandler={getKeywordHandler} />
            )}

            {onErrorModal && (
                <View style={writePostTemplateStyles.errorModalBack}>
                    <View style={writePostTemplateStyles.errorModalBox}>
                        <SemiBoldText text={onErrorText} size={18} color={Colors.BLACK} />
                        <Spacer height={18} />
                        <TextButton
                            onPress={offErrorModalHandler}
                            text="확인"
                            textColor="#49454F"
                            fontSize={14}
                            backgroundColor={Colors.LIGHTGRAY}
                            paddingHorizontal={111}
                            paddingVertical={12}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

export default WritePostTemplate;
