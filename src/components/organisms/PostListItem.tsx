import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import Spacer from '../smallest/Spacer';
import Colors from '../../styles/Colors';
import NormalText from '../smallest/NormalText';
import MediumText from '../smallest/MediumText';
import SemiBoldText from '../smallest/SemiBoldText';
import { PostListItemProps } from '../../types/types';
import { postListItemStyles } from '../../styles/styles';
import { screenFont, screenHeight } from '../../utils/changeStyleSize';
import { useRootNavigation } from '../../navigations/RootStackNavigation';

const PostListItem = ({ post, isBorder, isMarkerPost, isNearList }: PostListItemProps) => {
    const rootNavigation = useRootNavigation();
    return (
        <>
            {post && (
                <View
                    style={{
                        borderBottomWidth: isBorder ? 1 * screenFont : undefined,
                        borderColor: '#EBEBEB',
                    }}>
                    <TouchableOpacity
                        onPress={() => rootNavigation.navigate('ThreadItem', { postId: post.postId })}
                        activeOpacity={1}>
                        <View
                            style={[
                                postListItemStyles.container,
                                {
                                    paddingVertical: isNearList ? 10 * screenHeight : 16 * screenHeight,
                                },
                            ]}>
                            <View style={postListItemStyles.textBox}>
                                <SemiBoldText
                                    text={post.title}
                                    size={isMarkerPost ? 18 : 16}
                                    color={Colors.BLACK}
                                    numberOfLines={1}
                                />
                                {isMarkerPost && <Spacer height={5} />}
                                <MediumText
                                    text={`${post.distance ? post.distance + ' | ' : ''}${post.time} | +${
                                        post.rePostCount
                                    }posts`}
                                    size={11}
                                    color={Colors.TXT_GRAY}
                                />
                                <Spacer height={5} />
                                <NormalText text={post.content} size={12} color="#6A6A6A" numberOfLines={2} />
                            </View>

                            {post.thumbNail && (
                                <View style={postListItemStyles.postImageBox}>
                                    <Image source={{ uri: post.thumbNail }} style={postListItemStyles.postImage} />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
};
export default PostListItem;
