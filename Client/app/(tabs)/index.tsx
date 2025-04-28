import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef, useCallback  } from "react";
import { getUser } from "@/Services/LocallyData";
import { getAllUsers, getChats } from "@/Database/ChatQuery";
import { ChatItem } from "@/types/ChatsType";
import showToast from "@/utils/ToastHandler";

export default function Chat() {
  const router = useRouter();
  const netInfo = useNetInfo();

  const loading = useRef(false);
  const userData = useRef(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  // const [selectedTab, setSelectedTab] = useState("All");
  // const tabs = ["All", "Unread", "+"];


  const dataFetchedRef = useRef(false);

  const fetchChats = async () => {
    loading.current = true;
    // console.log('Fetching chats...', userData.current);
    const Chats: ChatItem[] = await getChats(userData.current._id);
    setChats(Chats);
    setFilteredChats(Chats);
    loading.current = false;
    dataFetchedRef.current = true;
  };

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push("/login");
      }
      // showToast('success', 'top', `Hi ${user.username}`, 'Wellcome to Chat Screen');
      userData.current = user;
    };
    if (!userData.current) {
      checkUser();
    }
    fetchChats();
    const intervalId = setInterval(() => {
      fetchChats();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );
  

  const handleSearch = async (searchValue: string) => {
    setSearchText(searchValue);
    if (searchValue.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filteredData = chats.filter((chat: ChatItem) =>
        (chat.name ?? "").toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredChats(filteredData);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { day: "numeric", month: "short" });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0e0e10" barStyle="light-content" />

      <View style={styles.searchCtn}>
        <Feather
          name="search"
          size={20}
          color="#aaa"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInp}
          placeholder="Search chats or Ask Meta AI..."
          placeholderTextColor="#777"
          onChangeText={handleSearch}
          value={searchText}
        />
      </View>

      {/* <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              selectedTab === tab && tab !== "+" && styles.selectedTabItem,
            ]}
            onPress={() => {
              if (tab === "+") {
                console.log("Add list");
              } else {
                setSelectedTab(tab);
                if (tab === "All") {
                  setFilteredChats(chats);
                } else if (tab === "Unread") {
                  const unreadChats = chats.filter((chat) => chat.unread_count > 0);
                  setFilteredChats(unreadChats);
                }
              }
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && tab !== "+" && styles.selectedTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {loading.current ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5efc82" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: ChatItem }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "/chat/[id]",
                  params: { id: item.jid },
                })
              }
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.image || "" }}
                style={styles.profileImage}
              />

              <View style={styles.chatDetails}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.chatTime}>{formatTime(item.last_message_time)} </Text>
                </View>

                <View style={styles.chatBottomRow}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {item.last_message}
                  </Text>

                  {item.unread_count !== 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread_count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => `chat-${item.jid || index}`}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      ) : (
        <Text style={styles.emptyText}>
          No chats yet. Start a new conversation!
        </Text>
      )}

      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => router.push("/Contacts")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="message-plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  searchCtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1d",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: "#5efc82",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInp: {
    flex: 1,
    fontSize: 16,
    color: "#e0e0e0",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tabItem: {
    backgroundColor: "#1a1a1d",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
  },
  selectedTabItem: {
    backgroundColor: "#25D366",
  },
  tabText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedTabText: {
    color: "#000",
    fontWeight: "600",
  },  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f23",
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#333",
  },
  chatDetails: {
    flex: 1,
    marginLeft: 12,
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    maxWidth: "70%",
  },
  chatTime: {
    fontSize: 12,
    color: "#aaa",
  },
  chatBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: "#ccc",
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: "#25D366",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  newChatButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 65,
    height: 65,
    backgroundColor: "#25D366",
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5efc82",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
