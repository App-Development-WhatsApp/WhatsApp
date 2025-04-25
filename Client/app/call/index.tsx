import { getUser } from '@/Services/LocallyData';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '@/Context/SocketContext';

export default function CallScreen() {
  const { User } = useLocalSearchParams();
  const parsedUser = User ? JSON.parse(User as string) : null;
  const router = useRouter();
  const userData = useRef<any | null>(null);
  const { sendIncomingCall, RegisterAcceptCall, RegisterRejectCall, sendCancelCall } = useSocket();
  
  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (!user) {
        router.push('/login');
      }
      userData.current = user;
      if (parsedUser && userData.current) {
        sendIncomingCall(userData.current._id, userData.current.username, userData.current.image, parsedUser.id);
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

    RegisterRejectCall((callerId: string) => {
      router.canGoBack() && router.back();
    });
  }, []);

  const HandleCancel = () => {
    if (parsedUser && userData.current) {
      sendCancelCall(userData.current._id, parsedUser.id);
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
          <TouchableOpacity style={styles.cancelButton} onPress={HandleCancel}>
            <Text style={styles.cancelText}>Cancel Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e', // Dark background similar to WhatsApp
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  phone: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#32CD32', // WhatsApp's green color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cancelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
