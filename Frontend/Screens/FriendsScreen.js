import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Button,
    StyleSheet,
    Modal,
    RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

import MainLogo from '../styles/mainLogo';
import {MenuButton} from '../styles/accountButton';
import {
    ButtonContainer,
    FContainer,
    InputTxt,
    Main,
    FSButtonContainer,
    AddFriendButton,
    WrapperScroll, AccountContainer,
    ModalContent, SearchBox
} from '../styles/styles';
import {
    AccountTxtWrapper,
} from '../styles/accountPage';
import {jwtDecode} from "jwt-decode";
import {H3, H4, H5, H6} from "../styles/text";
import {SearchButtons} from '../styles/buttons2';
import {AnimatedGenericButton, ButtonButton} from "../styles/AnimatedIconButton";


const apiKey = process.env.REACT_NATIVE_API_KEY;
const url = process.env.REACT_APP_BACKEND_URL

const FriendsScreen = () => {
    const [friends, setFriends] = useState([]);
    const [requestedFriends, setRequestedFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchModalVisible, setSearchModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasRequestedFriends = requestedFriends.length > 0;

    const [refreshing, setRefreshing] = useState(false);

    console.log(url)

    const fetchFriends = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const user1 = jwtDecode(token).sub;

            const config = {
                headers: {
                    'X-API-Key': apiKey,
                },
            };

            const response = await axios.post(
                `${url}/list_friends`,
                {phone_number: user1},
                config
            );

            if (response.data && response.data.friends) {
                setFriends(response.data.friends);
            }

        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFriends();
        await fetchRequestedFriends();
        setRefreshing(false);
    };

    const fetchRequestedFriends = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const user1 = jwtDecode(token).sub;

            const config = {
                headers: {
                    'X-API-Key': apiKey,
                },
            };

            const response = await axios.post(
                `${url}/requested_friends`,
                {phone_number: user1},
                config
            );

            if (response.data && response.data.requested_friends) {
                setRequestedFriends(response.data.requested_friends);
            }

        } catch (error) {
            console.error('Error fetching requested friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const openSearchModal = () => {
        setSearchModalVisible(true);
    };

    const closeSearchModal = () => {
        setSearchModalVisible(false);
    };

    const searchUsers = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            const phone = jwtDecode(token).sub;

            const response = await axios.post(
                `${url}/search_users`,
                {
                    phone_number: phone,
                    search_term: searchTerm,
                },
                {
                    headers: {
                        'X-API-Key': apiKey,
                    },
                }
            );

            setSearchResults(response.data.users);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleSearch = async (text) => {
        setSearchTerm(text);
        searchUsers();
    };

    const handleDeleteFriend = (friendId) => {
        console.log(`Deleting friend with ID: ${friendId}`);
    };

    const handleMakeFriend = async (friendId) => {
        try {
            console.log(`Making friend with ID: ${friendId}`);
            const token = await AsyncStorage.getItem('token');

            const phone = jwtDecode(token).sub;

            const response = await axios.post(
                `${url}/send_friend_request`,
                {
                    phone_number: phone,
                    friend_number: friendId,
                },
                {
                    headers: {
                        'X-API-Key': apiKey,
                    },
                }
            );

        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const decideFriend = async (requestId, action) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const phone = jwtDecode(token).sub;

            const response = await axios.post(
                `${url}/respond_friend_request`,
                {
                    phone_number: phone,
                    request_id: requestId,
                    action: action,
                },
                {
                    headers: {
                        'X-API-Key': apiKey,
                    },
                }
            );

            console.log(response.data.message);
            onRefresh();

        } catch (error) {
            console.error('Error responding to friend request:', error);
            // Handle errors as needed
        }
    };

    useEffect(() => {
        fetchFriends();
        fetchRequestedFriends()
    }, []);

    return (
        <Main>
            <MainLogo PageTxt='Friends'/>
            <WrapperScroll refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                />
            }>
                <AccountContainer style={{minHeight: 800}}>
                    <H3 tmargin='20px' lmargin='10px' bmargin='5px'>Friends</H3>
                    <ButtonContainer style={{position: 'absolute', marginTop: 15}}>
                        <View style={{zIndex: 1, marginLeft: 'auto', marginRight: 0}}>
                            <ButtonButton text="Add Friends" onPress={openSearchModal}/>
                        </View>
                    </ButtonContainer>
                    <AccountTxtWrapper>
                        <Modal
                            animationType="fade"
                            transparent={true}
                            visible={isSearchModalVisible}
                            onRequestClose={closeSearchModal}
                        >
                            <View style={styles.modalContainer}>
                                <ModalContent>
                                    <H4 bmargin="20px">Add Friends</H4>
                                    <ButtonContainer style={{position: 'absolute', marginTop: 10, marginLeft: 20}}>
                                        <View style={{zIndex: 1, marginLeft: 'auto', marginRight: 0}}>
                                            <ButtonButton icon="cross" color="" onPress={closeSearchModal}/>
                                        </View>
                                    </ButtonContainer>
                                    <SearchBox
                                        placeholder="Search Friends"
                                        value={searchTerm}
                                        onChangeText={handleSearch}
                                    />
                                    <H5 tmargin="40px">Results</H5>
                                    <FlatList
                                        data={searchTerm ? searchResults : friends}
                                        keyExtractor={(item) => item.user_id}
                                        renderItem={({item}) => (
                                            <View style={styles.friendItem}>
                                                <H6 weight="400" bmargin='5px'
                                                    style={{opacity: 0.5}}>{item.username}</H6>
                                                <TouchableOpacity
                                                    onPress={() => handleMakeFriend(item.phone_number)}>
                                                    <Text
                                                        style={[styles.addFriendButton, {color: "#6bff91"}]}>🫂Add</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                            />
                                        }
                                    />
                                </ModalContent>
                            </View>
                        </Modal>
                        {hasRequestedFriends && (
                            <AccountTxtWrapper>
                                <H5 tmargin='10px' bmargin='10px'>Added Me</H5>
                                <FlatList
                                    data={searchTerm ? searchResults : requestedFriends}
                                    keyExtractor={(item) => item.friend_id}
                                    renderItem={({item}) => (
                                        <View style={styles.friendItem}>
                                            <H6 weight="400" bmargin='5px'
                                                style={{opacity: 0.5}}>{item.friend_name}</H6>
                                            <View style={{zIndex: 1, marginLeft: 'auto', flexDirection: "row"}}>
                                                <ButtonButton text={"Accept"} color={"#6BFF91"}
                                                              onPress={() => decideFriend(item.request_id, 'accept')}/>
                                                <ButtonButton color={"#3891FA"}
                                                              text={"Deny"}
                                                              onPress={() => decideFriend(item.request_id, 'reject')}/>
                                            </View>

                                        </View>
                                    )}
                                />
                            </AccountTxtWrapper>
                        )}
                        <FlatList
                            data={friends}
                            keyExtractor={(item) => item.friend_id.toString()} // Assuming friend_id is a number
                            renderItem={({item}) => (
                                <View style={styles.friendItem} key={item.friend_id}>
                                    <H6 weight="400" bmargin='5px' style={{opacity: 0.5}}>{item.friend_name}</H6>
                                </View>
                            )}
                        />
                    </AccountTxtWrapper>
                </AccountContainer>
            </WrapperScroll>
        </Main>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
        paddingVertical: 8,
    },
    searchButton: {
        flex: 1,
        marginRight: 5,
        backgroundColor: '#6BFF91',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButton: {
        flex: 1,
        marginLeft: 5,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default FriendsScreen;
