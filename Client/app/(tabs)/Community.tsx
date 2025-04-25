import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { deleteCommunityById, getAllCommunities } from "@/Database/ChatQuery";
import { CommunityItem } from "@/types/ChatsType";

export default function Communities() {
  const communities = useRef<CommunityItem[]>([]);
  const router = useRouter();

  const loadCommunities = async () => {
    try {
      const community_info: CommunityItem[] = await getAllCommunities();
      communities.current = community_info;
    } catch (error) {
      console.error("Error loading communities:", error);
    }
  };

  const deleteCommunity = ({ indexToDelete }: { indexToDelete: any }) => {
    Alert.alert(
      "Delete Community",
      "Are you sure you want to delete this community?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteCommunityById(communities.current[indexToDelete].id);
            if (result) {
              communities.current.splice(indexToDelete, 1);
              console.log("Community deleted successfully");
            } else {
              console.log("Failed to delete community");
            }
          },
        },
      ]
    );
  };


  useEffect(() => {
    loadCommunities();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCommunities();
    }, [])
  );

  const renderCommunity = ({ item, index }: { item: any, index: any }) => (
    <TouchableOpacity
      onPress={() =>
        // Here open chat Box at bottom to write message to community
        console.log("Open community chat box")
      }
    >
      <View style={styles.communityBox}>
        <View style={styles.communityHeader}>
          {item.image ? (
            <Image source={{ uri: item.photo }} style={styles.communityImage} />
          ) : (
            <Ionicons name="people" size={32} color="white" style={styles.communityIcon} />
          )}
          <Text style={styles.communityTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity style={styles.threeDots} onPress={() => deleteCommunity(index)}>
            <MaterialIcons name="more-vert" size={24} color="#aaa" />
          </TouchableOpacity>
        </View>

        <View style={styles.messageBox}>
          <View style={styles.messageRow}>
            <MaterialIcons name="campaign" size={20} color="#00A884" />
            <Text style={styles.messageTitle}>Announcements</Text>
            <Text style={styles.time}>3:15 am</Text>
          </View>
          <Text style={styles.messageSubtitle} numberOfLines={1}>
            {item.description || "Welcome to your community!"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.newCommunity}
        onPress={() => router.push("/Communities/CreateCommunity")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={24} color="white" />
          <View style={styles.addIcon}>
            <Ionicons name="add" size={16} color="white" />
          </View>
        </View>
        <Text style={styles.newCommunityText}>New community</Text>
      </TouchableOpacity>

      <FlatList
        data={communities.current}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCommunity}
        contentContainerStyle={communities.current.length === 0 && { flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={{ color: "#888", textAlign: "center", marginTop: 50 }}>
              No communities yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { color: "white", fontSize: 24, fontWeight: "bold" },
  icons: { flexDirection: "row" },
  icon: { marginLeft: 16 },
  newCommunity: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  iconContainer: {
    position: "relative",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3E3E3E",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#00A884",
    borderRadius: 10,
    padding: 2,
  },
  newCommunityText: { color: "white", fontSize: 18, marginLeft: 16 },
  emptyContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  communityBox: {
    backgroundColor: "#1F1F1F",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  communityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'gray'
  },
  communityIcon: { marginRight: 12 },
  communityTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  threeDots: {
    padding: 8,
  },
  messageBox: { paddingLeft: 6, marginBottom: 8 },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageTitle: { color: "white", fontWeight: "bold", flex: 1, marginLeft: 8 },
  messageSubtitle: { color: "#ccc", marginLeft: 28 },
  time: { color: "#aaa", fontSize: 12 },
});