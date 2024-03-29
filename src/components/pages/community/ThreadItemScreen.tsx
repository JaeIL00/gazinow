import React from 'react';

import ScreenWrapper from '../../organisms/common/ScreenWrapper';
import ThreadItemTemplate from '../../templates/community/ThreadItemTemplate';
import { useRootNavigation, useRootRoute } from '../../../navigations/RootStackNavigation';

const ThreadItemScreen = () => {
    const route = useRootRoute<'ThreadItem'>();
    const postId = route.params.postId;
    const freshRePostCount = route.params.freshRePostCount;

    const rootNavigation = useRootNavigation();
    const movetoCommunityScreen = () => {
        rootNavigation.navigate('ServiceMainTab', { screen: 'Community' });
    };
    const moveToWriteScreen = (title: string, rePostCount: number, time: string) => {
        rootNavigation.navigate('WriteComment', {
            title,
            rePostCount,
            time,
            postId: postId,
        });
    };

    return (
        <ScreenWrapper isPaddingHorizontal={false}>
            <ThreadItemTemplate
                postId={postId}
                movetoCommunityScreen={movetoCommunityScreen}
                moveToWriteScreen={moveToWriteScreen}
                freshRePostCount={freshRePostCount}
            />
        </ScreenWrapper>
    );
};
export default ThreadItemScreen;
