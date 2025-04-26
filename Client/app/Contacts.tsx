import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Linking,
    Alert,
} from 'react-native';
import { getAllUsers } from '@/Database/ChatQuery';
import { useNetInfo } from '@react-native-community/netinfo';

import * as Contact from 'expo-contacts';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { getUser } from '@/Services/LocallyData';
import { UserItem } from '@/types/ChatsType';
import { getAllUsersFromDatabase } from '@/Services/Api';

export default function Contacts() {
    const router = useRouter();
    const navigation = useNavigation();
    const netInfo = useNetInfo();
    const userData = useRef(null);
    const [loading, setLoading] = useState(false);
    const [appUsers, setAppUsers] = useState<any[]>([]);
    const [nonAppUsers, setNonAppUsers] = useState<any[]>([]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Select Contact',
            headerStyle: { backgroundColor: '#25292e' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
            headerRight: () => (
                <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
                    <TouchableOpacity onPress={() => console.log('Search pressed in Updates')}>
                    <Ionicons name="search" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    const normalizePhoneNumber = (num: string) => {
        return num.replace(/\D/g, '').replace(/^0+/, '');
    };

    useEffect(() => {
        const checkUser = async () => {
            const user = await getUser();
            if (!user) {
                router.push('/login');
            }
            userData.current = user;
        };
        if (!userData.current) {
            checkUser();
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const [usersFromDB, contactsRes] = await Promise.all([
                    getAllUsersFromDatabase(),
                    Contact.requestPermissionsAsync().then(async ({ status }) => {
                        if (status === 'granted') {
                            const { data } = await Contact.getContactsAsync({
                                fields: [Contact.Fields.PhoneNumbers],
                            });
                            return data || [];
                        }
                        return []
                    }),
                ]);
                if (!usersFromDB.success) {
                    Alert.alert(usersFromDB.message, "usersFromDB")
                }
                const contactMap: any = {};

                const formattedContacts = contactsRes.flatMap((contact) => {
                    return (contact.phoneNumbers || []).map(numObj => {
                        const phone = normalizePhoneNumber(numObj.number || "");
                        contactMap[phone] = {
                            name: contact.name,
                            number: phone,
                        };
                        return phone;
                    })
                });

                const appUserList = [];
                const nonAppUserList: any = [];

                if (usersFromDB.success) {
                    usersFromDB.users.forEach((user: { _id: string, username: string, phoneNumber: string, image: string }) => {
                        const phone = normalizePhoneNumber(user.phoneNumber);
                        if (contactMap[phone]) {
                            appUserList.push({
                                ...user,
                                username: contactMap[phone].name, // overwrite username with contact name
                                number: phone,
                            });
                            delete contactMap[phone];
                        }
                    });
                }

                Object.values(contactMap).forEach((nonUser) => {
                    nonAppUserList.push(nonUser);
                });

                setAppUsers(usersFromDB.users);
                setNonAppUsers(nonAppUserList);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (netInfo.isConnected) {
            fetchData();
        }
    }, [netInfo.isConnected]);

    const handleChatPress = (user: any) => {
        router.push(`/chat/${user._id}`);
        // router.push({ pathname: "/chat/[id]", params: { id: user._id } })
    };

    const inviteUser = (number: any) => {
        const message = `Hey! I'm using our Chat App. Join me here! [Link to app]`;
        const smsUrl = `sms:${number}?body=${encodeURIComponent(message)}`;
        Linking.openURL(smsUrl);
    };

    const ActionButton = ({ icon, text, rightIcon, onPress }: { icon: any, text: string, rightIcon: any, onPress: any }) => (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <View style={styles.iconWrap}>{icon}</View>
            <Text style={styles.actionText}>{text}</Text>
            {rightIcon && <View style={styles.qrWrap}>{rightIcon}</View>}
        </TouchableOpacity>
    );

    const ContactItem = ({ user, isAppUser }: { user: any, isAppUser: Boolean }) => {
        const validImage = isAppUser && user.image
            ? { uri: user.image }
            : require('../assets/images/icon.png');
        return (
            <TouchableOpacity
                key={user.jid}
                disabled={!isAppUser}
                onPress={() =>
                    isAppUser
                        ? handleChatPress(user)
                        : inviteUser(user.phone)
                }>
                <View style={styles.userCtn}>
                    <Image
                        style={styles.image}
                        source={validImage}
                        borderRadius={50}
                        resizeMode="cover"
                    />
                    <View style={styles.msgCtn}>
                        <Text style={styles.name}>{isAppUser ? user.username : user.name}</Text>
                        <Text style={styles.subtext}>{isAppUser ? user.phoneNumber : user.phone}</Text>
                    </View>
                    {!isAppUser && (
                        <TouchableOpacity onPress={() => inviteUser(user.phone)}>
                            <Text style={styles.inviteBtn}>Invite</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text style={styles.loadingText}>Fetching contacts...</Text>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.actionsContainer}>
                        <ActionButton
                            icon={<Ionicons name="people" size={24} color="white" />}
                            text="New group"
                            rightIcon={<MaterialIcons name="qr-code" size={18} color="white" />}
                            onPress={() => { }}
                        // onPress={() => navigation.navigate("CreateGroup")}
                        />
                        <ActionButton
                            icon={<Ionicons name="person-add" size={24} color="white" />}
                            text="New contact"
                            rightIcon={<MaterialIcons name="qr-code" size={18} color="white" />}
                            onPress={() => { }}
                        />
                    </View>

                    <Text style={styles.contactsLabel}>Contacts on ChatApp</Text>
                    <FlatList
                        data={appUsers}
                        renderItem={({ item }) => <ContactItem user={item} isAppUser={true} />}
                        keyExtractor={(item) => item._id}
                        scrollEnabled={false}
                    />

                    <Text style={styles.contactsLabel}>Invite to ChatApp</Text>
                    <FlatList
                        data={nonAppUsers}
                        renderItem={({ item }) => <ContactItem user={item} isAppUser={false} />}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                    />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#25292e',
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    topTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    topSubtitle: {
        color: '#bbb',
        fontSize: 12,
    },
    topIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactsLabel: {
        color: '#aaa',
        fontSize: 13,
        marginVertical: 10,
    },
    userCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionsContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        backgroundColor: '#007b5f',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    qrWrap: {
        marginLeft: 10,
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    msgCtn: {
        marginLeft: 10,
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 17,
        color: 'white',
    },
    subtext: {
        fontSize: 13,
        color: '#aaa',
    },
    image: {
        width: 55,
        height: 55,
    },
    inviteBtn: {
        backgroundColor: 'green',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        fontSize: 14,
        marginRight: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#cbd5c0',
        fontSize: 16,
  },
});