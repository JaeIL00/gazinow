import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useMutation } from 'react-query';
import { useRecoilValue } from 'recoil';
import LinearGradient from 'react-native-linear-gradient';

import Icons from '../../atoms/Icons';
import Spacer from '../../atoms/Spacer';
import KeywordsList from '../common/KeywordsList';
import colors from '../../../constants/colors';
import BoldText from '../../atoms/BoldText';
import TextButton from '../../molecules/TextButton';
import TouchButton from '../../atoms/TouchButton';
import SemiBoldText from '../../atoms/SemiBoldText';
import useCheckKeyword from '../../../hooks/useCheckKeyword';
import { userAuthAtom } from '../../../recoil';
import { editMyLikeKeywordsAPI } from '../../../apis/api';
import { useRootNavigation } from '../../../navigations/RootStackNavigation';
import { issueKeywordsNotEtc, subwayKeywords, trafficKeywords } from '../../../constants/allKeywords';
import { editMyKeywordStyles } from '../../../styles/organisms/styles';
import { EditMyKeywordProps } from '../../../types/organisms/types';

const EditMyKeyword = ({
    myKeywordList,
    isShortcut,
    controlEditWindowHandler,
    getMyKeywordRefetch,
}: EditMyKeywordProps) => {
    const rootNavigation = useRootNavigation();

    const { accessToken } = useRecoilValue(userAuthAtom);

    // Initialized check keywords
    const [editCheckIssue, setEditCheckIssue] = useState<boolean[]>(Array(issueKeywordsNotEtc.length).fill(false));
    const [editCheckSubway, setEditCheckSubway] = useState<boolean[]>(Array(subwayKeywords.length).fill(false));
    const [editCheckTraffic, setEditCheckTraffic] = useState<boolean[]>(Array(trafficKeywords.length).fill(false));

    // Custom hook useCheckKeyword
    const { checkedKeywords, checkedKeywordsHandler } = useCheckKeyword();

    // Edit keyword API
    const { mutate, isLoading } = useMutation(editMyLikeKeywordsAPI, {
        onSuccess: () => {
            successEdit();
        },
        onError: ({ response }) => {
            // For Debug
            console.log('(ERROR) Edit keyword API.', response);
        },
    });
    // Init checked
    const checkMyKeyword = () => {
        let checkedIndexTraffic: number[] = [];
        let checkedIndexIssue: number[] = [];
        let checkedIndexSubway: number[] = [];
        const freshTraffic = [...editCheckTraffic];
        const freshIssue = [...editCheckIssue];
        const freshSubway = [...editCheckSubway];
        for (const index in myKeywordList) {
            if (myKeywordList[index].id === 10 || myKeywordList[index].id === 11) {
                const checkIndex = trafficKeywords.findIndex(item => item.id === myKeywordList[index].id);
                checkedIndexTraffic = [...checkedIndexTraffic, checkIndex];
            } else if (myKeywordList[index].id >= 1 && myKeywordList[index].id <= 8) {
                const checkIndex = issueKeywordsNotEtc.findIndex(item => item.id === myKeywordList[index].id);
                checkedIndexIssue = [...checkedIndexIssue, checkIndex];
            } else if (myKeywordList[index].id >= 12 && myKeywordList[index].id <= 34) {
                const checkIndex = subwayKeywords.findIndex(item => item.id === myKeywordList[index].id);
                checkedIndexSubway = [...checkedIndexSubway, checkIndex];
            }
        }
        for (const index in checkedIndexTraffic) {
            freshTraffic.splice(checkedIndexTraffic[index], 1, true);
        }
        for (const index in checkedIndexIssue) {
            freshIssue.splice(checkedIndexIssue[index], 1, true);
        }
        for (const index in checkedIndexSubway) {
            freshSubway.splice(checkedIndexSubway[index], 1, true);
        }
        setEditCheckTraffic(freshTraffic);
        setEditCheckIssue(freshIssue);
        if (checkedIndexSubway.length === 23) {
            setEditCheckSubway(Array.from(Array(24), () => true));
        } else {
            setEditCheckSubway(freshSubway);
        }
    };

    // check Keyword Handling
    const checkKeywordHandler = (list: string, index: number, id: number) => {
        switch (list) {
            case 'TRAFFIC':
                const freshTraffic = [...editCheckTraffic];
                freshTraffic.splice(index, 1, !freshTraffic[index]);
                setEditCheckTraffic(freshTraffic);
                break;
            case 'SUBWAY':
                if (id === 9998) {
                    const freshSubway = [...editCheckSubway];
                    const checkAll = freshSubway.map(() => !freshSubway[0]);
                    setEditCheckSubway(checkAll);
                } else {
                    const freshSubway = [...editCheckSubway];
                    freshSubway.splice(0, 1, false);
                    freshSubway.splice(index, 1, !freshSubway[index]);
                    setEditCheckSubway(freshSubway);
                }
                break;
            case 'ISSUE':
                const freshIssue = [...editCheckIssue];
                freshIssue.splice(index, 1, !freshIssue[index]);
                setEditCheckIssue(freshIssue);
                break;
            default:
                // For Debug
                console.log('(ERROR) check Keyword Handling. listname:', list);
                return;
        }
    };

    // Reset check of keyword
    const resetCheckedHandler = () => {
        setEditCheckTraffic(Array.from(Array(3), () => false));
        setEditCheckSubway(Array.from(Array(24), () => false));
        setEditCheckIssue(Array.from(Array(28), () => false));
    };

    // My keyword API success
    const successEdit = () => {
        if (isShortcut) {
            rootNavigation.pop();
        } else {
            getMyKeywordRefetch();
            controlEditWindowHandler('BACK');
        }
    };
    const putNewKeywordList = () => {
        let addKeywords: number[] = [];
        let deleteKeywords: number[] = [];
        const freshmyKeywordList = myKeywordList.map(item => item.id);
        for (const index in checkedKeywords) {
            const isSame = freshmyKeywordList.includes(checkedKeywords[index]);
            if (!isSame) {
                addKeywords = [...addKeywords, checkedKeywords[index]];
            }
        }
        for (const index in freshmyKeywordList) {
            const isSame = checkedKeywords.includes(freshmyKeywordList[index]);
            if (!isSame) {
                deleteKeywords = [...deleteKeywords, freshmyKeywordList[index]];
            }
        }
        if (addKeywords.length > 0 || deleteKeywords.length > 0) {
            mutate({
                accessToken,
                addKeywordIdList: addKeywords,
                deleteKeywordIdList: deleteKeywords,
            });
        } else {
            successEdit();
        }
    };

    // Init checking
    useLayoutEffect(() => {
        checkMyKeyword();
    }, [myKeywordList]);

    // Check keyword
    useEffect(() => {
        // Traffic subway keword check
        const subwaytrue = editCheckSubway.filter(item => item !== false);
        if (subwaytrue.length > 0) {
            setEditCheckTraffic(prev => {
                prev.splice(2, 1, true);
                return prev;
            });
        }
        const allList = [...trafficKeywords, ...subwayKeywords, ...issueKeywordsNotEtc];
        const checkedList = [...editCheckTraffic, ...editCheckSubway, ...editCheckIssue];
        checkedKeywordsHandler(allList, checkedList);
    }, [editCheckTraffic, editCheckIssue, editCheckSubway]);

    return (
        <>
            <Spacer height={10} />
            <View style={editMyKeywordStyles.mainContainer}>
                <LinearGradient colors={['#FFFFFF', '#FFFFFF00']} style={editMyKeywordStyles.upLinear} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Spacer height={16} />
                    <View>
                        <View style={editMyKeywordStyles.keywordListBox}>
                            <SemiBoldText text="이슈" color={colors.BLACK} size={16} />
                        </View>
                        <Spacer height={14} />
                        <KeywordsList
                            type="ISSUE"
                            list={issueKeywordsNotEtc}
                            isCheck={editCheckIssue}
                            checkKeywordHandler={checkKeywordHandler}
                            checkTextColor="#7949C6"
                            checkBorderColor={colors.VIOLET}
                            checkBackColor="#F1E9FF"
                        />
                    </View>

                    <Spacer height={29} />

                    <View>
                        <View style={editMyKeywordStyles.keywordListBox}>
                            <SemiBoldText text="교통수단" color={colors.BLACK} size={16} />
                        </View>
                        <Spacer height={14} />
                        <KeywordsList
                            type="TRAFFIC"
                            list={trafficKeywords}
                            isCheck={editCheckTraffic}
                            checkKeywordHandler={checkKeywordHandler}
                            checkTextColor="#7949C6"
                            checkBorderColor={colors.VIOLET}
                            checkBackColor="#F1E9FF"
                            trafficKeywordColor="#7949C6"
                        />
                        {editCheckTraffic[2] && (
                            <KeywordsList
                                type="SUBWAY"
                                list={subwayKeywords}
                                isCheck={editCheckSubway}
                                checkKeywordHandler={checkKeywordHandler}
                                checkTextColor="#7949C6"
                                checkBorderColor={colors.VIOLET}
                                checkBackColor="#F1E9FF"
                            />
                        )}
                    </View>
                    <Spacer height={100} />
                </ScrollView>
            </View>

            <View style={editMyKeywordStyles.bottomBox}>
                <LinearGradient colors={['#FFFFFF00', '#FFFFFF']} style={editMyKeywordStyles.downLinear} />
                <TouchButton onPress={resetCheckedHandler} paddingHorizontal={7}>
                    <View style={editMyKeywordStyles.resetText}>
                        <Icons type="feather" name="refresh-cw" size={17} color={colors.TXT_GRAY} />
                        <Spacer width={3} />
                        <View style={editMyKeywordStyles.borderLine}>
                            <BoldText text="선택초기화" size={13} color={colors.TXT_GRAY} />
                        </View>
                    </View>
                </TouchButton>
                <TextButton
                    onPress={putNewKeywordList}
                    text="선택완료"
                    fontSize={17}
                    fontColor={colors.WHITE}
                    fontWeight="semiBold"
                    backgroundColor={colors.BLACK}
                    paddingHorizontal={83.5}
                    paddingVertical={11}
                    alignSelf="stretch"
                    borderRadius={5}
                />
            </View>
            {isLoading && <ActivityIndicator size="large" />}
        </>
    );
};

export default EditMyKeyword;
