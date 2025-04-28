import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GetCallHistoryByUser, GetUsersInCalls } from "@/Database/ChatQuery"; // Assuming this fetches users from the database
import { UserItem, UserWithCallDetails } from "@/types/ChatsType";
import { useFocusEffect, useRouter } from "expo-router";

const CallsScreen = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithCallDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserWithCallDetails | null>(
    null
  );
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const fetchCalls = async () => {
      try {
        const data: UserWithCallDetails[] = await GetUsersInCalls();
        console.log("data", data);

        const enrichedUsers = await Promise.all(
          data.map(async (user) => {
            try {
              const history = await GetCallHistoryByUser(user.jid);
              if (history.length > 0) {
                const latestCall = history.sort(
                  (a: any, b: any) =>
                    new Date(b.start_time).getTime() -
                    new Date(a.start_time).getTime()
                )[0];
                return { ...user, last_call_time: latestCall.start_time };
              }
              return { ...user, last_call_time: null };
            } catch {
              return { ...user, last_call_time: null };
            }
          })
        );

        const sortedUsers = enrichedUsers.sort((a, b) => {
          if (!a.last_call_time || !b.last_call_time) return 0;
          return (
            new Date(b.last_call_time).getTime() -
            new Date(a.last_call_time).getTime()
          );
        });

        setUsers(sortedUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, []);

  useFocusEffect(
    useCallback(() => {
      GetUsersInCalls();
    }, [])
  );

  const openHistoryModal = async (user: UserWithCallDetails) => {
    setSelectedUser(user);
    setModalVisible(true);
    setHistoryLoading(true);
    try {
      const history = await GetCallHistoryByUser(user.jid);

      // 🔥 Sort the history here
      const sortedHistory = history.sort(
        (a: any, b: any) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      setCallHistory(sortedHistory);
    } catch (error) {
      console.error("Error fetching call history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCalling = async (user: UserItem) => {
    console.log("Calling");
    router.push({
      pathname: "/call",
      params: {
        User: JSON.stringify(user), // Must be stringified if object
      },
    });
  };

  if (loading || users.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>
          {loading ? "Loading..." : "No calls found"}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: UserWithCallDetails }) => (
    <TouchableOpacity
      key={item.jid}
      style={styles.callItem}
      onPress={() => openHistoryModal(item)}
    >
      <Image
        source={{ uri: item.image || "https://example.com/avatar.jpg" }}
        style={styles.avatar}
      />
      <View style={styles.callInfo}>
        <Text style={styles.name}>{item.name || "Unknown User"}</Text>
        {item.last_call_type && (
          <View style={styles.callDetails}>
            <MaterialIcons
              name={item.last_call_type === "voice" ? "phone" : "video-call"}
              size={16}
              color={
                item.last_call_status === "rejected"
                  ? "red"
                  : item.last_call_status === "accepted"
                  ? "green"
                  : "orange"
              }
            />
            <Text style={styles.callStatus}>{item.last_call_status}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() =>
          handleCalling({
            id: item.id,
            jid: item.jid,
            name: item.name,
            image: item.image,
            phone: item.phone,
          })
        }
      >
        {item.last_call_type === "voice" ? (
          <Ionicons name="call-outline" size={28} color="green" />
        ) : (
          <MaterialIcons name="video-call" size={30} color="green" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.jid}
        contentContainerStyle={styles.list}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
          style={styles.modalBackground}
        >
          <TouchableOpacity activeOpacity={1} style={styles.bottomDrawer}>
            <View style={styles.handleBar} />
            <Text style={styles.modalTitle}>
              {selectedUser?.name}'s Call History
            </Text>
            {historyLoading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : callHistory.length === 0 ? (
              <Text style={styles.noHistoryText}>No call history found.</Text>
            ) : (
              <FlatList
                data={callHistory}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.historyItem}>
                    <MaterialIcons
                      name={item.call_type === "voice" ? "phone" : "video-call"}
                      size={20}
                      color={
                        item.call_status === "rejected"
                          ? "red"
                          : item.call_status === "accepted"
                          ? "green"
                          : "orange"
                      }
                      style={styles.callIcon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyText}>
                        {item.call_type === "voice"
                          ? "Voice Call"
                          : "Video Call"}
                      </Text>
                      <Text style={styles.callSubText}>
                        {item.call_status} •{" "}
                        {new Date(item.start_time).toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 16,
  },
  loading: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  callItem: {
    backgroundColor: "#1e1e1e",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "gray",
  },
  callInfo: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  callDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  callStatus: {
    color: "gray",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomDrawer: {
    backgroundColor: "#222", // modern dark
    width: "100%",
    height: "75%", // slight reduction
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: "#666",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingText: {
    color: "gray",
    textAlign: "center",
  },
  noHistoryText: {
    color: "gray",
    textAlign: "center",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  callIcon: {
    marginRight: 15,
  },
  historyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  callSubText: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 2,
  },
});

export default CallsScreen;
