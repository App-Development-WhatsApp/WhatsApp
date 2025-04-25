import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllUsers } from "@/Database/ChatQuery";
// import {
//     saveCommunityUsers,
//     loadCommunityUsers,
//     deleteCommunityFromJson,
// } from "../../utils/communityStorage";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useLayoutEffect } from 'react';
import { getUser } from "@/Services/LocallyData";
import { UserItem } from "@/types/ChatsType";

export default function CommunityScreen() {
    const { name, photo, description } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Create Community',
            headerStyle: { backgroundColor: '#25292e' },
            headerTintColor: '#fff',
            headerShadowVisible: false,
        });
    }, [navigation]);

    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([]);
    const [showAddUserTab, setShowAddUserTab] = useState(false);
    const userData = useRef(null)

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
        const loadSavedUsers = async () => {
            // const saved = await loadCommunityUsers(name);
            // if (saved) setGroups(saved);
        };
        loadSavedUsers();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            const filteredUsers = users.filter(
                (user: UserItem) => user.jid !== userData.current._id
            );
            setUsers(filteredUsers);
        };
        if (showAddUserTab && userData.current) fetchUsers();
    }, [showAddUserTab]);

    const toggleSelectUser = (user: UserItem) => {
        setSelectedUsers((prev: any) =>
            prev.find((u: any) => u.jid === user.jid)
                ? prev.filter((u: any) => u.jid !== user.jid)
                : [...prev, user]
        );
    };

    const renderUserItem = ({ item }: { item: UserItem }) => (
        <TouchableOpacity
            onPress={() => toggleSelectUser(item)}
            style={styles.userItem}
        >
            <Image
                source={
                    item.image
                        ? { uri: item.image }
                        : require("../../assets/images/icon.png")
                }
                style={styles.avatar}
            />
            <Text style={styles.name}>{item.name}</Text>
            {selectedUsers.find((u) => u.jid === item.jid) && (
                <Text style={styles.check}>✓</Text>
            )}
        </TouchableOpacity>
    );

    const handleAddChats = () => {
        setShowAddUserTab(true);
    };

    const handleDone = async () => {
        setGroups(selectedUsers);
        setShowAddUserTab(false);
        await saveCommunityUsers(name, selectedUsers);
    };

    const handleDeleteCommunity = () => {
        Alert.alert("Delete Community", "Are you sure you want to delete this community?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await deleteCommunityFromJson(name);
                    router.back();
                },
            },
        ]);
    };

    const openChat = (user: any, isAnnouncement: any = false) => {
        router.push({
            pathname: "/Community",
            params: {
                user: JSON.stringify(user),
                isAnnouncement,
                communityName: name,
            },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    {photo ? (
                        <Image source={{ uri: photo || "" }} style={styles.image} />
                    ) : (
                        <Ionicons name="people" size={50} color="white" />
                    )}
                </View>
                <View>
                    <Text style={styles.title}>{name}</Text>
                    <Text style={styles.subtitle}>Community · {groups.length + 1} members</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Groups you're in</Text>

            <TouchableOpacity
                style={styles.groupRow}
                onPress={() =>
                    openChat({ _id: "announcement", username: "Announcements" }, true)
                }
            >
                <View style={[styles.groupIcon, { backgroundColor: "#25D366" }]}>
                    <Ionicons name="megaphone" size={24} color="white" />
                </View>
                <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>Announcements</Text>
                </View>
            </TouchableOpacity>

            {groups.length > 0 ? (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => item.jid}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.groupRow}
                            onPress={() => openChat(item)}
                        >
                            <View style={styles.groupIcon}>
                                <Ionicons name="people" size={30} color="white" />
                            </View>
                            <View style={styles.groupInfo}>
                                <Text style={styles.groupName}>{item.username}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 90 }}
                />
            ) : (
                <Text style={styles.noGroupsText}>No users selected yet</Text>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddChats}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Chats</Text>
            </TouchableOpacity>

            <Modal visible={showAddUserTab} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Select participants</Text>
                        <FlatList
                            data={users}
                            renderItem={renderUserItem}
                            keyExtractor={(item:UserItem) => item.jid}
                        />
                        <TouchableOpacity
                            style={[styles.nextBtn, { opacity: selectedUsers.length ? 1 : 0.5 }]}
                            onPress={handleDone}
                            disabled={!selectedUsers.length}
                        >
                            <Text style={styles.nextText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#25292e" },
    topHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    iconBox: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: "#2e2e2e",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    image: { width: 60, height: 60, borderRadius: 12 },
    title: { fontSize: 20, fontWeight: "bold", color: "white" },
    subtitle: { fontSize: 14, color: "#aaa", marginTop: 2 },
    sectionTitle: {
        fontSize: 14,
        color: "#aaa",
        marginTop: 30,
        marginBottom: 10,
        marginLeft: 20,
    },
    groupRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomColor: "#2a2a2a",
        borderBottomWidth: 1,
    },
    groupIcon: {
        backgroundColor: "#2e2e2e",
        borderRadius: 25,
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    groupInfo: { flex: 1 },
    groupName: { fontSize: 16, color: "white", fontWeight: "bold" },
    noGroupsText: { color: "#aaa", fontSize: 16, marginLeft: 20, marginTop: 10 },
    addButton: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#25D366",
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContent: {
        backgroundColor: "#121212",
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    userItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    name: { color: "white", fontSize: 16, flex: 1 },
    check: { color: "green", fontSize: 18 },
    nextBtn: {
        backgroundColor: "#007b5f",
        padding: 15,
        alignItems: "center",
        borderRadius: 10,
        marginTop: 10,
    },
    nextText: { color: "white", fontSize: 16 },
});