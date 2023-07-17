import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery, useQuery } from 'react-query';
import { useFocusEffect } from '@react-navigation/native';

import Icons from '../../smallest/Icons';
import Spacer from '../../smallest/Spacer';
import Colors from '../../../styles/Colors';
import NormalText from '../../smallest/NormalText';
import MediumText from '../../smallest/MediumText';
import TouchButton from '../../smallest/TouchButton';
import SemiBoldText from '../../smallest/SemiBoldText';
import { userAuthAtom } from '../../../store/atoms';
import { keywordAlarmTemplateStyles } from '../../../styles/styles';
import { getAlarmHistoryAPI, getMyLikeKeywordsAPI } from '../../../queries/api';
import { AlarmHistoryTypes, KeywordAlarmTemplateProps } from '../../../types/types';

const KeywordAlarmTemplate = ({ navigationHandler }: KeywordAlarmTemplateProps) => {
    const { accessToken } = useRecoilValue(userAuthAtom);

    const alarmResponseIndexRef = useRef<number>(0);

    const [isHistoryRefresh, setIsHistoryRefresh] = useState<boolean>(false);
    const [keywordsLength, setKeywordsLength] = useState<number>(0);
    const [keywordAlarmData, setKeywordAlarmData] = useState<AlarmHistoryTypes[]>([]);

    // Get my alarm history of keywords
    const {
        refetch: myKeywordAlarmRefetch,
        remove: myKeywordAlarmRemove,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery(
        'getMyKeywordAlarm',
        ({ pageParam = 0 }) => getAlarmHistoryAPI({ isKeywordAlarm: true, accessToken, page: pageParam }),
        {
            getNextPageParam: lastPage => {
                const total = lastPage.data.data.totalPages;
                const nextPage = lastPage.data.data.pageable.pageNumber + 1;
                return nextPage === total ? undefined : nextPage;
            },
            onSuccess: data => {
                // const pageNumber = data.pages[alarmResponseIndexRef.current].data.data.pageable.pageNumber;
                const content = data.pages[0].data.data.content;
                //     const isLast = data.pages[alarmResponseIndexRef.current].data.data.last;
                setKeywordAlarmData(content);
                alarmResponseIndexRef.current = alarmResponseIndexRef.current + 1;
                // console.log(data.pages[alarmResponseIndexRef.current].data.data);
                setIsHistoryRefresh(false);
            },
            onError: error => {
                // For Debug
                console.log('(ERROR) Get my alarm history of keywords', error);
            },
        },
    );

    // Get my liked keywords
    const { refetch: myKeywordsRefetch } = useQuery('getMyLikeKeyword', () => getMyLikeKeywordsAPI(accessToken), {
        enabled: false,
        onSuccess: ({ data }) => {
            setKeywordsLength(data.data.length);
        },
        onError: error => {
            // For Debug
            console.log('(ERROR) Get my liked keywords in alarm screen', error);
        },
    });

    const onPressHistoryItem = (postId: number) => {
        navigationHandler('ThreadItem', postId);
    };

    const alarmHistoryRefresh = () => {
        alarmResponseIndexRef.current = 0;
        setIsHistoryRefresh(true);
        myKeywordAlarmRemove();
        myKeywordAlarmRefetch();
    };

    const renderItem = useCallback(
        ({ item }: { item: AlarmHistoryTypes }) => (
            <TouchableOpacity
                onPress={() => {
                    // item.postId 받아서 전달
                }}
                style={keywordAlarmTemplateStyles.historyItemButton}
                activeOpacity={1}>
                <View style={keywordAlarmTemplateStyles.alarmIcon}>
                    <Icons type="materialCommunityIcons" name="bell" size={20} color={Colors.BLACK} />
                </View>
                <View style={keywordAlarmTemplateStyles.hisrotyItemTextBox}>
                    <SemiBoldText text={item.title} size={14} color={Colors.BLACK} />
                    <Spacer height={2} />
                    <NormalText text={item.body} size={12} color={Colors.TXT_GRAY} numberOfLines={2} />
                </View>
                <View>
                    <MediumText text="16분전" size={11} color={Colors.TXT_GRAY} />
                </View>
            </TouchableOpacity>
        ),
        [],
    );

    useFocusEffect(
        useCallback(() => {
            myKeywordsRefetch();
        }, []),
    );

    return (
        <View>
            <View style={keywordAlarmTemplateStyles.headerBox}>
                <MediumText text={`알림 받는 키워드 ${keywordsLength}개`} size={14} color={Colors.BLACK} />
                <TouchButton
                    onPress={() => navigationHandler('LikeKeywordSetting')}
                    paddingHorizontal={16}
                    paddingVertical={8}
                    backgroundColor="#F2F2F2">
                    <SemiBoldText text="설정" size={13} color={Colors.BLACK} />
                </TouchButton>
            </View>

            <View>
                <FlatList
                    data={keywordAlarmData}
                    renderItem={renderItem}
                    ListFooterComponent={<Spacer height={120} />}
                    onEndReachedThreshold={0.8}
                    onEndReached={() => {
                        if (hasNextPage) {
                            fetchNextPage();
                        }
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            onRefresh={alarmHistoryRefresh}
                            refreshing={isHistoryRefresh}
                            progressViewOffset={0}
                        />
                    }
                />
            </View>
        </View>
    );
};

export default KeywordAlarmTemplate;
