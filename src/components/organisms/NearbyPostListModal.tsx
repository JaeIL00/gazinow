import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, Image, PanResponder, Platform, View } from 'react-native';
import DropShadow from 'react-native-drop-shadow';

import dummy from '../../utils/dummy';
import Spacer from '../smallest/Spacer';
import Colors from '../../styles/Colors';
import PostListItem from './PostListItem';
import TouchButton from '../smallest/TouchButton';
import SemiBoldText from '../smallest/SemiBoldText';
import { screenHeight } from '../../utils/changeStyleSize';
import { NearbyPostListModalProps } from '../../types/types';
import { nearbyPostListModalStyles } from '../../styles/styles';

const FULL_ANIVALUE = -565 * screenHeight;
const MIDDLE_ANIVALUE = -340 * screenHeight;
const MINI_ANIVALUE = 0;
const INIT_MINI = 595 * screenHeight;
const INIT_OUTPUT = INIT_MINI + 100;

const NearbyPostListModal = ({ isModalRef, handleModalTrigger, onPressGetUserPosition }: NearbyPostListModalProps) => {
    // Modal animation handling
    const animRef = useRef(new Animated.Value(0)).current;
    const opacityRef = useRef(new Animated.Value(0)).current;
    const isModalBackground = useRef(false);
    const animType = useRef('mini');
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gestureState) => {
                const { dy } = gestureState;
                if (animType.current === 'mini') {
                    animRef.setValue(dy);
                    opacityRef.setValue(-dy);
                }
                if (animType.current === 'middle') {
                    isModalBackground.current = true;
                    animRef.setValue(MIDDLE_ANIVALUE + dy);
                    opacityRef.setValue(-MIDDLE_ANIVALUE - dy);
                }
                if (animType.current === 'full') {
                    animRef.setValue(FULL_ANIVALUE + dy);
                    opacityRef.setValue(-FULL_ANIVALUE - dy);
                }
            },
            onPanResponderEnd: (event, gestureState) => {
                const { dy } = gestureState;
                // Animating start middle modal
                if (dy < -30 && animType.current === 'middle') {
                    // To full from middle
                    Animated.timing(animRef, {
                        toValue: FULL_ANIVALUE,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                    Animated.spring(opacityRef, {
                        toValue: -FULL_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                    isModalRef.current = true;
                    return (animType.current = 'full');
                }
                if (dy > -30 && animType.current === 'middle') {
                    // To mini from middle
                    Animated.timing(animRef, {
                        toValue: MINI_ANIVALUE,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();
                    isModalRef.current = false;
                    return (animType.current = 'mini');
                }
                // Animating start mini modal
                if (-330 < dy && dy < -30 && animType.current === 'mini') {
                    // To middile from mini
                    Animated.timing(animRef, {
                        toValue: MIDDLE_ANIVALUE,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                    isModalRef.current = true;
                    return (animType.current = 'middle');
                }
                if (dy > -30 && animType.current === 'mini') {
                    // None
                    Animated.timing(animRef, {
                        toValue: MINI_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                }
                if (dy < -330 && animType.current === 'mini') {
                    // To full from mini
                    isModalBackground.current = true;
                    Animated.timing(animRef, {
                        toValue: FULL_ANIVALUE,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(({ finished }) => {
                        if (finished) {
                            Animated.spring(opacityRef, {
                                toValue: -FULL_ANIVALUE,
                                useNativeDriver: true,
                            }).start();
                        }
                    });
                    isModalRef.current = true;
                    return (animType.current = 'full');
                }
                // Animating start full modal
                if (330 > dy && dy > 30 && animType.current === 'full') {
                    // To middile from full
                    Animated.timing(animRef, {
                        toValue: MIDDLE_ANIVALUE,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                    Animated.spring(opacityRef, {
                        toValue: -MIDDLE_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                    animType.current = 'middle';
                }
                if (dy > 330 && animType.current === 'full') {
                    // To mini from full
                    Animated.timing(animRef, {
                        toValue: MINI_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                    Animated.spring(opacityRef, {
                        toValue: -MINI_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                    isModalRef.current = false;
                    animType.current = 'mini';
                }
                if (dy < 30 && animType.current === 'full') {
                    // None
                    Animated.timing(animRef, {
                        toValue: FULL_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                    Animated.spring(opacityRef, {
                        toValue: -FULL_ANIVALUE,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    // Press hardware back key
    useEffect(() => {
        if (handleModalTrigger) {
            Animated.timing(animRef, {
                toValue: MINI_ANIVALUE,
                useNativeDriver: true,
            }).start();
            Animated.spring(opacityRef, {
                toValue: MINI_ANIVALUE,
                useNativeDriver: true,
            }).start();
            isModalRef.current = false;
            animType.current = 'mini';
        }
    }, [handleModalTrigger]);

    return (
        <>
            <Animated.View
                style={[
                    nearbyPostListModalStyles.grayBackground,
                    {
                        opacity: opacityRef.interpolate({
                            inputRange: [-MIDDLE_ANIVALUE, -FULL_ANIVALUE],
                            outputRange: [0, 0.6],
                        }),
                        zIndex: opacityRef.interpolate({
                            inputRange: [-MIDDLE_ANIVALUE, -MIDDLE_ANIVALUE + 10, -FULL_ANIVALUE],
                            outputRange: [-1, 0, 0],
                        }),
                    },
                ]}
            />

            <Animated.View
                style={{
                    transform: [
                        {
                            translateY: animRef.interpolate({
                                inputRange: [0, 100],
                                outputRange: [INIT_MINI, INIT_OUTPUT],
                            }),
                        },
                    ],
                    opacity: opacityRef.interpolate({
                        inputRange: [-MIDDLE_ANIVALUE, -FULL_ANIVALUE - 100],
                        outputRange: [1, 0],
                    }),
                }}>
                <View style={nearbyPostListModalStyles.toggleButtonBox}>
                    <TouchButton
                        onPress={onPressGetUserPosition}
                        width={52}
                        height={52}
                        borderRadius={52}
                        backgroundColor={Colors.WHITE}
                        borderWidth={1}
                        borderColor="#E3E3E3">
                        <Image
                            source={require('../../assets/icons/location.png')}
                            style={nearbyPostListModalStyles.locationIcon}
                        />
                    </TouchButton>
                    <Spacer height={8} />
                    {Platform.OS === 'android' && (
                        <DropShadow style={nearbyPostListModalStyles.dropshadow}>
                            <TouchButton
                                onPress={() => {}}
                                width={52}
                                height={52}
                                borderRadius={52}
                                backgroundColor={Colors.VIOLET}>
                                <Image
                                    source={require('../../assets/icons/write.png')}
                                    style={nearbyPostListModalStyles.writeIcon}
                                />
                            </TouchButton>
                        </DropShadow>
                    )}
                </View>
            </Animated.View>
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    nearbyPostListModalStyles.container,
                    {
                        transform: [
                            {
                                translateY: animRef.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [INIT_MINI, INIT_OUTPUT],
                                }),
                            },
                        ],
                    },
                ]}>
                <View style={nearbyPostListModalStyles.slideBarBox}>
                    <View style={nearbyPostListModalStyles.slideBar} />
                </View>

                <View style={nearbyPostListModalStyles.titleBox}>
                    <SemiBoldText text="00님 주변에서 일어나고 있는 일" color={Colors.BLACK} size={18} />
                </View>
                <Spacer height={10} />
            </Animated.View>
            <Animated.View
                style={[
                    nearbyPostListModalStyles.listBox,
                    {
                        transform: [
                            {
                                translateY: animRef.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [INIT_MINI, INIT_OUTPUT],
                                }),
                            },
                        ],
                    },
                ]}>
                <FlatList
                    data={dummy}
                    renderItem={({ item }) => <PostListItem post={item} />}
                    ItemSeparatorComponent={() => <Spacer height={20} />}
                    ListFooterComponent={() => <Spacer height={20} />}
                    showsVerticalScrollIndicator={false}
                />
            </Animated.View>
        </>
    );
};

export default NearbyPostListModal;

// const NearbyPostListModal = ({ isModalRef, handleModalTrigger, onPressGetUserPosition }: NearbyPostListModalProps) => {
//     // Modal animation handling
//     const animRef = useRef(new Animated.Value(0)).current;
//     const opacityRef = useRef(new Animated.Value(0)).current;
//     const isModalBackground = useRef(false);
//     const animType = useRef('mini');
//     const panResponder = useRef(
//         PanResponder.create({
//             onMoveShouldSetPanResponder: () => true,
//             onPanResponderMove: (event, gestureState) => {
//                 const { dy } = gestureState;
//                 if (animType.current === 'mini') {
//                     animRef.setValue(dy);
//                     opacityRef.setValue(-dy);
//                 }
//                 if (animType.current === 'middle') {
//                     isModalBackground.current = true;
//                     animRef.setValue(MIDDLE_ANIVALUE + dy);
//                     opacityRef.setValue(-MIDDLE_ANIVALUE - dy);
//                 }
//                 if (animType.current === 'full') {
//                     animRef.setValue(FULL_ANIVALUE + dy);
//                     opacityRef.setValue(-FULL_ANIVALUE - dy);
//                 }
//             },
//             onPanResponderEnd: (event, gestureState) => {
//                 const { dy } = gestureState;
//                 // Animating start middle modal
//                 if (dy < -30 && animType.current === 'middle') {
//                     // To full from middle
//                     Animated.timing(animRef, {
//                         toValue: FULL_ANIVALUE,
//                         duration: 300,
//                         useNativeDriver: false,
//                     }).start();
//                     Animated.spring(opacityRef, {
//                         toValue: -FULL_ANIVALUE,
//                         useNativeDriver: true,
//                     }).start();
//                     isModalRef.current = true;
//                     return (animType.current = 'full');
//                 }
//                 if (dy > -30 && animType.current === 'middle') {
//                     // To mini from middle
//                     Animated.timing(animRef, {
//                         toValue: MINI_ANIVALUE,
//                         duration: 500,
//                         useNativeDriver: false,
//                     }).start();
//                     isModalRef.current = false;
//                     return (animType.current = 'mini');
//                 }
//                 // Animating start mini modal
//                 if (-330 < dy && dy < -30 && animType.current === 'mini') {
//                     // To middile from mini
//                     Animated.timing(animRef, {
//                         toValue: MIDDLE_ANIVALUE,
//                         duration: 300,
//                         useNativeDriver: false,
//                     }).start();
//                     isModalRef.current = true;
//                     animType.current = 'middle';
//                 }
//                 if (dy > -30 && animType.current === 'mini') {
//                     // None
//                     Animated.timing(animRef, {
//                         toValue: MINI_ANIVALUE,
//                         useNativeDriver: false,
//                     }).start();
//                 }
//                 if (dy < -330 && animType.current === 'mini') {
//                     // To full from mini
//                     isModalBackground.current = true;
//                     Animated.timing(animRef, {
//                         toValue: FULL_ANIVALUE,
//                         duration: 300,
//                         useNativeDriver: false,
//                     }).start(({ finished }) => {
//                         if (finished) {
//                             Animated.spring(opacityRef, {
//                                 toValue: -FULL_ANIVALUE,
//                                 useNativeDriver: true,
//                             }).start();
//                         }
//                     });
//                     isModalRef.current = true;
//                     animType.current = 'full';
//                 }
//                 // Animating start full modal
//                 if (330 > dy && dy > 30 && animType.current === 'full') {
//                     // To middile from full
//                     Animated.timing(animRef, {
//                         toValue: MIDDLE_ANIVALUE,
//                         duration: 300,
//                         useNativeDriver: false,
//                     }).start();
//                     Animated.spring(opacityRef, {
//                         toValue: -MIDDLE_ANIVALUE,
//                         useNativeDriver: true,
//                     }).start();
//                     animType.current = 'middle';
//                 }
//                 if (dy > 330 && animType.current === 'full') {
//                     // To mini from full
//                     Animated.timing(animRef, {
//                         toValue: MINI_ANIVALUE,
//                         useNativeDriver: false,
//                     }).start();
//                     Animated.spring(opacityRef, {
//                         toValue: -MINI_ANIVALUE,
//                         useNativeDriver: true,
//                     }).start();
//                     isModalRef.current = false;
//                     animType.current = 'mini';
//                 }
//                 if (dy < 30 && animType.current === 'full') {
//                     // None
//                     Animated.timing(animRef, {
//                         toValue: FULL_ANIVALUE,
//                         useNativeDriver: false,
//                     }).start();
//                     Animated.spring(opacityRef, {
//                         toValue: -FULL_ANIVALUE,
//                         useNativeDriver: false,
//                     }).start();
//                 }
//             },
//         }),
//     ).current;

//     // Press hardware back key
//     useEffect(() => {
//         if (handleModalTrigger) {
//             Animated.timing(animRef, {
//                 toValue: MINI_ANIVALUE,
//                 useNativeDriver: true,
//             }).start();
//             Animated.spring(opacityRef, {
//                 toValue: MINI_ANIVALUE,
//                 useNativeDriver: true,
//             }).start();
//             isModalRef.current = false;
//             animType.current = 'mini';
//         }
//     }, [handleModalTrigger]);

//     return (
//         <>
//             <Animated.View
//                 style={[
//                     nearbyPostListModalStyles.grayBackground,
//                     {
//                         opacity: opacityRef.interpolate({
//                             inputRange: [-MIDDLE_ANIVALUE, -FULL_ANIVALUE],
//                             outputRange: [0, 0.6],
//                         }),
//                         zIndex: opacityRef.interpolate({
//                             inputRange: [-MIDDLE_ANIVALUE, -MIDDLE_ANIVALUE + 10, -FULL_ANIVALUE],
//                             outputRange: [-1, 0, 0],
//                         }),
//                     },
//                 ]}
//             />

//             <Animated.View
//                 style={{
//                     transform: [
//                         {
//                             translateY: animRef.interpolate({
//                                 inputRange: [0, 100],
//                                 outputRange: [INIT_MINI, INIT_OUTPUT],
//                             }),
//                         },
//                     ],
//                     opacity: opacityRef.interpolate({
//                         inputRange: [-MIDDLE_ANIVALUE, -FULL_ANIVALUE - 100],
//                         outputRange: [1, 0],
//                     }),
//                 }}>
//                 <View style={nearbyPostListModalStyles.toggleButtonBox}>
//                     <TouchButton
//                         onPress={onPressGetUserPosition}
//                         width={52}
//                         height={52}
//                         borderRadius={52}
//                         backgroundColor={Colors.WHITE}
//                         borderWidth={1}
//                         borderColor="#E3E3E3">
//                         <Image
//                             source={require('../../assets/icons/location.png')}
//                             style={nearbyPostListModalStyles.locationIcon}
//                         />
//                     </TouchButton>
//                     <Spacer height={8} />
//                     {Platform.OS === 'android' && (
//                         <DropShadow style={nearbyPostListModalStyles.dropshadow}>
//                             <TouchButton
//                                 onPress={() => {}}
//                                 width={52}
//                                 height={52}
//                                 borderRadius={52}
//                                 backgroundColor={Colors.VIOLET}>
//                                 <Image
//                                     source={require('../../assets/icons/write.png')}
//                                     style={nearbyPostListModalStyles.writeIcon}
//                                 />
//                             </TouchButton>
//                         </DropShadow>
//                     )}
//                 </View>
//             </Animated.View>
//             <Animated.View
//                 {...panResponder.panHandlers}
//                 style={[
//                     nearbyPostListModalStyles.container,
//                     {
//                         height: animRef.interpolate({
//                             inputRange: [0, 100],
//                             outputRange: [INIT_MINI, INIT_OUTPUT],
//                         }),
//                     },
//                 ]}>
//                 <View style={nearbyPostListModalStyles.slideBarBox}>
//                     <View style={nearbyPostListModalStyles.slideBar} />
//                 </View>

//                 <View style={nearbyPostListModalStyles.titleBox}>
//                     <SemiBoldText text="00님 주변에서 일어나고 있는 일" color={Colors.BLACK} size={18} />
//                 </View>
//                 <Spacer height={10} />
//                 <FlatList
//                     data={dummy}
//                     renderItem={({ item }) => <PostListItem post={item} />}
//                     ItemSeparatorComponent={() => <Spacer height={20} />}
//                     ListFooterComponent={() => <Spacer height={20} />}
//                     showsVerticalScrollIndicator={false}
//                 />
//             </Animated.View>
//             {/* <Animated.View
//                 style={[
//                     nearbyPostListModalStyles.listBox,
//                     {
//                         transform: [
//                             {
//                                 translateY: animRef.interpolate({
//                                     inputRange: [0, 100],
//                                     outputRange: [INIT_MINI, INIT_OUTPUT],
//                                 }),
//                             },
//                         ],
//                     },
//                 ]}>

//             </Animated.View> */}
//         </>
//     );
// };

// export default NearbyPostListModal;
