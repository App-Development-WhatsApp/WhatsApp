import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
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

  useEffect(() => {
    setLoading(true);
    const fetchCalls = async () => {
      try {
        const data: UserWithCallDetails[] = await GetUsersInCalls();
        console.log("data", data);
        setUsers(data); // Set users fetched from the database

        // const temp=await GetCallHistoryByUser("680e0ebb4d18a7c0b4cac9ca");
        // console.log(temp)
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
    <TouchableOpacity key={item.jid} style={styles.callItem}>
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
});

export default CallsScreen;
