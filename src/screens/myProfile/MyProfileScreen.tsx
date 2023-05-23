import React from 'react';
import { StatusBar, View } from 'react-native';

import Colors from '../../styles/Colors';
import MyProfileTemplate from '../../components/templates/myProfile/MyProfileTemplate';
import { globalBackWhiteStyles } from '../../styles/styles';
import { useRootNavigation } from '../../navigations/RootStackNavigation';

const MyProfileScreen = () => {
    const rootNavigation = useRootNavigation();
    const moveToScreen = (state: string) => {
        switch (state) {
            case 'EDIT_NICK':
                rootNavigation.navigate('EditNickname');
                break;
        }
    };
    return (
        <View style={globalBackWhiteStyles.container}>
            <StatusBar backgroundColor={Colors.WHITE} barStyle="dark-content" />
            <MyProfileTemplate moveToScreen={moveToScreen} />
        </View>
    );
};

export default MyProfileScreen;
