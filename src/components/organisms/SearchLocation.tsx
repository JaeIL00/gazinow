import React, { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, StatusBar, TouchableOpacity, View } from 'react-native';
import { debounce } from 'lodash';
import { useQuery } from 'react-query';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icons from '../smallest/Icons';
import Spacer from '../smallest/Spacer';
import Colors from '../../styles/Colors';
import MediumText from '../smallest/MediumText';
import NormalText from '../smallest/NormalText';
import TouchButton from '../smallest/TouchButton';
import { nearPlaceGoogleAPI, searchGoogleAPI } from '../../queries/api';
import { searchLocationStyles } from '../../styles/styles';
import { SingleLineInput } from '../smallest/SingleLineInput';
import { screenFont, screenHeight, screenWidth } from '../../utils/changeStyleSize';
import { LocationResultTypes, SearchHistoryTypes, SearchLocationProps } from '../../types/types';

const SearchLocation = ({
    isHome,
    placeholder,
    isAllowLocation,
    currentPosition,
    searchModalHandler,
    getLocationHandler,
}: SearchLocationProps) => {
    const [searchText, setSearchText] = useState<string>('');
    const [nextPageToken, setNextPageToken] = useState<string>('');
    const [resultsData, setResultsData] = useState<LocationResultTypes[]>([]);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryTypes[]>([]);
    const [resultsNearData, setResultsNearData] = useState<LocationResultTypes[]>([]);

    // Get Google search results API
    const { refetch: placeSearchRefetch } = useQuery('placeSearch', () => searchGoogleAPI(searchText, nextPageToken), {
        enabled: false,
        onSuccess: ({ data }) => {
            // Save search results for list
            if (data.next_page_token && !nextPageToken) {
                setNextPageToken(data.next_page_token);
                setResultsData(data.results);
            } else if (nextPageToken) {
                data.next_page_token ? setNextPageToken(data.next_page_token) : setNextPageToken('');
                setResultsData([...resultsData, ...data.results]);
            } else {
                setResultsData(data.results);
            }
        },
        onError: ({ response }) => {
            // For Debug
            console.log('(ERROR) Get Google search results API.', response);
        },
    });

    // Get Google near search results API
    const { refetch: nearPlaceSearchRefetch } = useQuery(
        'nearPlaceSearch',
        () => nearPlaceGoogleAPI(currentPosition!.curLat, currentPosition!.curLon, nextPageToken),
        {
            enabled: false,
            onSuccess: ({ data }) => {
                // Save near place results for list
                if (data.next_page_token && !nextPageToken) {
                    setNextPageToken(data.next_page_token);
                    setResultsNearData(data.results);
                } else if (nextPageToken) {
                    data.next_page_token ? setNextPageToken(data.next_page_token) : setNextPageToken('');
                    setResultsNearData([...resultsData, ...data.results]);
                } else {
                    setResultsNearData(data.results);
                }
            },
            onError: ({ response }) => {
                // For Debug
                console.log('(ERROR) Get Google near place results API.', response);
            },
        },
    );

    // Input text for searching location
    const onChangeSearchText = (text: string) => {
        setSearchText(text);
        setNextPageToken('');
        if (text.length > 0) {
            getSearchResult();
        } else if (text.length === 0) {
            setResultsData([]);
        }
    };
    const onPressDeleteText = () => {
        setSearchText('');
        setNextPageToken('');
        setResultsData([]);
    };

    const getSearchResult = useCallback(
        debounce(() => {
            placeSearchRefetch();
        }, 600),
        [],
    );

    const getNextPageResults = () => {
        if (nextPageToken) {
            placeSearchRefetch();
        }
    };

    // Save search history from home
    const saveSearchHistoryStorage = async (address: string, name: string, location: { lat: number; lng: number }) => {
        try {
            const freshFilter = searchHistory.filter(item => item.formatted_address !== address);
            const freshHistory = [{ formatted_address: address, name, location }, ...freshFilter];
            if (freshHistory.length > 10) {
                freshHistory.pop();
            }
            console.log('searchHistory', searchHistory);
            console.log('freshHistory', freshHistory);
            setSearchHistory(freshHistory);
            await AsyncStorage.setItem('GAZI_hst_sch', JSON.stringify(freshHistory));
        } catch (error) {
            // For Debug
            console.log('(ERROR)Save search history from home.', error);
        }
    };

    // Get search history from storage
    const getSearchHistory = async () => {
        try {
            const historyArray = await AsyncStorage.getItem('GAZI_hst_sch');
            if (historyArray) {
                setSearchHistory(JSON.parse(historyArray));
            }
            // await AsyncStorage.removeItem('GAZI_hst_sch');
        } catch (error) {
            // For Debug
            console.log('(ERROR)Get search history from storage.', error);
        }
    };

    // Flatlist function
    const keyExtractor = useCallback(
        (item: LocationResultTypes | SearchHistoryTypes, index: number) => item.name + index,
        [],
    );
    const renderItemResult = useCallback(
        ({ item }: { item: LocationResultTypes }) => {
            let freshAddress: string = '';
            if (isAllowLocation && !searchText) {
                freshAddress = item.vicinity;
            } else {
                freshAddress = item.formatted_address.replace('대한민국 ', '');
            }
            return (
                <TouchableOpacity
                    onPress={() => {
                        saveSearchHistoryStorage(
                            searchText ? item.formatted_address : item.vicinity,
                            item.name,
                            item.geometry.location,
                        );
                        getLocationHandler(item.geometry.location, searchText ? item.name : '디폴트 내 근처 위치');
                    }}
                    activeOpacity={1}
                    style={searchLocationStyles.resultButton}>
                    <View style={searchLocationStyles.listItemBox}>
                        <FastImage
                            source={require('../../assets/icons/location-pin-fill.png')}
                            style={searchLocationStyles.resultIcon}
                        />
                        <View style={searchLocationStyles.resultTextBox}>
                            <MediumText
                                text={isAllowLocation && !searchText ? '디폴트 내 근처 위치' : item.name}
                                size={16}
                                color="#000000"
                            />
                            <Spacer height={3} />
                            <View style={searchLocationStyles.resultAddress}>
                                {freshAddress.split(' ').map(item => (
                                    <NormalText text={`${item} `} size={14} color={Colors.TXT_GRAY} />
                                ))}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [resultsData],
    );
    const renderItemHistory = useCallback(
        ({ item }: { item: SearchHistoryTypes }) => {
            const freshAddress = item.formatted_address.replace('대한민국 ', '');
            return (
                <TouchableOpacity
                    onPress={() => {
                        if (isHome) {
                            saveSearchHistoryStorage(item.formatted_address, item.name, item.location);
                        }
                        getLocationHandler(item.location, item.name);
                    }}
                    activeOpacity={1}
                    style={searchLocationStyles.resultButton}>
                    <View style={searchLocationStyles.listItemBox}>
                        <View style={searchLocationStyles.historyIcons}>
                            <Icons type="feather" name="clock" size={21} color={Colors.TXT_LIGHTGRAY} />
                        </View>
                        <View style={searchLocationStyles.resultTextBox}>
                            <MediumText text={item.name} size={16} color="#000000" />
                            <Spacer height={3} />
                            <View style={searchLocationStyles.resultAddress}>
                                {freshAddress.split(' ').map(item => (
                                    <NormalText text={`${item} `} size={14} color={Colors.TXT_GRAY} />
                                ))}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [searchHistory],
    );

    useLayoutEffect(() => {
        getSearchHistory();
        if (!isHome && isAllowLocation) {
            nearPlaceSearchRefetch();
        }
    }, []);

    return (
        <View>
            <StatusBar backgroundColor={Colors.BACKGROUND_DEFAULT} />
            <View style={searchLocationStyles.inputContainer}>
                <View style={searchLocationStyles.inputBox}>
                    {isHome && searchModalHandler && (
                        <>
                            <TouchButton onPress={() => searchModalHandler('CLOSE')} hitSlop={10}>
                                <FastImage
                                    source={require('../../assets/icons/arrow-left-sharp.png')}
                                    style={{ width: 16 * screenWidth, height: 16 * screenWidth }}
                                />
                            </TouchButton>
                            <Spacer width={20} />
                        </>
                    )}
                    <SingleLineInput
                        value={searchText}
                        placeholder={placeholder}
                        onChangeText={text => onChangeSearchText(text)}
                    />
                    <TouchButton onPress={onPressDeleteText} paddingHorizontal={18 * screenWidth}>
                        <Icons type="ionicons" name="close-circle" size={24} color="#00000075" />
                    </TouchButton>
                </View>
            </View>

            <Spacer height={20} />

            {isHome && !searchText ? (
                <>
                    <View style={{ paddingHorizontal: 16 * screenWidth }}>
                        <NormalText text="최근검색" size={14} color="#757575" />
                    </View>
                    <FlatList
                        keyExtractor={keyExtractor}
                        data={searchHistory}
                        renderItem={renderItemHistory}
                        showsVerticalScrollIndicator={false}
                        onEndReachedThreshold={0.7}
                        onEndReached={({ distanceFromEnd }) => {
                            if (distanceFromEnd > 0) {
                                getNextPageResults();
                            }
                        }}
                        contentContainerStyle={{ paddingBottom: 200 * screenHeight }}
                        keyboardDismissMode="on-drag"
                    />
                </>
            ) : (
                <FlatList
                    keyExtractor={keyExtractor}
                    data={searchText ? resultsData : resultsNearData}
                    renderItem={renderItemResult}
                    showsVerticalScrollIndicator={false}
                    onEndReachedThreshold={1}
                    onEndReached={() => {
                        getNextPageResults();
                    }}
                    contentContainerStyle={{ paddingBottom: 200 * screenHeight }}
                    keyboardDismissMode="on-drag"
                />
            )}
        </View>
    );
};

export default SearchLocation;
