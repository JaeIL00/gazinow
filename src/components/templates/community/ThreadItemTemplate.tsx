import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { FlatList, Image, Platform, View } from 'react-native';
import DropShadow from 'react-native-drop-shadow';
import { useRecoilValue } from 'recoil';
import { useInfiniteQuery } from 'react-query';

import Icons from '../../atoms/Icons';
import Spacer from '../../atoms/Spacer';
import colors from '../../../constants/colors';
import NormalText from '../../atoms/NormalText';
import TouchButton from '../../atoms/TouchButton';
import SemiBoldText from '../../atoms/SemiBoldText';
import CommentListItem from '../../organisms/cummunity/CommentListItem';
import { userAuthAtom } from '../../../recoil';
import { getCommentListAPI } from '../../../apis/api';
import { threadItemTemplateStyles } from '../../../styles/templates/styles';
import { screenHeight, screenWidth } from '../../../utils/changeStyleSize';
import { CommentTopicTypes, CommentTypes } from '../../../types/common/types';
import { ThreadItemTemplateProps } from '../../../types/templates/types';
import IconButton from '../../molecules/IconButton';

const ThreadItemTemplate = ({
    postId,
    freshRePostCount,
    movetoCommunityScreen,
    moveToWriteScreen,
}: ThreadItemTemplateProps) => {
    const { accessToken } = useRecoilValue(userAuthAtom);

    const commentIndexRef = useRef<number>(0);

    const [commentList, setCommentList] = useState<CommentTypes[]>([]);
    const [isCommentRefresh, setIsCommentRefresh] = useState<boolean>(false);
    const [postValue, setPostValue] = useState<CommentTopicTypes>({
        title: '',
        rePostCount: 0,
        placeName: '',
        time: '',
        distance: '',
        backgroundMapUrl: '',
    });

    // Get comment list API
    const {
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
        refetch: commentRefetch,
        remove: commentRemove,
    } = useInfiniteQuery(
        'getCommentList',
        ({ pageParam = 0 }) =>
            getCommentListAPI({
                accessToken,
                postId,
                curX: 37.49795103144074,
                curY: 127.02760985223079,
                page: pageParam,
            }),
        {
            getNextPageParam: lastPage => {
                const total = lastPage.data.data.postList.totalPages;
                const nextPage = lastPage.data.data.postList.pageable.pageNumber + 1;
                return nextPage === total ? undefined : nextPage;
            },
            onSuccess: data => {
                const pageNumber = data.pages[commentIndexRef.current].data.data.postList.pageable.pageNumber;
                const content: CommentTypes[] = data.pages[commentIndexRef.current].data.data.postList.content;
                const getNotReported = content.filter((item: CommentTypes) => !item.report);
                if (pageNumber === 0) {
                    getCommentTopic(data.pages[commentIndexRef.current].data.data);
                    setCommentList(getNotReported);
                    setIsCommentRefresh(false);
                } else {
                    setCommentList([...commentList, ...getNotReported]);
                }
                if (!data.pages[0].data.data.postList.last) {
                    commentIndexRef.current = commentIndexRef.current + 1;
                }
            },
            onError: ({ response }) => {
                setIsCommentRefresh(false);
                // For Debug
                console.log('(ERROR) Get comment list API. respense: ', response);
            },
        },
    );

    const getCommentListRefetch = () => {
        commentRemove();
        commentRefetch();
    };

    // Get comment topic by comment API
    const getCommentTopic = useCallback((data: CommentTopicTypes) => {
        setPostValue({
            title: data.title,
            rePostCount: data.rePostCount,
            placeName: data.placeName,
            time: data.time,
            distance: data.distance,
            backgroundMapUrl: data.backgroundMapUrl,
        });
    }, []);

    // Delete report comment from success report API
    const delReportComment = (postId: number) => {
        // commentList.filter(comment => comment.postId !== postId);
        setCommentList(prev => prev.filter(comment => comment.postId !== postId));
    };

    // Comment thread list render
    const renderItem = useCallback(
        ({ item }: { item: CommentTypes }) => (
            <CommentListItem
                comment={item}
                postTitle={postValue.title}
                postCount={postValue.rePostCount}
                getCommentListRefetch={getCommentListRefetch}
                delReportComment={delReportComment}
            />
        ),
        [postValue],
    );
    const commentListRefresh = useCallback(() => {
        setIsCommentRefresh(true);
        getCommentListRefetch();
    }, []);
    const ItemSeparatorComponent = useCallback(() => <Spacer height={29} />, []);

    // If write comment, get fresh list
    useLayoutEffect(() => {
        commentIndexRef.current = 0;
        getCommentListRefetch();
    }, [freshRePostCount]);

    return (
        <>
            {postValue.backgroundMapUrl && (
                <View style={threadItemTemplateStyles.mapImgBox}>
                    <Image source={{ uri: postValue.backgroundMapUrl }} style={threadItemTemplateStyles.mapImg} />
                </View>
            )}

            <View
                style={[
                    threadItemTemplateStyles.main,
                    {
                        paddingTop: postValue.backgroundMapUrl ? 19 * screenHeight : 66 * screenHeight,
                    },
                ]}>
                <View style={threadItemTemplateStyles.headerBox}>
                    <View>
                        {postValue.backgroundMapUrl && (
                            <>
                                <NormalText
                                    text={`${postValue.distance} | ${postValue.placeName}`}
                                    size={12}
                                    color={colors.TXT_GRAY}
                                />
                                <Spacer height={4} />
                            </>
                        )}
                        <View style={threadItemTemplateStyles.headerTitleBox}>
                            {postValue.title.split(' ').map(item => (
                                <SemiBoldText text={`${item} `} size={20} color={colors.BLACK} />
                            ))}
                        </View>
                        <Spacer height={4} />
                        <NormalText
                            text={`${postValue.rePostCount} posts • updated ${postValue.time}`}
                            size={12}
                            color={colors.BLACK}
                        />
                    </View>
                    {/* Temparay planning
                    <Image
                        source={require('../../../assets/icons/share.png')}
                        style={threadItemTemplateStyles.shareIcon}
                    /> */}
                </View>

                <View style={threadItemTemplateStyles.commentBox}>
                    <View style={threadItemTemplateStyles.commentBoxBar} />
                    <FlatList
                        data={commentList}
                        renderItem={renderItem}
                        contentContainerStyle={threadItemTemplateStyles.commentListBox}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        showsVerticalScrollIndicator={false}
                        onEndReachedThreshold={1.3}
                        onEndReached={() => {
                            if (hasNextPage) {
                                fetchNextPage();
                            }
                        }}
                        onRefresh={commentListRefresh}
                        refreshing={isCommentRefresh}
                    />
                </View>
            </View>

            <View
                style={[
                    threadItemTemplateStyles.backButtonBox,
                    {
                        top: postValue.backgroundMapUrl ? 20 * screenHeight : 35 * screenHeight,
                    },
                ]}>
                {Platform.OS === 'android' && (
                    <>
                        {postValue.backgroundMapUrl ? (
                            <DropShadow style={threadItemTemplateStyles.ButtonShadow}>
                                <IconButton
                                    onPress={movetoCommunityScreen}
                                    backgroundColor="#FFFFFF80"
                                    width={36}
                                    height={(36 / screenHeight) * screenWidth}
                                    borderRadius={36}
                                    iconType="octicons"
                                    iconName="arrow-left"
                                    iconColor={colors.TXT_BLACK}
                                    iconSize={22}
                                />
                            </DropShadow>
                        ) : (
                            <IconButton
                                onPress={movetoCommunityScreen}
                                iconType="octicons"
                                iconName="arrow-left"
                                iconColor={colors.TXT_BLACK}
                                iconSize={22}
                            />
                        )}
                    </>
                )}
            </View>

            <View style={threadItemTemplateStyles.writeCommentBox}>
                {Platform.OS === 'android' && (
                    <DropShadow style={threadItemTemplateStyles.ButtonShadow}>
                        <TouchButton
                            onPress={() => moveToWriteScreen(postValue.title, postValue.rePostCount, postValue.time)}
                            backgroundColor={colors.VIOLET}
                            width={100}
                            height={44}
                            borderRadius={32}>
                            <View style={threadItemTemplateStyles.writeCommentButton}>
                                <Icons type="octicons" name="plus" color={colors.WHITE} size={14} />
                                <Spacer width={6} />
                                <SemiBoldText text="답글달기" size={14} color={colors.WHITE} />
                            </View>
                        </TouchButton>
                    </DropShadow>
                )}
            </View>
        </>
    );
};

export default ThreadItemTemplate;
