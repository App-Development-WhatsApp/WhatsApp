import { getUser } from "@/Services/LocallyData";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useSocket } from "@/Context/SocketContext";
import { SaveCall, UpdateCallStatus } from "@/Database/ChatQuery";

export default function CallScreen() {
  const { User } = useLocalSearchParams();
  const parsedUser = User ? JSON.parse(User as string) : null;
  const router = useRouter();
  const navigation = useNavigation();
  const userData = useRef<any | null>(null);
  const callData = useRef<any | null>(null);
  const {
    sendIncomingCall,
    RegisterAcceptCall,
    RegisterRejectCall,
    sendCancelCall,
  } = useSocket();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push("/login");
      }
      userData.current = user;
      if (parsedUser && userData.current) {
        sendIncomingCall(
          userData.current._id,
          userData.current.username,
          userData.current.image,
          parsedUser.jid
        );
      }
    };
    if (!userData.current) {
      checkUser();
    }

    RegisterAcceptCall((callerId: string) => {
      router.push({
        pathname: "/call/acceptCall",
        params: { User },
      });
    });

    RegisterRejectCall(async (callerId: string) => {
      router.canGoBack() && router.back();
    });
  }, []);

  const HandleCancel = async () => {
    if (parsedUser && userData.current) {
      sendCancelCall(userData.current._id, parsedUser.jid);
    }
    router.canGoBack() && router.back();
  };

  return (
    <View style={styles.container}>
      {parsedUser && (
        <View style={styles.content}>
          <Image source={{ uri: parsedUser.image }} style={styles.avatar} />
          <Text style={styles.name}>{parsedUser.name}</Text>
          <Text style={styles.phone}>{parsedUser.phone}</Text>
          <Text style={styles.status}>Ringing...</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={HandleCancel}>
            <Text style={styles.cancelText}>Decline Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e", // WhatsApp green background
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 30,
    backgroundColor: "#25292e", // Dark overlay
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: "#fff", // White border
    marginBottom: 20,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  name: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 8,
  },
  phone: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 30,
    fontStyle: "italic",
  },
  cancelButton: {
    backgroundColor: "#F44336", // WhatsApp red decline button
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 12,
    transform: [{ scale: 1.05 }],
    transition: "all 0.3s ease",
  },
  cancelText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
