import React from 'react';

import ScreenWrapper from '../../components/organisms/ScreenWrapper';
import MyProfileTemplate from '../../components/templates/myPage/MyPageTemplate';
import { useRootNavigation } from '../../navigations/RootStackNavigation';

const MyPageScreen = () => {
    const rootNavigation = useRootNavigation();
    const moveToScreen = (state: string) => {
        switch (state) {
            case 'EDIT_NICK':
                rootNavigation.push('EditNickname');
                break;
        }
    };
    return (
        <ScreenWrapper isPaddingHorizontal={false}>
            <MyProfileTemplate moveToScreen={moveToScreen} />
        </ScreenWrapper>
    );
};

export default MyPageScreen;