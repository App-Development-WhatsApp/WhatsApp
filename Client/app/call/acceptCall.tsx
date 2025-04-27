import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getUser } from "@/Services/LocallyData";
import { useSocket } from "@/Context/SocketContext";

export default function ActiveCallScreen() {
  const { sendCallEnded, RegisterCallEnded, UnregisterCallEnded } = useSocket();
  const { User } = useLocalSearchParams();
  const parsedUser = User ? JSON.parse(User as string) : null;
  const router = useRouter();
  const navigation = useNavigation();
  const userData = useRef<any | null>(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(0); // store seconds for reference

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        timerRef.current = prev + 1; // update the ref with each tick
        return timerRef.current;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push("/login");
      } else {
        userData.current = user;
      }
    };
    fetchUser();
  }, []);
  useEffect(() => {
    const cutted = () => {
      console.log("Call cut by the other user");
      router.canGoBack() && router.back();
    };
    RegisterCallEnded(cutted);
    return () => {
      UnregisterCallEnded(cutted);
    };
  }, []);
  const HandleCallEnded = async () => {
    if (parsedUser && userData.current) {
      sendCallEnded(userData.current._id, parsedUser.jid, timerRef.current);
    }
    router.replace("/(tabs)/Call");
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(seconds)} </Text>

      {parsedUser && (
        <>
          <Image source={{ uri: parsedUser.image }} style={styles.avatar} />
          <Text style={styles.name}>{parsedUser.name}</Text>
        </>
      )}

      <Text style={styles.vsText}>In Call With</Text>

      {userData.current && (
        <>
          <Image
            source={{ uri: userData.current.image }}
            style={styles.avatarSmall}
          />
          <Text style={styles.nameSmall}>{userData.current.username}</Text>
        </>
      )}

      <TouchableOpacity style={styles.endCallButton} onPress={HandleCallEnded}>
        <Text style={styles.endCallText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    fontSize: 30,
    color: "#00FFAA",
    marginBottom: 30,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 10,
  },
  avatarSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 10,
  },
  name: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  nameSmall: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
  },
  vsText: {
    color: "#888",
    marginVertical: 10,
    fontSize: 16,
  },
  endCallButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 30,
    marginTop: 40,
  },
  endCallText: {
    color: "#fff",
    fontSize: 18,
  },
});
